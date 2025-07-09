import torch
import torchvision.transforms as transforms
from PIL import Image
from flask import Flask, request, jsonify
from MedViT import MedViT_large
from medmnist import INFO
import medmnist
import os
import uuid
from flask_cors import CORS
from google.genai import types, Client
import json
import re 
# Initialize Google Gemini client
client = Client(api_key="your api key")

app = Flask(__name__)
CORS(app) 

# === DEVICE ===
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# === VALID CATEGORIES ===
VALID_CATEGORIES = [
    "tissuemnist", "pathmnist", "chestmnist", "dermamnist",
    "octmnist", "pnemoniamnist", "retinamnist", "breastmnist",
    "bloodmnist", "organamnist", "organcmnist", "organsmnist", 
    "other"  # Added "other" category for general medical image analysis
]

# Create temp directory for storing images
TEMP_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'temp_images')
if not os.path.exists(TEMP_FOLDER):
    os.makedirs(TEMP_FOLDER)

# === IMAGE TRANSFORM ===
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.Lambda(lambda img: img.convert("RGB")),
    transforms.ToTensor(),
    transforms.Normalize(mean=[.5, .5, .5], std=[.5, .5, .5])
])

@app.route('/api/predict', methods=['POST'])
def predict():
    if 'image' not in request.files or 'category' not in request.form:
        return jsonify({'error': 'Missing image or category'}), 400

    category = request.form['category'].lower()
    if category not in VALID_CATEGORIES:
        return jsonify({'error': f'Invalid category. Choose from: {", ".join(VALID_CATEGORIES)}'}), 400

    image_file = request.files['image']
    temp_path = None
    
    try:
        img_pil = Image.open(image_file)
        
        # Save image to a temporary file for Gemini API
        temp_path = os.path.join(TEMP_FOLDER, f"{uuid.uuid4()}.jpg")
        img_pil.save(temp_path)
        
        # Read image bytes for Gemini API
        with open(temp_path, 'rb') as f:
            img_bytes = f.read()
        
        # Handle "other" category separately with Gemini API
        if category == "other":
            # First verify if it's a medical image at all
            verification_prompt = """
            Is this a medical image related to human disease or diagnosis?
            If this is NOT a medical diagnostic image (like an X-ray, CT scan, MRI, microscope image, ultrasound, etc.), 
            respond with 'INVALID'.
            Otherwise, if it's any kind of medical diagnostic image, respond with 'VALID'.
            
            Respond with ONLY 'VALID' or 'INVALID', no other text.
            """
            
            try:
                verification_response = client.models.generate_content(
                    model='gemini-2.0-flash',
                    contents=[
                        types.Part.from_bytes(data=img_bytes, mime_type='image/jpeg'),
                        verification_prompt
                    ]
                )
                
                if "INVALID" in verification_response.text.upper():
                    return jsonify({
                        'predicted_label': {"label": "None", "confidence": 0.0},
                        'error': "The uploaded image does not appear to be a medical diagnostic image."
                    })
                
                # If valid, analyze the image to identify what type it is and possible conditions
                analysis_prompt = """
                You are a medical imaging expert. Analyze this medical image and provide the following information:
                
                1. What type of medical image is this? (X-ray, CT scan, MRI, microscope, ultrasound, etc.)
                2. Which body part or organ does it show?
                3. What are 1-2 possible medical conditions or findings visible in this image?
                
                Format your answer as JSON with the following structure:
                {
                  "image_type": "type of scan/image",
                  "body_part": "specific body part/organ",
                  "possible_conditions": ["condition 1", "condition 2"]
                }
                
                Respond ONLY with the JSON, nothing else.
                """
                
                analysis_response = client.models.generate_content(
                    model='gemini-2.0-flash', # Changed back to flash for potentially faster/cheaper response, adjust if needed
                    contents=[
                        types.Part.from_bytes(data=img_bytes, mime_type='image/jpeg'),
                        analysis_prompt
                    ]
                )
                
                raw_text = analysis_response.text
                print(f"Raw Gemini Response:\n{raw_text}") # Print the raw response for debugging

                analysis_json = None
                error_message = None
                
                try:
                    # Attempt to find JSON block using regex (handles potential markdown)
                    json_match = re.search(r'```json\s*(\{.*?\})\s*```', raw_text, re.DOTALL)
                    if json_match:
                        json_str = json_match.group(1)
                    else:
                        # If no markdown block, assume the whole text might be JSON
                        json_str = raw_text.strip() 
                        
                    # Try parsing the extracted/cleaned string
                    analysis_json = json.loads(json_str)

                    # Extract conditions and format the label
                    conditions_list = analysis_json.get("possible_conditions", [])
                    if isinstance(conditions_list, list) and conditions_list:
                        # Join the list into a comma-separated string for the label
                        label_str = ", ".join(conditions_list) 
                    else:
                        label_str = "Analysis inconclusive" # Default label if conditions are missing/empty

                    # Return the Gemini API analysis with the formatted label
                    return jsonify({
                        'predicted_label': {
                            "label": label_str, # Use the joined string here
                            "confidence": 1.0 # Confidence is arbitrary for Gemini analysis
                        },
                        'gemini_analysis': analysis_json # Send the full parsed JSON analysis
                    })

                except json.JSONDecodeError as json_err:
                    error_message = f"Failed to parse Gemini response as JSON: {json_err}. Response was: {raw_text}"
                except Exception as e:
                    error_message = f"Error processing Gemini response: {str(e)}"

                # If parsing failed or another error occurred
                print(f"Error processing Gemini response: {error_message}")
                return jsonify({
                    'predicted_label': {"label": "Analysis Failed", "confidence": 0.0},
                    'error': error_message
                }), 500

            except Exception as e:
                # Handle errors during the Gemini API call itself
                print(f"Gemini API call error: {str(e)}")
                return jsonify({
                    'predicted_label': {"label": "API Error", "confidence": 0.0},
                    'error': f"Error calling Gemini API: {str(e)}"
                }), 500
        
        # For standard categories, proceed with original flow
        # Create description of what the category should contain
        category_descriptions = {
            "tissuemnist": "kidney tissue microscope images",
            "pathmnist": "pathology images of colon tissue",
            "chestmnist": "chest X-ray images",
            "dermamnist": "dermatology images of skin lesions",
            "octmnist": "optical coherence tomography images of the retina",
            "pnemoniamnist": "chest X-ray images focused on pneumonia",
            "retinamnist": "retinal fundus images",
            "breastmnist": "breast ultrasound images",
            "bloodmnist": "blood cell microscope images",
            "organamnist": "abdominal CT scan images showing organs",
            "organcmnist": "abdominal CT scan images showing organs",
            "organsmnist": "abdominal CT scan images showing organs"
        }
        
        category_desc = category_descriptions.get(category, f"medical images related to {category}")
        
        # Ask Gemini to verify if the image matches the category
        verification_prompt = f"""
        This is supposed to be a medical image from the '{category}' category.
        The '{category}' should contain {category_desc}.
        
        TASK: Determine if this image appears to be a valid medical image that matches this description.
        If the image doesn't look like {category_desc} or is not a medical image at all, respond with 'INVALID'.
        If it appears to be a proper medical image matching the description, respond with 'VALID'.
        
        Respond with ONLY 'VALID' or 'INVALID', no other text.
        """
        
        try:
            verification_response = client.models.generate_content(
                model='gemini-2.0-flash',
                contents=[
                    types.Part.from_bytes(data=img_bytes, mime_type='image/jpeg'),
                    verification_prompt
                ]
            )
            
            if "INVALID" in verification_response.text.upper():
                return jsonify({
                    'predicted_label': {"label": "None", "confidence": 0.0},
                    'error': f"The uploaded image does not appear to be a valid {category} medical image."
                })
                
        except Exception as e:
            print(f"Gemini API error during image validation: {str(e)}")
            # Continue with model prediction if Gemini fails
        
        # Load medmnist info
        info = INFO[category]
        label_map = info['label']
        task = info['task']
        n_classes = len(label_map)
        DataClass = getattr(medmnist, info['python_class'])

        # Load model
        model = MedViT_large(num_classes=n_classes).to(device)
        weights_path = 'model/MedViT_large_im1k.pth'
        if not os.path.exists(weights_path):
            return jsonify({'error': 'Model weights not found'}), 500

        model.load_state_dict(torch.load(weights_path, map_location=device), strict=False)
        model.eval()

        # Transform image
        input_tensor = transform(img_pil).unsqueeze(0).to(device)

        # Inference
        with torch.no_grad():
            output = model(input_tensor)
            if task == 'multi-label, binary-class':
                probabilities = output.sigmoid().cpu().numpy()[0]
                pred = (probabilities > 0.6).astype(int)
                pred_labels = [
                    {"label": label_map[str(i)], "confidence": float(probabilities[i])}
                    for i, val in enumerate(pred) if val == 1
                ]
                
                # Print probabilities for multi-label case
                print("Predicted labels with probabilities:")
                for label_info in pred_labels:
                    print(f"  {label_info['label']}: {label_info['confidence']:.4f}")
                    
                result = pred_labels if pred_labels else [{"label": "None", "confidence": 0.0}]
            else:
                probabilities = torch.softmax(output, dim=1).cpu().numpy()[0]
                pred_class = output.argmax(dim=1).item()
                
                # Print probabilities for single-label case
                print(f"Predicted label: {label_map[str(pred_class)]}")
                print(f"Confidence: {float(probabilities[pred_class]):.4f}")
                
                # Print top 3 probabilities
                top_indices = probabilities.argsort()[-3:][::-1]
                print("Top 3 predictions:")
                for i in top_indices:
                    print(f"  {label_map[str(i)]}: {probabilities[i]:.4f}")
                
                result = {
                    "label": label_map[str(pred_class)],
                    "confidence": float(probabilities[pred_class])
                }

        return jsonify({'predicted_label': result})
        
    except Exception as e:
        return jsonify({'error': f'Error processing image: {str(e)}'}), 400
    
    finally:
        # Clean up temp file
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except:
                pass

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
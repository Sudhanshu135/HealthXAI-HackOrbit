import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "@/utils/connectDB";
import chatModel from "@/models/chat.models";

// GET: Fetch all chat sessions for a given userId.
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    await connectDB();
    console.log("DB connected");
    const chats = await chatModel.find({ userId });
    return new Response(JSON.stringify(chats), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// POST: Process a new message for a specific chat session.
export async function POST(request) {
  try {
    await connectDB();
    const { userId, chatId, question, language } = await request.json();
    
    console.log("API received question:", question);
    console.log("Language:", language);
    
    if (!userId || !chatId || !question) {
      return new Response(
        JSON.stringify({ error: "Missing userId, chatId, or question" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const systemMessage = `You are a knowledgeable AI fluent in ${language}. Respond clearly and naturally in ${language}. You are a general health expert who provides accurate infomation on personal health, foods eating, exercise, disease diagnosis, and other health-related topics.`;

    // Retrieve or create the chat session.
    let chat = await chatModel.findOne({ userId, chatId });
    if (!chat) {
      chat = new chatModel({ userId, chatId, messages: [] });
    }

    // Append the user's message (as a text message).
    chat.messages.push({ role: "user", type: "text", text: question });

    // Build conversation context from stored messages.
    // For document messages, include the textPreview from the meta field.
    const conversationContext = chat.messages
      .map((msg) => {
        if (msg.type === "document" && msg.meta && msg.meta.textPreview) {
          return `Document Info: ${msg.meta.textPreview}`;
        }
        return msg.role === "user" ? `User: ${msg.text}` : `AI: ${msg.text}`;
      })
      .join("\n");

    // Build the full prompt.
    const prompt = `${systemMessage}\n${conversationContext}\nUser: ${question}\nAI:`;

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chatResponse = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const responseText =
      chatResponse.response.candidates[0]?.content?.parts[0]?.text ||
      "I'm sorry, I couldn't generate a response.";

    // Append the AI's response message (as a text message).
    chat.messages.push({ role: "ai", type: "text", text: responseText });
    await chat.save();

    return new Response(JSON.stringify({ text: responseText }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API Error:", error.message);
    return new Response(JSON.stringify({ error: error.message, stack: error.stack }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

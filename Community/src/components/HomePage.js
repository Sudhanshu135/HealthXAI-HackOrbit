import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    const [language, setLanguage] = useState('en');

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'hi' : 'en');
    };

    return (
        <main className="bg-blue-50">
            {/* Language Toggle Button */}
            <div className="text-right">
                <button
                    onClick={toggleLanguage}
                    className="bg-blue-300 text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-blue-200 transition"
                >
                    {language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
                </button>
            </div>

            {/* Hero Section */}
            <section
                className="relative text-white bg-center bg-cover"
                style={{
                    backgroundImage: 'url("https://cdn.prod.website-files.com/646b666669cbb97ed8baef9f/652543ac7d7b8af462407dd0_Clixie-Interactive-Video-to-health-870x489.jpg")',
                    height: '50vh',
                }}
            >
                <div className="absolute inset-0 bg-blue-900 opacity-60"></div>
                <div className="relative container mx-auto px-6 py-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        {language === 'en' ? 'Welcome to the Health Community' : 'स्वास्थ्य समुदाय में आपका स्वागत है'}
                    </h1>
                    <p className="text-lg mb-6">
                        {language === 'en'
                            ? 'Join a vibrant community focused on wellness, mental health, and healthy living practices.'
                            : 'एक जीवंत समुदाय से जुड़ें जो स्वास्थ्य, मानसिक तंदुरुस्ती और स्वस्थ जीवनशैली पर केंद्रित है।'}
                    </p>
                    <a href="#features" className="bg-blue-300 text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-blue-200 transition">
                        {language === 'en' ? 'Get Started' : 'शुरू करें'}
                    </a>
                </div>
            </section>

            {/* Featured Content Section */}
            {/* Featured Content Section */}
            <section id="features" className="py-5">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        {language === 'en' ? 'Explore Our Features' : 'हमारी विशेषताओं को एक्सप्लोर करें'}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-blue-600 text-white p-6 rounded-lg shadow-lg">
                            <h3 className="text-3xl font-semibold mb-4">
                                {language === 'en' ? 'Health Forums' : 'स्वास्थ्य मंच'}
                            </h3>
                            <p className="text-white mb-4">
                                {language === 'en'
                                    ? 'Engage in meaningful conversations on health topics, get advice from experts, and share your journey.'
                                    : 'स्वास्थ्य विषयों पर सार्थक बातचीत करें, विशेषज्ञों से सलाह प्राप्त करें और अपनी यात्रा साझा करें।'}
                            </p>
                            <Link to="/discussion-forum" className="bg-blue-300 text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-blue-200 transition">
                                {language === 'en' ? 'Get Started' : 'शुरू करें'}
                            </Link>
                        </div>
                        {/* Feature 2 */}
                        <div className="bg-blue-600 p-6 rounded-lg shadow-lg text-white">
                            <h3 className="text-3xl font-semibold mb-4">
                                {language === 'en' ? 'Support Center' : 'सहायता केंद्र'}
                            </h3>
                            <p className="text-white mb-4">
                                {language === 'en'
                                    ? 'Reach out for personalized help with your health concerns or mental wellness support.'
                                    : 'अपने स्वास्थ्य संबंधी चिंताओं या मानसिक स्वास्थ्य सहायता के लिए व्यक्तिगत सहायता प्राप्त करें।'}
                            </p>
                            <Link
                                to="/sikayat-kendra"
                                className="bg-blue-300 text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-blue-200 transition"
                            >
                                {language === 'en' ? 'Get Started' : 'शुरू करें'}
                            </Link>
                        </div>
                        {/* Feature 3 */}
                        <div className="bg-blue-600 p-6 rounded-lg shadow-lg text-white">
                            <h3 className="font-semibold mb-4 text-3xl">
                                {language === 'en' ? 'Wellness Events' : 'कल्याण कार्यक्रम'}
                            </h3>
                            <p className="text-white mb-4">
                                {language === 'en'
                                    ? 'Participate in health workshops, wellness webinars, and local fitness events.'
                                    : 'स्वास्थ्य कार्यशालाओं, वेलनेस वेबिनार और स्थानीय फिटनेस कार्यक्रमों में भाग लें।'}
                            </p>
                            <Link
                                to="/community-events"
                                className="bg-blue-300 text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-blue-200 transition"
                            >
                                {language === 'en' ? 'Get Started' : 'शुरू करें'}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>


            {/* Testimonials Section */}
            <section className="bg-blue-100 py-10">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        {language === 'en' ? 'What Our Members Say' : 'हमारे सदस्यों का क्या कहना है'}
                    </h2>
                    <div className="flex flex-wrap justify-center">
                        {/* Testimonial 1 */}
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-4 mb-6">
                            <p className="text-gray-700 mb-4">
                                {language === 'en'
                                    ? '"This platform has transformed my health journey. The discussions and support have kept me motivated every day."'
                                    : '"इस मंच ने मेरी स्वास्थ्य यात्रा को बदल दिया है। चर्चाओं और समर्थन ने मुझे हर दिन प्रेरित रखा।"'}
                            </p>
                            <p className="font-semibold">Anjali Mehra</p>
                            <p className="text-gray-500">{language === 'en' ? 'Fitness Enthusiast' : 'फिटनेस प्रेमी'}</p>
                        </div>
                        {/* Testimonial 2 */}
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-4 mb-6">
                            <p className="text-gray-700 mb-4">
                                {language === 'en'
                                    ? '"I found expert mental health advice here that truly helped me cope with stress better."'
                                    : '"मुझे यहां विशेषज्ञ मानसिक स्वास्थ्य सलाह मिली, जिसने वास्तव में मुझे तनाव से बेहतर तरीके से निपटने में मदद की।"'}
                            </p>
                            <p className="font-semibold">Rohit Sharma</p>
                            <p className="text-gray-500">{language === 'en' ? 'Community Member' : 'समुदाय सदस्य'}</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default HomePage;

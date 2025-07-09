"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Flame,
  Send,
  Mic,
  PlusCircle,
  Sun,
  Moon,
  Paperclip,
  Globe,
  Volume2,
  ChevronRight,
  Menu,
  X,
  HelpCircle,
  Shield,
  AlertTriangle,
  Home,
  Wifi,
  WifiOff,
  Users,
  Calendar,
  Handshake,
  AlertCircle,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import { set } from "mongoose";

const CONSTANT_USER_ID = "user123";

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "ai",
      content:
        "Welcome to HealthX AI. I'm here to provide guidance on health related things like physical health, mental health and response to emergency situations. How can I assist you today?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chats, setChats] = useState([{ id: "1", name: "Current Chat" }]);
  const [activeChat, setActiveChat] = useState("1");
  const [isMobile, setIsMobile] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState(null);

  const presetQuestions = [
    {
      id: "q1",
      question: "What are recommended health screenings for my age group?",
      icon: <Users size={20} />,
    },
    {
      id: "q2",
      question: "How do I create a balanced nutrition and exercise plan?",
      icon: <Calendar size={20} />,
    },
    {
      id: "q3",
      question: "What are effective ways to manage stress and anxiety?",
      icon: <Handshake size={20} />,
    },
    {
      id: "q4",
      question: "What should I do in case of a medical emergency?",
      icon: <AlertCircle size={20} />,
    },
  ];
  console.log(chats);

  useEffect(() => {
    const fetchInitialChat = async () => {
      try {
        const response = await fetch(`/api/chat?userId=${CONSTANT_USER_ID}`);
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);

        const result = await response.json();

        setChats((prevChats) => [
          ...prevChats,
          ...result.map((chat, index) => ({
            id: chat.chatId + "10",
            name: `Chat ${index + prevChats.length + 1}`,
          })),
        ]);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchInitialChat();
  }, []);

  // Check if the device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Check network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Set initial state
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "bn", name: "Bengali" },
    { code: "ta", name: "Tamil" },
    { code: "te", name: "Telugu" },
    { code: "mr", name: "Marathi" },
    { code: "gu", name: "Gujarati" },
    { code: "pa", name: "Punjabi" },
    { code: "ml", name: "Malayalam" },
    { code: "kn", name: "Kannada" },
    { code: "or", name: "Odia" },
    { code: "as", name: "Assamese" },
  ];

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleOnlineMode = () => {
    setIsOnline(!isOnline);
  };

  const handleSendMessage = async (text = inputMessage) => {
    if (!text.trim()) return;

    // Add user message
    const newUserMessage = {
      id: Date.now(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputMessage("");
    setShowSuggestions(false);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: CONSTANT_USER_ID,
          chatId: activeChat,
          question: text,
          language: selectedLanguage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();

      const aiResponse = {
        id: Date.now() + 1,
        role: "ai",
        content: result.text,
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error in chat:", error);
      
      // Add visible error message to the chat
      const errorResponse = {
        id: Date.now() + 1,
        role: "ai",
        content: "I'm sorry, I couldn't process your request. Please try again later.",
      };
      
      setMessages((prev) => [...prev, errorResponse]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    const newChatId = Date.now().toString();
    const newChat = { id: newChatId, name: `New Chat ${newChatId.slice(-4)}` };
    setChats([newChat, ...chats]);
    setActiveChat(newChatId);
    setMessages([
      {
        id: 1,
        role: "ai",
        content: "How can I help you with your health related goals today?",
      },
    ]);
    setShowSuggestions(true);

    // Close sidebar on mobile after creating a new chat
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) {
      alert("Your browser doesn't support text-to-speech.");
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Map languages to appropriate speech synthesis voices
    const langMap = {
      en: "en-US",
      hi: "hi-IN",
      bn: "bn-IN",
      ta: "ta-IN",
      te: "te-IN",
      mr: "mr-IN",
      gu: "gu-IN",
      pa: "pa-IN",
      ml: "ml-IN",
      kn: "kn-IN",
      or: "or-IN",
      as: "as-IN",
    };
    
    utterance.lang = langMap[selectedLanguage] || "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceInput = () => {
    // If already listening, stop current recognition
    if (isListening && recognitionInstance) {
      recognitionInstance.stop();
      setIsListening(false);
      return;
    }
    
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    // Check for HTTPS
    if (window.location.protocol !== 'https:' && !window.location.hostname.includes('localhost')) {
      alert("Voice input requires a secure connection (HTTPS). Please use HTTPS to enable this feature.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    // Create a new instance
    const recognition = new SpeechRecognition();
    setRecognitionInstance(recognition);

    const langMap = {
      en: "en-US",
      hi: "hi-IN",
      bn: "bn-BD",
      ta: "ta-IN",
      te: "te-IN",
      mr: "mr-IN",
      gu: "gu-IN",
      pa: "pa-IN",
      ml: "ml-IN",
      kn: "kn-IN",
      or: "or-IN",
      as: "as-IN",
    };

    recognition.lang = langMap[selectedLanguage] || "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    // Set timeout to stop recording after 10 seconds
    let timeoutId;
    
    // Show visual feedback
    setIsListening(true);
    
    try {
      recognition.start();
      
      timeoutId = setTimeout(() => {
        if (recognition) {
          try {
            recognition.stop();
          } catch (err) {
            console.error("Error stopping recognition:", err);
          }
          setIsListening(false);
        }
      }, 10000);
      
      recognition.onresult = (event) => {
        if (timeoutId) clearTimeout(timeoutId);
        try {
          const transcript = event.results[0][0].transcript;
          setInputMessage(transcript);
          
          // Auto-submit after a short delay (gives user time to see what was transcribed)
          setTimeout(() => {
            if (transcript.trim()) {
              handleSendMessage(transcript);
            }
          }, 800); // 800ms delay before sending
        } catch (err) {
          console.error("Error processing speech result:", err);
        }
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        if (timeoutId) clearTimeout(timeoutId);
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        
        // Only show alerts for errors that require user action
        if (event.error === 'not-allowed') {
          alert("Microphone access denied. Please allow microphone access in your browser settings.");
        } else if (event.error !== 'aborted') {
          // Don't show alert for aborted as it's often a normal part of operation
          alert(`Voice input error: ${event.error}`);
        }
      };
      
      recognition.onend = () => {
        if (timeoutId) clearTimeout(timeoutId);
        setIsListening(false);
      };
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      setIsListening(false);
      alert("Failed to start voice input. Please try again.");
    }
  };

  const handlePresetQuestion = async (question) => {
    // First try the normal way
    try {
      await handleSendMessage(question);
    } catch (error) {
      console.error("Error handling preset question:", error);
      
      // Fallback: Add the messages manually if API fails
      const newUserMessage = {
        id: Date.now(),
        role: "user",
        content: question,
      };
      
      setMessages((prev) => [...prev, newUserMessage]);
      setShowSuggestions(false);
      
      // Retry with a slight delay to avoid any race conditions
      setTimeout(() => {
        handleSendMessage(question);
      }, 500);
    }
  };
  const messagesEndRef = useRef(null); // Reference to the end of the message container

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages]);

  return (
    <div
      className={`min-h-screen flex flex-col font-sans ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-[#F4F6F8] text-gray-800"
      }`}
    >
      {/* Header */}
      <header
        className={`flex items-center justify-between px-5 py-4 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } border-b shadow-sm`}
      >
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className={`mr-4 p-2 rounded-full ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-100 hover:bg-gray-200"
            } transition-colors`}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 mr-3">
              <Flame className="text-blue-600" size={22} />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              HealthXAI
            </h1>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleOnlineMode}
            className={`p-2.5 rounded-full transition-colors ${
              isOnline
                ? darkMode
                  ? "bg-green-800 hover:bg-green-700"
                  : "bg-green-100 hover:bg-green-200 text-green-800"
                : darkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
            aria-label="Toggle online mode"
          >
            {isOnline ? <Wifi size={18} /> : <WifiOff size={18} />}
          </button>
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-full transition-colors ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
            ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } 
            border-r w-72 flex flex-col transition-transform duration-300 ease-in-out
            ${
              isMobile ? "absolute z-10 h-[calc(100%-64px)] mt-16" : "relative"
            }`}
        >
          <div className="p-5">
            <button
              onClick={handleNewChat}
              className={`w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl 
                ${
                  darkMode
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-500 hover:bg-blue-600"
                } 
                text-white font-medium transition-colors shadow-sm hover:shadow-md`}
            >
              <PlusCircle size={18} />
              <span className="text-sm">New Chat</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <h2
              className={`px-4 py-2 text-sm font-semibold ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Recent Chats
            </h2>
            <div className="space-y-2">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => {
                    setActiveChat(chat.id);
                    if (isMobile) setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all
                    ${
                      activeChat === chat.id
                        ? darkMode
                          ? "bg-gray-700 text-white shadow-md"
                          : "bg-gray-100 text-gray-900 shadow-md"
                        : darkMode
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      activeChat === chat.id ? "bg-blue-100" : "bg-gray-100"
                    }`}
                  >
                    <Flame
                      size={16}
                      className={
                        activeChat === chat.id
                          ? "text-blue-600"
                          : "text-gray-600"
                      }
                    />
                  </div>
                  <span className="truncate text-sm">{chat.name}</span>
                  {activeChat === chat.id && (
                    <ChevronRight size={16} className="ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div
            className={`p-5 border-t ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex items-center p-1 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-sm">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mr-2">
                <Globe size={16} />
              </div>
              <select
                className={`w-full p-2 rounded-lg text-sm ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-gray-50 border-gray-200 text-gray-800"
                } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Connection Status Banner */}
          {!isOnline && (
            <div
              className={`${
                darkMode
                  ? "bg-amber-800 border-amber-700"
                  : "bg-amber-50 border-amber-200"
              } p-2 text-center border-b`}
            >
              <p
                className={`text-sm ${
                  darkMode ? "text-amber-200" : "text-amber-800"
                } flex items-center justify-center gap-2`}
              >
                <WifiOff size={16} />
                <span>
                  You're in offline mode. Some features may be limited.
                </span>
              </p>
            </div>
          )}

          {/* Messages */}
          <div
            className={`flex-1 max-h-[80vh] overflow-y-auto p-6 ${
              darkMode ? "bg-gray-900" : "bg-[#F4F6F8]"
            }`}
          >
            <div className="max-w-6xl mx-auto space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-4 shadow-sm ${
                      message.role === "user"
                        ? darkMode
                          ? "bg-blue-600 text-white"
                          : "bg-blue-500 text-white"
                        : darkMode
                        ? "bg-gray-800 text-white border border-gray-700"
                        : "bg-white border border-gray-100"
                    }`}
                  >
                    <ReactMarkdown
                      className={`whitespace-pre-wrap ${
                        message.role === "user"
                          ? "text-sm"
                          : "text-sm text-gray-900 dark:text-white"
                      }`}
                    >
                      {message.content}
                    </ReactMarkdown>
                    {message.role === "ai" && (
                      <button
                        onClick={() => speakText(message.content)}
                        className={`mt-3 p-2 rounded-full ${
                          darkMode
                            ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                        } transition-colors`}
                        aria-label="Speak text"
                      >
                        <Volume2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Preset Questions */}
              {showSuggestions && messages.length < 2 && (
                <div className="mt-8 space-y-5">
                  <h3
                    className={`text-center text-sm font-medium ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Suggested Questions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {presetQuestions.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => handlePresetQuestion(q.question)}
                        className={`flex items-center gap-3 p-4 rounded-2xl text-left transition-all hover:shadow-md transform hover:scale-[1.01] ${
                          darkMode
                            ? "bg-gray-800 border border-gray-700 hover:border-blue-600/50 text-white"
                            : "bg-white border border-gray-100 hover:border-blue-400/50 text-gray-800 shadow-sm"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-full ${
                            darkMode ? "bg-gray-700" : "bg-gray-100"
                          }`}
                        >
                          {q.icon}
                        </div>
                        <span className="text-sm font-medium">
                          {q.question}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Empty div that acts as a scroll target */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div
            className={`p-5 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } border-t shadow-sm`}
          >
            <div className="max-w-6xl mx-auto">
              <div
                className={`flex items-center rounded-xl shadow-sm ${
                  darkMode
                    ? "bg-gray-700 border border-gray-600"
                    : "bg-white border border-gray-200"
                } p-2`}
              >
                <button
                  className={`p-2 rounded-full ${
                    darkMode
                      ? "hover:bg-gray-600 text-gray-400"
                      : "hover:bg-gray-100 text-gray-500"
                  } transition-colors`}
                  aria-label="Attach file"
                >
                  <Paperclip size={18} />
                </button>
                <textarea
                  className={`flex-1 resize-none outline-none px-4 py-2 text-sm ${
                    darkMode
                      ? "bg-gray-700 text-white"
                      : "bg-white text-gray-800"
                  }`}
                  placeholder="Type your message here..."
                  rows={1}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                />
                <button
                  className={`p-2 rounded-full ${
                    isListening 
                      ? "bg-red-500 text-white animate-pulse" 
                      : darkMode
                        ? "hover:bg-gray-600 text-gray-400"
                        : "hover:bg-gray-100 text-gray-500"
                  } transition-colors mx-1`}
                  onClick={handleVoiceInput}
                  aria-label="Voice input"
                >
                  <Mic size={18} />
                </button>
                <button
                  className={`p-2.5 rounded-full ${
                    inputMessage.trim()
                      ? darkMode
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-blue-500 hover:bg-blue-600"
                      : darkMode
                      ? "bg-gray-600"
                      : "bg-gray-300"
                  } text-white transition-colors`}
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim()}
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
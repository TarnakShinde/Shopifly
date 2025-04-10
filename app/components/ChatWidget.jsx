"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, X, MessageSquare } from "lucide-react";

const ChatWidget = () => {
    const [messages, setMessages] = useState([
        {
            text: "Hi there! Welcome to Shopifly 😊 How can I help you today?",
            sender: "bot",
        },
    ]);
    const [input, setInput] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!input.trim()) return;

        // Add user message
        setMessages((prev) => [...prev, { text: input, sender: "user" }]);

        // Clear input and set loading
        setInput("");
        setIsLoading(true);

        try {
            // Send message to API
            const response = await fetch("/api/chatbot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input }),
            });

            if (!response.ok) {
                throw new Error("Failed to get response");
            }

            const data = await response.json();

            // Add bot response
            setMessages((prev) => [
                ...prev,
                { text: data.text, sender: "bot" },
            ]);
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages((prev) => [
                ...prev,
                {
                    text: "Sorry, I'm having trouble connecting right now. Please try again later.",
                    sender: "bot",
                    error: true,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Chat Button */}
            <button
                onClick={toggleChat}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center"
                aria-label={isOpen ? "Close chat" : "Open chat"}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>

            {/* Chat Widget */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-200">
                    {/* Header */}
                    <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                        <h2 className="font-semibold">Shopifly Assistant</h2>
                        <button
                            onClick={toggleChat}
                            className="text-white hover:text-gray-200"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto max-h-80 bg-gray-50">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`mb-3 ${
                                    message.sender === "user"
                                        ? "text-right"
                                        : "text-left"
                                }`}
                            >
                                <div
                                    className={`inline-block p-3 rounded-lg ${
                                        message.sender === "user"
                                            ? "bg-blue-600 text-white rounded-tr-none"
                                            : "bg-gray-200 text-gray-800 rounded-tl-none"
                                    } ${
                                        message.error
                                            ? "bg-red-100 text-red-800"
                                            : ""
                                    }`}
                                >
                                    {message.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="text-left mb-3">
                                <div className="p-3 rounded-lg bg-gray-200 text-gray-800 rounded-tl-none flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form
                        onSubmit={handleSendMessage}
                        className="border-t border-gray-200 p-4 flex"
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 text-white p-2 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400"
                            disabled={isLoading || !input.trim()}
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;

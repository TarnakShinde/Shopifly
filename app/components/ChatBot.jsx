"use client";
import React, { useState, useRef, useEffect } from "react";

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const inputRef = useRef(null);
    const messageContainerRef = useRef(null);

    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop =
                messageContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const toggleChatbox = () => {
        setIsOpen(!isOpen);
    };

    const sendMessage = async () => {
        const text = inputRef.current.value.trim();
        if (text === "") return;

        const userMessage = { name: "User", message: text };
        setMessages((prevMessages) => [...prevMessages, userMessage]);

        try {
            const response = await fetch(
                "https://shopifly-chatbot.onrender.com",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ message: text }),
                }
            );

            const data = await response.json();
            const botMessage = {
                name: "Sam",
                message: data.response || "No response",
            };
            setMessages((prevMessages) => [...prevMessages, botMessage]);
        } catch (error) {
            console.error("Error connecting to chatbot API:", error);
            const errorMessage = {
                name: "Sam",
                message: "Error: Unable to connect to the server.",
            };
            setMessages((prevMessages) => [...prevMessages, errorMessage]);
        }

        inputRef.current.value = "";
    };

    return (
        <div className="fixed bottom-0 right-0 md:bottom-5 md:right-5 z-50">
            <button
                className="bg-indigo-700 text-white p-3 rounded-full shadow-lg hover:bg-indigo-500 focus:outline-none m-4 md:m-0"
                onClick={toggleChatbox}
            >
                Chat
            </button>

            {isOpen && (
                <div className="fixed inset-0 md:relative md:inset-auto">
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50 md:hidden"
                        onClick={toggleChatbox}
                    />
                    <div className="absolute bottom-0 left-0 right-0 md:relative md:mt-3 bg-white shadow-lg md:rounded-lg w-full md:w-80 flex flex-col border border-gray-200 h-[80vh] md:h-auto">
                        <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                            <span className="font-medium">Chat Support</span>
                            <button
                                onClick={toggleChatbox}
                                className="md:hidden text-gray-500 hover:text-gray-700"
                            >
                                Close
                            </button>
                        </div>

                        <div
                            ref={messageContainerRef}
                            className="p-4 flex-grow overflow-y-auto md:max-h-64"
                        >
                            <div className="space-y-2 flex flex-col gap-3">
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`p-2 rounded-lg max-w-[80%] ${
                                            msg.name === "Sam"
                                                ? "bg-gray-200 text-left self-start"
                                                : "bg-blue-500 text-white text-right self-end"
                                        }`}
                                    >
                                        {msg.message}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center p-3 border-t border-gray-200">
                            <input
                                type="text"
                                ref={inputRef}
                                placeholder="Type a message..."
                                className="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        sendMessage();
                                    }
                                }}
                            />
                            <button
                                className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none"
                                onClick={sendMessage}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot;

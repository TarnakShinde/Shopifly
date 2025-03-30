// File: app/api/chatbot/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { initChatbot } from "../../../lib/chatbot";

// Global variable to hold chatbot instance
let chatbotInstance = null;

// Initialize chatbot on first request
async function getChatbot() {
    if (!chatbotInstance) {
        chatbotInstance = await initChatbot();
    }
    return chatbotInstance;
}

export async function POST(request) {
    try {
        const { message } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        // Get or initialize chatbot
        const chatbot = await getChatbot();

        // Get user ID from cookies or create a new one
        const cookieStore = await cookies();
        let userId = cookieStore.get("user_id")?.value;
        if (!userId) {
            userId = uuidv4();
        }

        // Process message
        const response = await chatbot.processMessage(message, userId);

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error processing chatbot request:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Optional: Add a GET endpoint to check if chatbot is ready
export async function GET() {
    try {
        await getChatbot();
        return NextResponse.json({ status: "Chatbot is ready" });
    } catch (error) {
        console.error("Error initializing chatbot:", error);
        return NextResponse.json(
            { error: "Chatbot initialization failed", status: "error" },
            { status: 500 }
        );
    }
}

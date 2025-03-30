// app/api/send-email/route.js
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

// Create a transporter with Gmail
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // your Gmail address
        pass: process.env.EMAIL_PASSWORD, // your app password (not your regular Gmail password)
    },
});

export async function POST(request) {
    try {
        // Get request data
        const { to, subject, html, text, from } = await request.json();

        // Validate required fields
        if (!to || !subject || (!html && !text)) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Set up email options
        const mailOptions = {
            from: from || `"Shopifly" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
            text,
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);

        return NextResponse.json({
            success: true,
            messageId: info.messageId,
        });
    } catch (error) {
        console.error("Email sending failed:", error);
        return NextResponse.json(
            { error: "Failed to send email", details: error.message },
            { status: 500 }
        );
    }
}

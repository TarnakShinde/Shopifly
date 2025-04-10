import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error("Missing Supabase environment variables");
            return NextResponse.json(
                {
                    error: "Server configuration error: Missing Supabase credentials",
                },
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        // 🔥 Hardcoded base URL
        const redirectTo = `https://www.shopifly.tech/update-password`;

        console.log("Sending password reset email to:", email);
        console.log("With redirect URL:", redirectTo);

        const { data, error } = await supabase.auth.resetPasswordForEmail(
            email,
            { redirectTo }
        );

        if (error) {
            console.error("Error sending password reset email:", error);
            return NextResponse.json(
                {
                    error: "Password reset request failed: " + error.message,
                    details: error,
                },
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message:
                    "Password reset email sent successfully. Please check your inbox.",
            },
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Server error:", error);
        return NextResponse.json(
            {
                error: "Server error: " + (error.message || String(error)),
                stack:
                    process.env.NODE_ENV === "development"
                        ? error.stack
                        : undefined,
            },
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}

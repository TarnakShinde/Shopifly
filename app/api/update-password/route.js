// route.js
// File: app/api/update-password/route.js (for Next.js App Router)

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

        // Check if environment variables are available
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

        console.log(
            "Initializing Supabase client with URL:",
            supabaseUrl.substring(0, 10) + "..."
        );

        // Create the Supabase client with explicit credentials
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        // Determine the base URL for the redirect
        const baseUrl =
            process.env.NEXT_PUBLIC_APP_URL ||
            (process.env.NODE_ENV === "production"
                ? "https://your-production-domain.com"
                : "http://localhost:3000");

        console.log("Sending password reset email to:", email);
        console.log("With redirect URL:", `${baseUrl}/reset-password`);

        try {
            // Send the password reset email
            const { data, error } = await supabase.auth.resetPasswordForEmail(
                email,
                {
                    redirectTo: `${baseUrl}/reset-password`,
                }
            );

            if (error) {
                console.error("Error sending password reset email:", error);
                return NextResponse.json(
                    {
                        error:
                            "Password reset request failed: " + error.message,
                        details: error,
                    },
                    {
                        status: 500,
                        headers: { "Content-Type": "application/json" },
                    }
                );
            }

            // Return success
            return NextResponse.json(
                {
                    success: true,
                    message:
                        "Password reset email sent successfully. Please check your inbox.",
                },
                { status: 200, headers: { "Content-Type": "application/json" } }
            );
        } catch (supabaseError) {
            console.error("Supabase client error:", supabaseError);

            // Check if the error is related to invalid JSON response
            if (
                supabaseError.message &&
                supabaseError.message.includes("Unexpected token '<'")
            ) {
                return NextResponse.json(
                    {
                        error: "Invalid Supabase API response. This may be due to incorrect API credentials or URL.",
                        details:
                            "The Supabase API returned HTML instead of JSON, which typically indicates a connection or authentication issue.",
                    },
                    {
                        status: 500,
                        headers: { "Content-Type": "application/json" },
                    }
                );
            }

            return NextResponse.json(
                {
                    error: "Supabase client error: " + supabaseError.message,
                    details: supabaseError.toString(),
                },
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }
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

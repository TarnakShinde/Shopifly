// app/api/search/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request) {
    try {
        // Get the search query from URL parameters
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("query");

        // Check if query parameter exists
        if (!query) {
            return NextResponse.json(
                { error: "Query parameter is required" },
                { status: 400 }
            );
        }

        // Initialize Supabase client inside the handler to ensure environment variables are loaded
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        // Validate environment variables
        if (!supabaseUrl || !supabaseKey) {
            console.error("Missing Supabase environment variables");
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            );
        }

        // Create Supabase client with proper error handling
        const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: { persistSession: false },
            global: { fetch: fetch },
        });

        // Perform the database query
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .ilike("product_name", `%${query}%`)
            .limit(10);

        // Handle database errors
        if (error) {
            console.error("Supabase query error:", error);
            return NextResponse.json(
                { error: "Database query failed: " + error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(data || []);
    } catch (error) {
        console.error("Search API route error:", error);
        return NextResponse.json(
            { error: "Internal server error: " + error.message },
            { status: 500 }
        );
    }
}

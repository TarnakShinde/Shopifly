// app/api/search/route.js
import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

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

        // Create Supabase client with proper error handling

        // Use the full-text search index with tsquery
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .textSearch(
                "product_name || ' ' || description",
                `${query.split(" ").join(" & ")}`,
                {
                    type: "websearch",
                    config: "english",
                }
            )
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

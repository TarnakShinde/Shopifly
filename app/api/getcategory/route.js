import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Create Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
    try {
        // Get category ID from URL parameters
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get("id") || "0"; // Default to 0 if not specified

        // If category ID is 0, return a special response for "All Categories"
        if (categoryId === "0") {
            return NextResponse.json({
                success: true,
                category: {
                    id: "0",
                    name: "Random Products",
                },
            });
        }

        const { data: category, error } = await supabase
            .from("category")
            .select("*")
            .eq("categoryid", categoryId)
            .single(); // Add this to get a single result instead of an array

        if (error) throw error;

        if (!category) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Category not found",
                },
                { status: 404 }
            );
        }
        return NextResponse.json({
            success: true,
            category: {
                id: category.categoryid,
                name: category.categoryname,
            },
        });
    } catch (error) {
        console.error("Error in category info API:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Internal Server Error",
            },
            { status: 500 }
        );
    }
}

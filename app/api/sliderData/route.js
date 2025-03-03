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
        const categoryId = searchParams.get("id") || "0"; // Default to 0 (random) if not specified

        // First get total count of products
        const { count } = await supabase
            .from("products")
            .select("*", { count: "exact", head: true });

        if (!count) throw new Error("No products found");

        let query = supabase.from("random_products_view").select("*");

        // Apply category filtering only if not requesting random products
        if (categoryId !== "0") {
            query = supabase.from("products").select("*");
            query = query.eq("categoryid", categoryId);
        }

        // Execute the query with limit
        const { data: products, error } = await query.limit(7);

        if (error) throw error;

        // If categoryId is 0, shuffle the results for true randomness across all categories
        const finalProducts =
            categoryId === "0"
                ? products.sort(() => Math.random() - 0.5)
                : products;

        return NextResponse.json(finalProducts);
    } catch (error) {
        console.error("Detailed error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

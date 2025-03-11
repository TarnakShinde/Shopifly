import { createClient } from "@/utils/supabase/client";

export async function POST(request) {
    try {
        const supabase = createClient();
        const { userId, productId, addedAt } = await request.json();

        // Validate required fields
        if (!userId || !productId) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Missing required fields",
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Check if favorite already exists to prevent duplicates
        const { data: existingFavorite, error: checkError } = await supabase
            .from("favorites")
            .select("*")
            .eq("user_id", userId)
            .eq("product_id", productId)
            .single();

        if (checkError && checkError.code !== "PGRST116") {
            // PGRST116 means no rows found
            console.error("Error checking existing favorite:", checkError);
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Error checking existing favorite",
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        if (existingFavorite) {
            return new Response(
                JSON.stringify({
                    success: true,
                    message: "Product already in favorites",
                }),
                { status: 200, headers: { "Content-Type": "application/json" } }
            );
        }

        // Add to favorites
        const { data, error } = await supabase.from("favorites").insert([
            {
                user_id: userId,
                product_id: productId,
                created_at: addedAt || new Date().toISOString(),
            },
        ]);

        if (error) {
            console.error("Error adding to favorites:", error);
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Failed to add to favorites",
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: "Product added to favorites",
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Server error:", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: "Server error",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}

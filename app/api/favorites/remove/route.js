import { createClient } from "../../../../utils/supabase/client";

export async function POST(request) {
    try {
        const supabase = createClient();

        // Get session
        const { data: sessionData, error: sessionError } =
            await supabase.auth.getSession();

        if (sessionError || !sessionData.session) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Authentication required",
                    requiresAuth: true,
                }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        const userId = sessionData.session.user.id;
        const { productId } = await request.json();

        if (!productId) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Missing product ID",
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const { data, error } = await supabase
            .from("favorites")
            .delete()
            .eq("user_id", userId)
            .eq("product_id", productId);

        if (error) {
            console.error("Error removing from favorites:", error);
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Failed to remove from favorites",
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: "Product removed from favorites",
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

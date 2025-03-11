import { createClient } from "./supabase/client";
import { toast } from "react-toastify";

export const handleAddToFavorites = async (productId, user) => {
    const supabase = createClient();

    // Check if user is logged in
    if (!user) {
        // Return a response that indicates auth is required
        return {
            success: false,
            message: "Authentication required",
            requiresAuth: true,
        };
    }

    try {
        // First check if the favorite already exists
        const { data: existingFavorite, error: checkError } = await supabase
            .from("favorites")
            .select("*")
            .eq("user_id", user.id)
            .eq("product_id", productId)
            .single();

        if (checkError && checkError.code !== "PGRST116") {
            // PGRST116 means no rows found
            console.error("Error checking existing favorite:", checkError);
            toast.error("Error checking favorites status");
            return {
                success: false,
                message: "Error checking favorites status",
            };
        }

        if (existingFavorite) {
            toast.info("Product already in your favorites");
            return { success: true, message: "Product already in favorites" };
        }

        // Add to favorites
        const { data, error } = await supabase.from("favorites").insert([
            {
                user_id: user.id,
                product_id: productId,
                created_at: new Date().toISOString(),
            },
        ]);

        if (error) {
            console.error("Error adding to favorites:", error);
            toast.error("Failed to add to favorites");
            return { success: false, message: "Failed to add to favorites" };
        }

        toast.success("Product added to favorites");
        return { success: true, message: "Product added to favorites" };
    } catch (error) {
        console.error("Error adding to favorites:", error);
        toast.error("Something went wrong");
        return { success: false, message: error.message };
    }
};

// Similarly, add these other functions:

export const handleRemoveFromFavorites = async (productId, user) => {
    const supabase = createClient();

    if (!user) {
        return {
            success: false,
            message: "Authentication required",
            requiresAuth: true,
        };
    }

    try {
        const { data, error } = await supabase
            .from("favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("product_id", productId);

        if (error) {
            console.error("Error removing from favorites:", error);
            toast.error("Failed to remove from favorites");
            return {
                success: false,
                message: "Failed to remove from favorites",
            };
        }

        toast.success("Removed from favorites");
        return { success: true, message: "Product removed from favorites" };
    } catch (error) {
        console.error("Error removing from favorites:", error);
        toast.error("Something went wrong");
        return { success: false, message: error.message };
    }
};

export const getUserLikedProducts = async (user) => {
    const supabase = createClient();

    if (!user) {
        return {
            success: false,
            message: "Authentication required",
            requiresAuth: true,
            data: [],
        };
    }

    try {
        // Get favorites
        const { data: favorites, error: favoritesError } = await supabase
            .from("favorites")
            .select("product_id")
            .eq("user_id", user.id);

        if (favoritesError) {
            console.error("Error fetching favorites:", favoritesError);
            return {
                success: false,
                message: "Failed to fetch favorites",
                data: [],
            };
        }

        if (!favorites || favorites.length === 0) {
            return { success: true, data: [] };
        }

        // Get product details
        const productIds = favorites.map((fav) => fav.product_id);
        const { data: products, error: productsError } = await supabase
            .from("products") // Replace with your actual products table name
            .select("*")
            .in("uniq_id", productIds);

        if (productsError) {
            console.error("Error fetching products:", productsError);
            return {
                success: false,
                message: "Failed to fetch product details",
                data: [],
            };
        }

        return { success: true, data: products || [] };
    } catch (error) {
        console.error("Error fetching liked products:", error);
        return { success: false, message: error.message, data: [] };
    }
};

export const checkProductInFavorites = async (productId, user) => {
    const supabase = createClient();

    if (!user) {
        return { success: false, isFavorite: false };
    }

    try {
        const { data, error } = await supabase
            .from("favorites")
            .select("*")
            .eq("user_id", user.id)
            .eq("product_id", productId)
            .single();

        if (error && error.code !== "PGRST116") {
            // PGRST116 means no rows found
            console.error("Error checking favorite status:", error);
            return { success: false, isFavorite: false, error: error.message };
        }

        return { success: true, isFavorite: !!data };
    } catch (error) {
        console.error("Error checking favorite status:", error);
        return { success: false, isFavorite: false, error: error.message };
    }
};

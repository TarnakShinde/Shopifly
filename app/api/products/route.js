import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function getUsersForHero() {
    try {
        // Get total count of products
        const { count } = await supabase
            .from("products")
            .select("*", { count: "exact", head: true });

        if (!count) return [];

        // Get random offset
        const randomOffset = Math.floor(Math.random() * (count - 5));

        // Fetch 5 random products
        const { data: products, error } = await supabase
            .from("products")
            .select("*")
            .range(randomOffset, randomOffset + 4);

        if (error) throw error;

        // Shuffle the results
        const shuffledProducts = products.sort(() => Math.random() - 0.5);

        // Dates are already serialized in Supabase response
        return shuffledProducts;
    } catch (error) {
        console.error("Error fetching hero products:", error);
        return [];
    }
}

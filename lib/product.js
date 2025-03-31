import { supabase } from "./supabase";

export async function getUsersForHero() {
    try {
        const { count } = await supabase
            .from("products")
            .select("*", { count: "exact", head: true });

        if (!count) return [];

        const randomOffset = Math.floor(Math.random() * (count - 5));

        const { data: products, error } = await supabase
            .from("products")
            .select("*")
            .range(randomOffset, randomOffset + 4);

        if (error) throw error;

        return products.sort(() => Math.random() - 0.5);
    } catch (error) {
        console.error("Error fetching hero products:", error);
        return [];
    }
}

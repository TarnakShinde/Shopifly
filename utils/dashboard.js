import { supabase } from "../lib/supabase";

export async function fetchDashboardData() {
    // Fetch product and user data
    const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*");
    const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("userid, userEmail");

    if (productError || userError) {
        throw new Error("Error fetching data.");
    }

    return { products: productData, users: userData };
}

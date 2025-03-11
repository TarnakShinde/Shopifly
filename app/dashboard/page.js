import { createClient } from "../../utils/supabase/client";
import Dashboard from "./Dashboard";

export async function fetchDashboardData() {
    const supabase = await createClient();
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

export default async function DashboardPage() {
    const { products, users } = await fetchDashboardData();

    return (
        <div>
            <Dashboard clientProducts={products} clientUsers={users} />
        </div>
    );
}

import { supabase } from "../../../lib/supabase";
import Dashboard from "./Dashboard";
import fetchDashboardData from "../../../utils/dashboard";

export default async function DashboardPage() {
    const { products, users } = await fetchDashboardData();

    return (
        <div>
            <Dashboard clientProducts={products} clientUsers={users} />
        </div>
    );
}

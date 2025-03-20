import { notFound } from "next/navigation";
import OrderDetails from "../../components/OrderDetails";
import { supabase } from "../../../lib/supabase";

async function getOrder(orderId) {
    const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

    if (error || !data) {
        return null;
    }

    return data;
}

export default async function OrderDetailsPage({ params }) {
    // Now use the id from the resolved params
    const order = await getOrder(params.id);

    if (!order) {
        notFound();
    }

    return <OrderDetails order={order.id} />;
}

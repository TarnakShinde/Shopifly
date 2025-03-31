import { notFound } from "next/navigation";
import OrderDetails from "../../components/OrderDetails";
import { supabase } from "../../../lib/supabase"; // Fixed import path

async function getOrder(orderId) {
    const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

    if (error) {
        console.error("Error fetching order:", error);
    }

    return data || null;
}

export default async function OrderDetailsPage({ params }) {
    // Get the full order data
    const order = await getOrder(params.id);
    console.log("Order details:", order);

    if (!order) {
        notFound();
    }

    // Pass the entire order object to the component
    return <OrderDetails orderId={order.id} />;
}

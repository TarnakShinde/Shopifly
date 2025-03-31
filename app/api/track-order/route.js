import { supabase } from "../../../lib/supabase";
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
        return new Response(JSON.stringify({ error: "Order ID is required" }), {
            status: 400,
        });
    }

    const { data, error } = await supabase
        .from("orders")
        .select("id, status, created_at, delivery_date, tracking_updates")
        .eq("id", orderId)
        .single();

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
        });
    }

    return new Response(JSON.stringify(data), { status: 200 });
}

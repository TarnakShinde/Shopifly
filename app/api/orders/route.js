import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const offset = (page - 1) * limit;

    if (!userId) {
        return NextResponse.json(
            {
                success: false,
                message: "User ID is required",
            },
            { status: 400 }
        );
    }

    try {
        // First get the total count for pagination
        const { count, error: countError } = await supabase
            .from("orders")
            .select("*", { count: "exact" })
            .order("created_at", { ascending: false })
            .eq("user_id", userId);

        if (countError) throw countError;

        // Then get the actual orders with pagination
        const { data, error } = await supabase
            .from("orders")
            .select(
                `id, status, total_price, shipping_details, products, created_at`
            )
            .eq("user_id", userId);

        if (error) throw error;

        // Transform data if needed - ensure no fields are undefined
        const transformedData = data.map((order) => {
            // Parse the ISO date string
            const dateObj = new Date(order.created_at);

            // Format to DD/MM/YYYY
            const day = dateObj.getDate().toString().padStart(2, "0");
            const month = (dateObj.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-indexed
            const year = dateObj.getFullYear();
            const formattedDate = `${day}/${month}/${year}`;

            return {
                id: order.id,
                date: formattedDate, // Use the formatted date
                status: order.status,
                total_price: order.total_price || 0,
                shippingDetails: order.shipping_details || {},
                products: order.products || [],
            };
        });
        return NextResponse.json({
            success: true,
            data: transformedData,
            total: count || 0,
            page,
            limit,
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to fetch orders",
            },
            { status: 500 }
        );
    }
}
export async function PATCH(request) {
    try {
        const body = await request.json();
        const { orderId, userId, status } = body;

        if (!orderId || !userId || !status) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Order ID, user ID, and status are required",
                },
                { status: 400 }
            );
        }

        // Verify order belongs to this user
        const { data: orderCheck, error: checkError } = await supabase
            .from("orders")
            .select("id, status") // Only fetch necessary fields
            .eq("id", String(orderId))
            .eq("user_id", String(userId));

        console.log("Order check data:", orderCheck);

        if (checkError || !orderCheck || orderCheck.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Order not found or does not belong to this user",
                },
                { status: 403 }
            );
        }

        // Check if status is already the same
        if (orderCheck[0].status === status) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Order status is already set to this value",
                },
                { status: 200 }
            );
        }

        // Update the order
        const { data, error } = await supabase
            .from("orders")
            .update({ status })
            .eq("id", String(orderId))
            .eq("user_id", String(userId))
            .select();

        console.log("Updated order data:", data);

        if (error || !data || data.length === 0) {
            throw new Error("Failed to update order status");
        }

        return NextResponse.json({
            success: true,
            message: "Order updated successfully",
            data,
        });
    } catch (error) {
        console.error("Error updating order:", error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Failed to update order",
            },
            { status: 500 }
        );
    }
}

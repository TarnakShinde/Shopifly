import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PATCH(request, { params }) {
    const { id } = params;
    const { status } = await request.json();

    // Validate inputs
    if (
        !status ||
        !["pending", "processing", "completed", "cancelled"].includes(status)
    ) {
        return NextResponse.json(
            { error: "Invalid status value" },
            { status: 400 }
        );
    }

    try {
        const cookieStore = cookies();
        const supabase = createClient({ cookies: () => cookieStore });

        // Get user session for authentication
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Update the order status
        const { data, error } = await supabase
            .from("orders")
            .update({
                status,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Error updating order:", error);
            return NextResponse.json(
                { error: "Failed to update order" },
                { status: 500 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Order update error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

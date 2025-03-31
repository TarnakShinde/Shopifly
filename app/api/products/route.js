import { supabase } from "../../../lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const { data: products, error } = await supabase
            .from("products")
            .select("*");

        if (error) throw error;

        return NextResponse.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}

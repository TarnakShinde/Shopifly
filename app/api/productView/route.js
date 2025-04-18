import { createClient } from "@supabase/supabase-js";
import { supabase } from "../../../lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("id");

    if (!query) {
        return NextResponse.json(
            { error: "Query parameter is required" },
            { status: 400 }
        );
    }

    try {
        const { data: products, error } = await supabase
            .from("products")
            .select("*")
            .ilike("uniq_id", `%${query}%`)
            .limit(10);

        if (error) throw error;

        return NextResponse.json(products);
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
}

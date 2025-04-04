import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("id");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    console.log("Query", query);
    console.log("From", from);
    console.log("to", to);
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
            .eq("categoryid", parseInt(query))
            .limit(10);
        // .range(from, to);
        if (error) throw error;

        return NextResponse.json(products);
    } catch (error) {
        console.error("Error fetching category products: ", error);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
}

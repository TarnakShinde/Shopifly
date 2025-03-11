// app/api/add-product/route.js
import { createServerClient } from "@supabase/ssr";

export async function POST(req) {
    const { name, price } = await req.json();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data, error } = await supabase
        .from("products")
        .insert([{ name, price }])
        .select();

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
        });
    }

    return new Response(JSON.stringify({ product: data[0] }), { status: 200 });
}

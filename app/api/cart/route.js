import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        { cookies }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const item = await request.json();
    const { error } = await supabase
        .from("cart")
        .upsert({ ...item, user_id: user.id });

    if (error)
        return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ message: "Item added" }, { status: 200 });
}

export async function DELETE(request) {
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        { cookies }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await request.json();
    const { error } = await supabase.from("cart").delete().eq("id", id);

    if (error)
        return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ message: "Item removed" }, { status: 200 });
}

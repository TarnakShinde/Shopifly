import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function updateSession(request) {
    let supabaseResponse = NextResponse.next();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                get(name) {
                    return request.cookies.get(name)?.value;
                },
                set(name, value, options) {
                    request.cookies.set(name, value);
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    supabaseResponse.cookies.set(name, value, options);
                },
                remove(name, options) {
                    request.cookies.delete(name);
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    supabaseResponse.cookies.delete(name, options);
                },
            },
        }
    );

    // Refresh session
    await supabase.auth.getSession();

    // Retrieve user session
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Allow browsing without login
    if (user) {
        return supabaseResponse;
    }

    // Restrict access to `/cart` and `/api/cart` without login
    if (
        request.nextUrl.pathname.startsWith("/cart") ||
        (request.nextUrl.pathname.startsWith("/api/cart") &&
            (request.method === "POST" || request.method === "PUT"))
    ) {
        if (request.nextUrl.pathname.startsWith("/cart")) {
            return NextResponse.json(
                { error: "Login required to add items to cart" },
                { status: 401 }
            );
        }

        // Redirect to login page with return URL
        const url = new URL("/login", request.nextUrl.origin);
        url.searchParams.set("redirect", request.nextUrl.pathname);
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}

export const config = {
    matcher: ["/cart", "/api/cart"], // Apply middleware to these routes only
};

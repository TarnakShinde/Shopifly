import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function updateSession(request) {
    const cookieStore = await cookies(); // Ensure cookies are awaited

    // Create Supabase client with proper session handling
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                async get(name) {
                    const cookie = await cookieStore.get(name);
                    return cookie?.value || "";
                },
                async set(name, value, options) {
                    await cookieStore.set({ name, value, ...options });
                },
                async remove(name, options) {
                    await cookieStore.set({ name, value: "", ...options });
                },
            },
        }
    );

    // Refresh the session
    const {
        data: { session },
        error,
    } = await supabase.auth.getSession();

    if (error) {
        console.error("Error fetching session:", error.message);
    }

    // Retrieve user session
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Allow browsing without login
    if (user) {
        return NextResponse.next();
    }

    // Restrict adding to cart without login
    if (
        request.nextUrl.pathname.includes("/cart") ||
        (request.nextUrl.pathname.includes("/api/cart") &&
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

    return NextResponse.next();
}

export const config = {
    matcher: ["/cart", "/api/cart"], // Apply middleware only to cart-related routes
};

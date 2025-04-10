import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request) {
    let response = NextResponse.next();

    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                cookies: {
                    get(name) {
                        return request.cookies.get(name)?.value;
                    },
                    set(name, value, options) {
                        response.cookies.set({
                            name,
                            value,
                            ...options,
                        });
                    },
                    remove(name, options) {
                        response.cookies.delete({
                            name,
                            ...options,
                        });
                    },
                },
            }
        );

        // Try getting the session, but don't throw if it fails
        try {
            await supabase.auth.getSession();
        } catch (error) {
            console.error("Auth session error in middleware:", error);
            // Continue with the request even if session fetch fails
        }

        // Get user if session exists, but wrap in try/catch
        let user = null;
        try {
            const { data } = await supabase.auth.getUser();
            user = data.user;
        } catch (error) {
            console.error("Get user error in middleware:", error);
            // Continue with null user
        }

        // Rest of your middleware logic
        // ...
    } catch (error) {
        console.error("Middleware error:", error);
        // Return normal response if middleware fails
        return response;
    }

    return response;
}

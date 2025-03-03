"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
    // Get the cookies container
    const cookieStore = cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                get(name) {
                    // Access cookies safely and synchronously
                    const cookie = cookieStore.get(name);
                    return cookie?.value;
                },
                set(name, value, options) {
                    try {
                        // Set cookie safely
                        cookieStore.set({ name, value, ...options });
                    } catch (error) {
                        // The `set` method was called from a Server Component.
                        // This can be safely ignored if you have middleware handling auth.
                    }
                },
                remove(name, options) {
                    try {
                        // Remove cookie by setting empty value
                        cookieStore.set({ name, value: "", ...options });
                    } catch (error) {
                        // The `delete` method was called from a Server Component.
                        // This can be safely ignored if you have middleware handling auth.
                    }
                },
            },
        }
    );
}

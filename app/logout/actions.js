"use server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
    const cookieStore = cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                get(name) {
                    return cookieStore.get(name)?.value;
                },
                set(name, value, options) {
                    cookieStore.set({ name, value, ...options });
                },
                remove(name, options) {
                    cookieStore.delete(name, options);
                },
            },
        }
    );

    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Logout error:", error);
        return {
            success: false,
            error: error.message,
        };
    }

    redirect("/login");
}

export async function logoutActionforDashboard() {
    const cookieStore = cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                get(name) {
                    return cookieStore.get(name)?.value;
                },
                set(name, value, options) {
                    cookieStore.set({ name, value, ...options });
                },
                remove(name, options) {
                    cookieStore.delete(name, options);
                },
            },
        }
    );

    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Logout error:", error);
        return {
            success: false,
            error: error.message,
        };
    }

    redirect("/login");
}

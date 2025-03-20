// app/login/actions.js
"use server";
// import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "../../utils/supabase/server";

export async function login(formData) {
    // const cookieStore = await cookies();

    // const supabase = createServerClient(
    //     process.env.NEXT_PUBLIC_SUPABASE_URL,
    //     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    //     {
    //         cookies: {
    //             get(name) {
    //                 return cookieStore.get(name)?.value;
    //             },
    //             set(name, value, options) {
    //                 cookieStore.set({ name, value, ...options });
    //             },
    //             remove(name, options) {
    //                 cookieStore.delete({ name, ...options });
    //             },
    //         },
    //     }
    // );
    const supabase = createClient();
    const data = {
        email: formData.get("email"),
        password: formData.get("password"),
    };

    const { data: authData, error } = await supabase.auth.signInWithPassword(
        data
    );

    if (error) {
        return { success: false, error: error.message };
    }

    const userId = authData.user.id;

    // Fetch user role from profiles table
    const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("userRole")
        .eq("userid", userId)
        .single();

    if (profileError) {
        return { success: false, error: "Failed to fetch user profile" };
    }

    return { success: true, userRole: profileData.userRole };
}

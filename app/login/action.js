"use server";
import { createClient } from "../../utils/supabase/server";
import { cookies } from "next/headers";

export async function login(formData) {
    const supabase = await createClient();
    const data = {
        email: formData.get("email"),
        password: formData.get("password"),
    };

    // Sign in the user - this automatically creates a session
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

    // The session is automatically created by Supabase
    // Verify that the session was created successfully
    const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
        return { success: false, error: "Failed to create user session" };
    }

    // Set session cookie for further verification
    const cookieStore = cookies();
    cookieStore.set("user-session", "active", {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });

    return {
        success: true,
        userRole: profileData.userRole,
        userId: userId,
        sessionActive: true,
    };
}

"use server";
import { createClient } from "../../utils/supabase/server";

export async function login(formData) {
    const supabase = await createClient();
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

"use server";
import { createClient } from "../utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Login action
export async function login(formData, redirectUrl = "/") {
    const supabase = await createClient();

    const data = {
        email: formData.get("email"),
        password: formData.get("password"),
    };

    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
        console.error("Login error:", error.message);
        // You could return the error instead of redirecting to show on the form
        return { error: error.message };
    }

    // If we have a redirect URL, use it, otherwise go to homepage
    revalidatePath("/", "layout");
    redirect(redirectUrl);
}

// Signup action
export async function signup(formData, redirectUrl = "/") {
    const supabase = await createClient();

    const data = {
        email: formData.get("email"),
        password: formData.get("password"),
    };

    const { error } = await supabase.auth.signUp(data);

    if (error) {
        console.error("Signup error:", error.message);
        return { error: error.message };
    }

    // After signup, log them in automatically
    return login(formData, redirectUrl);
}

// Check auth status - can be used in components
export async function getSession() {
    const supabase = await createClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();
    return session;
}

// Logout action
export async function logout(redirectUrl = "/") {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Logout error:", error.message);
        return { error: error.message };
    }

    revalidatePath("/", "layout");
    redirect(redirectUrl);
}

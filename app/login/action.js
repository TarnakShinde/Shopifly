"use server";
import { createClient } from "../../utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

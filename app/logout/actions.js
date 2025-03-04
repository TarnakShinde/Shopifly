"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "../../utils/supabase/server";

export async function logoutAction() {
    const cookieStore = await cookies(); // Ensure cookies() is awaited

    // Pass cookies to createClient to maintain authentication context
    const supabase = createClient(cookieStore);

    if (!supabase || !supabase.auth) {
        console.error("Supabase client is not initialized correctly.");
        return;
    }

    // Sign out the user
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Error signing out:", error.message);
        return;
    }

    // Redirect after successful logout
    redirect("/");
}

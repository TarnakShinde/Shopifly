"use server";

import { createClient } from "../../utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
    const cookieStore = cookies();
    const supabase = createClient({ cookies: () => cookieStore });

    await supabase.auth.signOut();
    redirect("/");
}

import { redirect } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";

export default async function Profile({ searchParams }) {
    const { id } = searchParams();
    const supabase = createClient();

    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
        redirect("/login");
    }

    return <p>Hello {data.user.email}</p>;
}

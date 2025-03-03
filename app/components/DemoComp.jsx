"use client";
import { createBrowserClient } from "@supabase/ssr";
import { useState, useEffect } from "react";

const DemoComp = () => {
    const [users, setUsers] = useState(null);
    useEffect(() => {
        async function getUser() {
            const supabase = createBrowserClient();
            const { data, error } = await supabase.auth.getUser();
            if (error || !data?.user) {
                console.log("no user");
            } else {
                setUsers(data.user);
            }
        }
        getUser();
    }, []);
    console.log(users);
    return <h2>Client Components: {users}</h2>;
};

export default DemoComp;

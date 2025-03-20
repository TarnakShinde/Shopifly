// contexts/AuthContext.js
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

// Create the auth context
const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            setUser(session?.user || null);
            setLoading(false);

            // Set up auth listener
            const {
                data: { subscription },
            } = supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user || null);
            });

            return () => subscription?.unsubscribe();
        };

        getInitialSession();
    }, []);

    const login = async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        // Check for redirect after auth
        if (typeof window !== "undefined") {
            const redirectPath = sessionStorage.getItem("redirectAfterAuth");
            if (redirectPath) {
                sessionStorage.removeItem("redirectAfterAuth");
                router.push(redirectPath);
            }
        }
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        router.push("/");
    };

    const register = async (email, password, metadata = {}) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
            },
        });

        if (error) throw error;
    };

    const value = {
        user,
        loading,
        login,
        logout,
        register,
        isLoggedIn: !!user,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

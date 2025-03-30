// contexts/AuthContext.js
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client";

// Create the auth context
const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                setUser(session?.user || null);
            } catch (error) {
                console.error("Failed to get initial session", error);
            } finally {
                setLoading(false);
            }
        };

        // Set up auth listener
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth state change event:", event); // Debugging log
            setUser(session?.user || null);
        });

        getInitialSession();

        return () => {
            subscription?.unsubscribe();
        };
    }, [supabase]);

    const login = async (email, password) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Check for redirect after auth
            if (typeof window !== "undefined") {
                const redirectPath =
                    sessionStorage.getItem("redirectAfterAuth");
                if (redirectPath) {
                    sessionStorage.removeItem("redirectAfterAuth");
                    router.push(redirectPath);
                }
            }
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            router.push("/");
        } catch (error) {
            console.error("Logout failed:", error);
            throw error;
        }
    };

    const register = async (email, password, metadata = {}) => {
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata,
                },
            });

            if (error) throw error;
        } catch (error) {
            console.error("Registration failed:", error);
            throw error;
        }
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

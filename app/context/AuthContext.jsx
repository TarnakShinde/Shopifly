"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "../../utils/supabase/client";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
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

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user || null);
        });

        getInitialSession();
        return () => subscription?.unsubscribe();
    }, []);

    const login = async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    const register = async (email, password, metadata = {}) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: metadata },
        });
        if (error) throw error;
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isLoggedIn: !!user,
                login,
                logout,
                register,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

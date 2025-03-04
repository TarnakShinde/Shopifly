"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function useAuthRedirect() {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authAction, setAuthAction] = useState("login"); // "login" or "signup"
    const router = useRouter();
    const pathname = usePathname();

    // Function to open auth modal when user tries to add to cart/favorites
    const requireAuth = (action = "login") => {
        setAuthAction(action);
        setShowAuthModal(true);
        // Store current URL for redirection after auth
        sessionStorage.setItem("redirectAfterAuth", pathname);
    };

    const closeAuthModal = () => {
        setShowAuthModal(false);
    };

    return {
        showAuthModal,
        authAction,
        requireAuth,
        closeAuthModal,
        redirectUrl: pathname,
    };
}

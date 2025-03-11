"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const ResetPasswordPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [tokenError, setTokenError] = useState(false);
    const [checkingToken, setCheckingToken] = useState(true);

    useEffect(() => {
        // Initialize Supabase client
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        async function checkSession() {
            try {
                // Get current session
                const {
                    data: { session },
                    error: sessionError,
                } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error("Session error:", sessionError);
                    setTokenError(true);
                    setError(
                        "Authentication error. Please request a new password reset link."
                    );
                    return;
                }

                // If there's no session, check for hash parameters (Supabase uses URL hash for auth)
                if (!session) {
                    // Get hash from URL if available
                    const hash = window.location.hash;

                    if (!hash || hash.length === 0) {
                        setTokenError(true);
                        setError(
                            "Missing authentication token. Please request a new password reset link."
                        );
                        return;
                    }

                    // Try to set session from hash
                    const { error: hashError } =
                        await supabase.auth.getSessionFromUrl();

                    if (hashError) {
                        console.error("Hash error:", hashError);
                        setTokenError(true);
                        setError(
                            "Invalid reset token. Please request a new password reset link."
                        );
                        return;
                    }
                }

                // Success - we have a valid session
                setTokenError(false);
            } catch (err) {
                console.error("Token validation error:", err);
                setTokenError(true);
                setError(
                    "Error validating reset token. Please request a new password reset link."
                );
            } finally {
                setCheckingToken(false);
            }
        }

        checkSession();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Reset states
        setError(null);
        setSuccess(null);

        // Validation
        if (!newPassword || !confirmPassword) {
            setError("Both fields are required");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        try {
            setLoading(true);

            // Initialize Supabase client
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            );

            // Update the user's password
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (updateError) {
                throw new Error(updateError.message);
            }

            // Show success message
            setSuccess("Password updated successfully!");

            // Clear form
            setNewPassword("");
            setConfirmPassword("");

            // Redirect after a delay
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch (err) {
            console.error("Error updating password:", err);
            setError(
                typeof err === "string"
                    ? err
                    : err.message || "Failed to update password"
            );
        } finally {
            setLoading(false);
        }
    };

    if (checkingToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 text-center">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Verifying Reset Link
                        </h2>
                        <div className="mt-4">
                            <svg
                                className="animate-spin h-8 w-8 mx-auto text-blue-600"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Set New Password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Please enter and confirm your new password
                    </p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                        {success}
                    </div>
                )}

                {tokenError ? (
                    <div className="text-center">
                        <p className="text-red-600 mb-4">
                            The password reset link is invalid or has expired.
                        </p>
                        <button
                            onClick={() => router.push("/change-password")}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Request New Reset Link
                        </button>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label
                                    htmlFor="new-password"
                                    className="sr-only"
                                >
                                    New Password
                                </label>
                                <input
                                    id="new-password"
                                    name="newPassword"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                    placeholder="New password"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="confirm-password"
                                    className="sr-only"
                                >
                                    Confirm Password
                                </label>
                                <input
                                    id="confirm-password"
                                    name="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                    placeholder="Confirm password"
                                />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                id="show-password"
                                name="show-password"
                                type="checkbox"
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                                htmlFor="show-password"
                                className="ml-2 block text-sm text-gray-900"
                            >
                                Show password
                            </label>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                            >
                                {loading ? (
                                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                        <svg
                                            className="animate-spin h-5 w-5 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                    </span>
                                ) : (
                                    "Update Password"
                                )}
                            </button>
                        </div>
                    </form>
                )}

                <div className="text-sm text-center">
                    <button
                        onClick={() => router.push("/login")}
                        className="font-medium text-blue-600 hover:text-blue-500"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;

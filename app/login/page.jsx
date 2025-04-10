"use client";
import { Eye, EyeOff } from "lucide-react";
import { login } from "./action";
import { ToastContainer, toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [userId, setUserId] = useState(null);
    const router = useRouter();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(e.target);

        try {
            const result = await login(formData);

            if (result.success && result.sessionActive) {
                // Show success toast
                toast.success("Login successful!", {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "colored",
                });

                // Set user data from the result
                setUserRole(result.userRole);
                setUserId(result.userId);

                // Store user info in localStorage for client-side access
                localStorage.setItem(
                    "shopifly_user",
                    JSON.stringify({
                        id: result.userId,
                        role: result.userRole,
                    })
                );

                // Let the toast show before redirecting
                setTimeout(() => {
                    if (result.userRole === "admin") {
                        router.push("/admin/dashboard");
                    } else {
                        router.push("/");
                    }
                }, 1500);
            } else {
                // Display error toast
                toast.error(result.error || "Login failed", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "colored",
                });
                setError(result.error || "Login failed");
            }
        } catch (err) {
            toast.error("An unexpected error occurred", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "colored",
            });
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 max-h-screen">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <div className="mx-auto h-10 w-auto text-4xl text-center font-bold">
                        SHOPI<span className="text-green-500">FLY</span>
                    </div>
                    <h2 className="mt-10 text-center text-2xl/9 tracking-tight text-gray-900">
                        Login to Shopifly
                    </h2>
                </div>
                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm/6 font-medium text-gray-900"
                            >
                                Email address
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="block text-sm/6 font-medium text-gray-900"
                                >
                                    Password
                                </label>
                                <div className="text-sm">
                                    <a
                                        href="/change-password"
                                        className="font-semibold text-indigo-600 hover:text-indigo-500"
                                    >
                                        Forgot password?
                                    </a>
                                </div>
                            </div>
                            <div className="mt-2 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    autoComplete="current-password"
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-2 top-2"
                                >
                                    {showPassword ? <EyeOff /> : <Eye />}
                                </button>
                            </div>
                            <p className="text-center text-gray-600 mt-4">
                                Don't have an account?{" "}
                                <span className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer">
                                    <Link href="/signup">Sign Up</Link>
                                </span>
                            </p>
                        </div>
                        {error && (
                            <div className="text-red-500 text-sm">{error}</div>
                        )}
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                                    isLoading
                                        ? "opacity-70 cursor-not-allowed"
                                        : ""
                                }`}
                            >
                                {isLoading ? "Logging in..." : "Login"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

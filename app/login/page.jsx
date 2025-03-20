"use client";
import { Eye, EyeOff } from "lucide-react";
import { login } from "./action.js";
import { ToastContainer, toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [userRole, setUserRole] = useState(null);
    const router = useRouter();

    const handleLogin = async (formData) => {
        const result = await login(formData);

        if (result?.error) {
            // Display error toast
            toast.error(result.error, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "colored",
            });
            setError(result.error);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const result = await login(formData);

        if (result.success) {
            setUserRole(result.userRole); // Set the user role on successful login
        } else {
            setError(result.error); // Handle error if login fails
        }
    };

    useEffect(() => {
        if (userRole === "admin") {
            router.push("/admin/dashboard"); // Redirect to dashboard if admin
        } else if (userRole === "user") {
            router.push("/"); // Redirect to home if not an admin
        }
    }, [userRole, router]);
    useEffect(() => {
        if (userRole === "admin") {
            router.push("/dashboard"); // Redirect to dashboard if admin
            setTimeout(() => {
                window.location.href = result.redirectUrl || "/dashboard";
            }, 100);
        } else if (userRole === "user") {
            router.push("/"); // Redirect to home if not an admin
            setTimeout(() => {
                window.location.href = result.redirectUrl || "/";
            }, 100);
        }
    }, [userRole, router]);

    return (
        <div>
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
                                <p className="text-center text-gray-600 mt-4">
                                    Don't have an account?{" "}
                                    <span className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer">
                                        <Link href="/signup">Sign Up</Link>
                                    </span>
                                </p>
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-2 top-2"
                                >
                                    {showPassword ? <EyeOff /> : <Eye />}
                                </button>
                            </div>
                        </div>
                        {error && (
                            <div className="text-red-500 text-sm">{error}</div>
                        )}
                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Login
                            </button>
                            <ToastContainer />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

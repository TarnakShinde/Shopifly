"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrderSuccessPage() {
    const [animationComplete, setAnimationComplete] = useState(false);

    useEffect(() => {
        // Trigger animation complete after 2 seconds
        const timer = setTimeout(() => {
            setAnimationComplete(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                <div className="flex justify-center">
                    {/* Success checkmark animation */}
                    <div className="relative w-24 h-24 mb-6">
                        <div className="absolute inset-0 rounded-full border-4 border-green-500 opacity-25 animate-ping"></div>
                        <div
                            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
                                animationComplete ? "opacity-100" : "opacity-0"
                            }`}
                        >
                            <svg
                                className="w-16 h-16 text-green-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                ></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    Order Successful!
                </h1>
                <p className="text-gray-600 mb-6">
                    Thank you for your purchase. Your order has been placed
                    successfully and is being processed.
                </p>

                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">
                        A confirmation email has been sent to your registered
                        email address with your order details.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <Link
                        href="/myOrder"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition duration-200"
                    >
                        View My Orders
                    </Link>
                    <Link
                        href="/"
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg transition duration-200"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>

            <div className="mt-8 text-sm text-gray-500">
                <p>
                    Having trouble with your order?{" "}
                    <Link
                        href="/contact"
                        className="text-blue-600 hover:underline"
                    >
                        Contact support
                    </Link>
                </p>
            </div>
        </div>
    );
}

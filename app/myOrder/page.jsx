"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function MyOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [user, setUser] = useState(null);
    const limit = 5; // Items per page
    const router = useRouter();

    useEffect(() => {
        const checkAuthAndFetchOrders = async () => {
            try {
                // First check if we have a valid user
                const {
                    data: { user },
                    error: authError,
                } = await supabase.auth.getUser();

                if (authError || !user) {
                    throw new Error("Authentication required. Please login.");
                }

                setUser(user);
                // After setting user, fetch orders
                fetchOrders(user.id);
            } catch (err) {
                console.error("Authentication error:", err);
                setError(
                    err.message || "Authentication required. Please login."
                );
                setLoading(false);
            }
        };

        checkAuthAndFetchOrders();
    }, []);

    useEffect(() => {
        if (user) {
            fetchOrders(user.id);
        }
    }, [page, user]);

    const fetchOrders = async (userId) => {
        if (!userId) return;

        try {
            setLoading(true);

            const response = await fetch(
                `/api/orders?id=${userId}&page=${page}&limit=${limit}`
            );
            const result = await response.json();

            console.log("API response:", result); // Debug log

            if (!response.ok) {
                throw new Error(result.message || "Failed to fetch orders");
            }

            // Make sure data is an array before setting it
            const orderData = Array.isArray(result.data) ? result.data : [];
            setOrders(orderData);
            setTotalPages(Math.ceil((result.total || 0) / limit));
            setLoading(false);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError(
                err.message || "Failed to load orders. Please try again later."
            );
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        console.log("Date string:", dateString); // Debug log
        if (!dateString) return "N/A";

        try {
            const date = new Date(dateString);

            // Format as DD/MM/YYYY
            const day = date.getDate().toString().padStart(2, "0");
            const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-indexed
            const year = date.getFullYear();

            return `${day}/${month}/${year}`;
        } catch (e) {
            console.error("Date formatting error:", e);
            console.log("Original date string:", dateString);
            return dateString; // Return original string if formatting fails
        }
    };

    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return "₹0.00";

        try {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "INR",
            }).format(amount);
        } catch (e) {
            console.error("Currency formatting error:", e);
            return `₹${amount}`; // Fallback formatting
        }
    };

    const getStatusClass = (status) => {
        if (!status) return "bg-gray-100 text-gray-800";

        switch (status.toLowerCase()) {
            case "delivered":
                return "bg-green-100 text-green-800";
            case "processing":
            case "pending":
                return "bg-blue-100 text-blue-800";
            case "shipped":
                return "bg-purple-100 text-purple-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-yellow-100 text-yellow-800";
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (window.confirm("Are you sure you want to cancel this order?")) {
            try {
                if (!user || !user.id) {
                    throw new Error("User authentication required");
                }

                const response = await fetch("/api/orders", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        orderId: orderId,
                        userId: user.id,
                        status: "cancelled",
                    }),
                });

                const result = await response.json();
                console.log("Cancel order response:", result); // Debug log

                if (!response.ok) {
                    throw new Error(result.message || "Failed to cancel order");
                }

                // Refresh the orders list
                console.log("Update hua");
                fetchOrders(user.id);
            } catch (err) {
                console.error("Error cancelling order:", err);
                alert("Failed to cancel order. Please try again later.");
            }
        }
    };

    if (loading && orders.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse flex space-x-4">
                        <div className="flex-1 space-y-6 py-1">
                            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                            <div className="space-y-3">
                                <div className="h-64 bg-gray-200 rounded"></div>
                                <div className="h-64 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-2xl font-semibold text-red-600">
                        Error
                    </h1>
                    <p className="mt-2 text-gray-600">{error}</p>
                    <button
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={() => user && fetchOrders(user.id)}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    My Orders
                </h1>

                {orders.length === 0 ? (
                    <div className="bg-white shadow overflow-hidden rounded-lg p-6 text-center">
                        <p className="text-gray-500">
                            You haven't placed any orders yet.
                        </p>
                        <Link
                            href="/"
                            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="bg-white shadow overflow-hidden rounded-lg"
                                >
                                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-800">
                                                Order #
                                                {order.id
                                                    ? order.id.substring(0, 8)
                                                    : "Unknown"}
                                            </h2>
                                            <p className="text-sm text-gray-500">
                                                Placed on {order.date}
                                            </p>
                                        </div>
                                        <div>
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(
                                                    order.status
                                                )}`}
                                            >
                                                {order.status.toUpperCase() ||
                                                    "Unknown"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="px-6 py-4">
                                        {Array.isArray(order.products) &&
                                        order.products.length > 0 ? (
                                            order.products.map(
                                                (product, index) => (
                                                    <div
                                                        key={`${
                                                            product.id || index
                                                        }`}
                                                        className="flex items-center py-4 border-b border-gray-100 last:border-0"
                                                    >
                                                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                            {product.image1 ? (
                                                                <Image
                                                                    src={
                                                                        product.image1
                                                                    }
                                                                    alt={
                                                                        product.product_name ||
                                                                        "Product"
                                                                    }
                                                                    width={80}
                                                                    height={80}
                                                                    className="h-full w-full object-contain object-center"
                                                                />
                                                            ) : (
                                                                <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                                                                    No Image
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="ml-4 flex-1 flex flex-col">
                                                            <div>
                                                                <div className="flex justify-between text-base font-medium text-gray-900">
                                                                    <h3>
                                                                        {product.product_name ||
                                                                            "Unnamed Product"}
                                                                    </h3>
                                                                    <p className="ml-4">
                                                                        {formatCurrency(
                                                                            product.discounted_price
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                <p className="mt-1 text-sm text-gray-500">
                                                                    Quantity:{" "}
                                                                    {product.quantity ||
                                                                        0}
                                                                </p>
                                                            </div>
                                                            <div className="flex-1 flex items-end justify-between text-sm">
                                                                <p className="text-gray-500">
                                                                    Subtotal:{" "}
                                                                    {formatCurrency(
                                                                        (product.discounted_price ||
                                                                            0) *
                                                                            (product.quantity ||
                                                                                0)
                                                                    )}
                                                                </p>

                                                                <div className="flex">
                                                                    {product.product_uniq_id && (
                                                                        <Link
                                                                            href={`/products/${product.product_uniq_id}`}
                                                                            className="font-medium text-blue-600 hover:text-blue-500"
                                                                        >
                                                                            View
                                                                            Product
                                                                        </Link>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            )
                                        ) : (
                                            <div className="py-4 text-center text-gray-500">
                                                No product details available
                                            </div>
                                        )}
                                    </div>

                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                        <div className="flex justify-between text-base font-medium text-gray-900">
                                            <p>Total</p>
                                            <p>
                                                {formatCurrency(
                                                    order.total_price
                                                )}
                                            </p>
                                        </div>
                                        {order.shippingDetails && (
                                            <div className="mt-2 text-sm text-gray-500">
                                                <p>
                                                    Shipping to:{" "}
                                                    {order.shippingDetails
                                                        .address ||
                                                        "Address not available"}
                                                </p>
                                                {order.shippingDetails
                                                    .trackingNumber && (
                                                    <p className="mt-1">
                                                        Tracking:{" "}
                                                        {
                                                            order
                                                                .shippingDetails
                                                                .trackingNumber
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        <div className="mt-4 flex justify-end space-x-3">
                                            {order.id && (
                                                <Link
                                                    href={`/orders/${order.id}`}
                                                    className="text-sm font-medium text-blue-600 hover:text-blue-500 border border-blue-600 bg-blue-50 hover:bg-blue-60 px-2 py-1 rounded"
                                                >
                                                    View Order Details
                                                </Link>
                                            )}
                                            {order.status &&
                                                (order.status.toLowerCase() ===
                                                    "processing" ||
                                                    order.status.toLowerCase() ===
                                                        "pending") && (
                                                    <button
                                                        className="text-sm font-medium text-red-600 hover:text-red-500 border border-red-600 bg-red-50 px-2 py-1 rounded hover:bg-red-60"
                                                        onClick={() =>
                                                            handleCancelOrder(
                                                                order.id
                                                            )
                                                        }
                                                    >
                                                        Cancel Order
                                                    </button>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center">
                                <nav
                                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                                    aria-label="Pagination"
                                >
                                    <button
                                        onClick={() =>
                                            setPage((prev) =>
                                                Math.max(1, prev - 1)
                                            )
                                        }
                                        disabled={page === 1}
                                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                                            page === 1
                                                ? "text-gray-300"
                                                : "text-gray-500 hover:bg-gray-50"
                                        }`}
                                    >
                                        Previous
                                    </button>

                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPage(i + 1)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                page === i + 1
                                                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() =>
                                            setPage((prev) =>
                                                Math.min(totalPages, prev + 1)
                                            )
                                        }
                                        disabled={page === totalPages}
                                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                                            page === totalPages
                                                ? "text-gray-300"
                                                : "text-gray-500 hover:bg-gray-50"
                                        }`}
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

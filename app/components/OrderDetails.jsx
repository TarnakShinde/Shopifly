// components/OrderDetails.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import Image from "next/image";

export default function OrderDetails({ orderId }) {
    const [order, setOrder] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchOrderDetails() {
            if (!orderId) return;
            try {
                setLoading(true);
                // Fetch the order from Supabase
                const { data: orderData, error: orderError } = await supabase
                    .from("orders")
                    .select("*")
                    .eq("id", orderId)
                    .single();

                if (orderError) throw orderError;
                if (!orderData) {
                    throw new Error("Order not found");
                }

                // Extract shipping details from order data
                const shippingDetails = orderData.shippingdetails || {
                    zip: "",
                    city: "",
                    email: "",
                    phone: "",
                    address: "",
                    fullName: "",
                };

                setOrder(orderData);
                setUserData(shippingDetails); // Use shipping details instead of profile data
            } catch (err) {
                console.error("Failed to fetch order details:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchOrderDetails();
    }, [orderId, supabase]);

    const handleDownload = async () => {
        try {
            const response = await fetch(`/api/invoice?orderId=${orderId}`);
            if (!response.ok) throw new Error("Failed to download invoice");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `invoice-${orderId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            alert(error.message);
            console.error("Download error:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <h2 className="text-xl font-semibold text-red-600 mb-2">
                    Error Loading Order
                </h2>
                <p className="text-red-500">{error}</p>
                <Link
                    href="/orders"
                    className="mt-4 inline-block text-blue-600 hover:underline"
                >
                    Return to Orders
                </Link>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <h2 className="text-xl font-semibold text-yellow-600">
                    Order Not Found
                </h2>
                <p className="text-gray-600 mt-2">
                    The order you're looking for doesn't exist or has been
                    removed.
                </p>
                <Link
                    href="/orders"
                    className="mt-4 inline-block text-blue-600 hover:underline"
                >
                    Return to Orders
                </Link>
            </div>
        );
    }

    // Parse the JSON data
    const orderItems = Array.isArray(order.products) ? order.products : [];
    console.log("Chere: ", orderItems);
    const shippingDetails = order.shipping_details || {};

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Order Header */}
            <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-semibold text-gray-800">
                        Order #{order.id.substring(0, 8).toUpperCase()}
                    </h1>
                    <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                            order.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : order.status === "processing"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : order.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                    >
                        {order.status?.charAt(0).toUpperCase() +
                            order.status?.slice(1)}
                    </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                    Placed on {new Date(order.created_at).toLocaleDateString()}{" "}
                    at {new Date(order.created_at).toLocaleTimeString()}
                </p>
            </div>

            {/* Order Summary */}
            <div className="grid md:grid-cols-3 gap-6 p-6 border-b">
                {/* Customer Info */}
                <div>
                    <h2 className="font-medium text-gray-800 mb-2">Customer</h2>
                    <p>{shippingDetails?.fullName || "Customer"}</p>
                    <p className="text-sm text-gray-600">
                        {shippingDetails?.email || "No email provided"}
                    </p>
                    <p className="text-sm text-gray-600">
                        {shippingDetails.phone || "No phone provided"}
                    </p>
                </div>

                {/* Shipping Address */}
                <div>
                    <h2 className="font-medium text-gray-800 mb-2">
                        Shipping Address
                    </h2>
                    <p>{shippingDetails.fullName || "No name provided"}</p>
                    <p>{shippingDetails.address || "No address provided"}</p>
                    <p>
                        {shippingDetails.city}
                        {shippingDetails.city && shippingDetails.zip
                            ? ", "
                            : ""}
                        {shippingDetails.zip}
                    </p>
                    <p>{shippingDetails.phone}</p>
                    <p>{shippingDetails.email}</p>
                </div>

                {/* Payment Method */}
                <div>
                    <h2 className="font-medium text-gray-800 mb-2">
                        Payment Method
                    </h2>
                    <p>{order.paymentMode}</p>
                </div>
            </div>

            {/* Order Items */}
            <div className="p-6 border-b">
                <h2 className="font-medium text-gray-800 mb-4">Order Items</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Product
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Price
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Quantity
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Total
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orderItems.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {item.image1 && (
                                                <div className="flex-shrink-0 h-12 w-12 mr-4">
                                                    <Image
                                                        className="rounded object-contain"
                                                        src={item.image1}
                                                        width={48}
                                                        height={48}
                                                        alt={item.product_name}
                                                    />
                                                </div>
                                            )}
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {item.product_name}
                                                </div>
                                                {item.product_uniq_id && (
                                                    <div className="text-sm text-gray-500">
                                                        PID:{" "}
                                                        {item.product_uniq_id}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                        ₹
                                        {parseFloat(
                                            item.discounted_price
                                        ).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                        {item.quantity}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        ₹
                                        {(
                                            parseFloat(item.discounted_price) *
                                            item.quantity
                                        ).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Totals */}
            <div className="p-6 bg-gray-50">
                <div className="max-w-md ml-auto">
                    <div className="flex justify-between py-2">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">
                            ₹{parseFloat(order.total_price).toFixed(2)}
                        </span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-lg font-semibold">
                            ₹
                            {(
                                parseFloat(order.total_price) +
                                parseFloat(shippingDetails.shippingFee || 0)
                            ).toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
                <Link
                    href="/myOrder"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                    Return to Orders
                </Link>
                <div className="space-x-3">
                    <button
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 border-gray-300"
                        onClick={handleDownload}
                    >
                        Download Invoice
                    </button>
                    {order.status !== "completed" &&
                        order.status !== "cancelled" && (
                            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                                Track Order
                            </button>
                        )}
                </div>
            </div>
        </div>
    );
}

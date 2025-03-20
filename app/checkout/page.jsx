"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import Image from "next/image";

export default function CheckoutPage() {
    const router = useRouter();
    const [cartItems, setCartItems] = useState([]);
    const [user, setUser] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
    const [shippingDetails, setShippingDetails] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        zip: "",
    });

    const [error, setError] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const totalPrice = cartItems.reduce((total, item) => {
        return (
            total +
            (Number(item.discounted_price) || 0) * (Number(item.quantity) || 1)
        );
    }, 0);

    useEffect(() => {
        async function fetchUser() {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                setShippingDetails((prev) => ({ ...prev, email: user.email }));
            } else {
                router.push("/login");
            }
        }

        fetchUser();
    }, [router]);

    useEffect(() => {
        async function fetchCartItems() {
            if (!user) return;
            const { data, error } = await supabase
                .from("cart")
                .select("*")
                .eq("user_id", user.id);
            if (!error && data) {
                setCartItems(data);
            } else {
                setError("Failed to load cart items");
            }
        }

        if (user) {
            fetchCartItems();
        }
    }, [user]);

    async function handleCheckout() {
        if (
            !shippingDetails.fullName ||
            !shippingDetails.address ||
            !shippingDetails.phone ||
            !shippingDetails.city ||
            !shippingDetails.zip
        ) {
            setError("Please fill in all required fields.");
            return;
        }

        setIsProcessing(true);
        setError("");

        try {
            // Begin a transaction to ensure all operations succeed or fail together
            // First, create the order
            const { data: orderData, error: orderError } = await supabase
                .from("orders")
                .insert([
                    {
                        user_id: user.id,
                        products: cartItems,
                        total_price: totalPrice,
                        shipping_details: shippingDetails,
                        paymentMode: paymentMethod,
                        status: "pending",
                    },
                ])
                .select();

            if (orderError) {
                throw new Error(
                    "Failed to create order: " + orderError.message
                );
            }

            // Now update the stock for each product
            const stockUpdatePromises = cartItems.map(async (item) => {
                // Get current stock
                const { data: productData, error: productError } =
                    await supabase
                        .from("products")
                        .select("productstockquantity")
                        .eq("uniq_id", item.uniq_id)
                        .single();

                if (productError) {
                    throw new Error(
                        `Failed to fetch product ${item.uniq_id}: ${productError.message}`
                    );
                }

                const currentStock = productData.productstockquantity;
                const newStock = Math.max(0, currentStock - item.quantity);

                // Update the stock
                const { error: updateError } = await supabase
                    .from("products")
                    .update({ productstockquantity: newStock })
                    .eq("uniq_id", item.uniq_id);

                if (updateError) {
                    throw new Error(
                        `Failed to update stock for ${item.uniq_id}: ${updateError.message}`
                    );
                }
            });

            // Wait for all stock updates to complete
            await Promise.all(stockUpdatePromises);

            // Clear the cart
            const { error: cartDeleteError } = await supabase
                .from("cart")
                .delete()
                .eq("user_id", user.id);

            if (cartDeleteError) {
                throw new Error(
                    "Failed to clear cart: " + cartDeleteError.message
                );
            }

            // Redirect to success page
            router.push("/order-success");
        } catch (err) {
            console.error("Checkout error:", err);
            setError("An error occurred during checkout: " + err.message);
        } finally {
            setIsProcessing(false);
        }
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Checkout</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}

            {cartItems.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">Your cart is empty</p>
                    <button
                        onClick={() => router.push("/")}
                        className="mt-4 bg-blue-600 text-white p-2 rounded"
                    >
                        Continue Shopping
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-xl font-semibold">Order Summary</h2>
                        <div className="mt-4 space-y-4">
                            {cartItems.map((item) => (
                                <div
                                    key={item.cart_id || item.uniq_id}
                                    className="flex items-center space-x-4 border p-4 rounded-lg"
                                >
                                    <Image
                                        src={item.image1}
                                        alt={"Product Image"}
                                        priority
                                        width={64}
                                        height={64}
                                        className="object-contain bg-gray-200"
                                    />
                                    <div>
                                        <p className="font-medium">
                                            {item.product_name}
                                        </p>
                                        <p>
                                            ₹{item.discounted_price} x{" "}
                                            {item.quantity}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="border-t pt-4">
                            <div className="flex justify-between font-bold">
                                <span>Total Price:</span>
                                <span>₹{totalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold">
                            Shipping Details
                        </h2>
                        <form
                            className="space-y-4 mt-4"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleCheckout();
                            }}
                        >
                            <input
                                type="text"
                                placeholder="Full Name *"
                                value={shippingDetails.fullName}
                                onChange={(e) =>
                                    setShippingDetails({
                                        ...shippingDetails,
                                        fullName: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded"
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={shippingDetails.email}
                                readOnly
                                className="w-full p-2 border rounded bg-gray-100"
                            />
                            <input
                                type="tel"
                                placeholder="Phone Number *"
                                value={shippingDetails.phone}
                                onChange={(e) =>
                                    setShippingDetails({
                                        ...shippingDetails,
                                        phone: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Address *"
                                value={shippingDetails.address}
                                onChange={(e) =>
                                    setShippingDetails({
                                        ...shippingDetails,
                                        address: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded"
                                required
                            />
                            <input
                                type="text"
                                placeholder="City *"
                                value={shippingDetails.city}
                                onChange={(e) =>
                                    setShippingDetails({
                                        ...shippingDetails,
                                        city: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded"
                                required
                            />
                            <input
                                type="text"
                                placeholder="ZIP Code *"
                                value={shippingDetails.zip}
                                onChange={(e) =>
                                    setShippingDetails({
                                        ...shippingDetails,
                                        zip: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded"
                                required
                            />

                            <div className="space-y-2">
                                <label className="block font-semibold">
                                    Payment Method
                                </label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) =>
                                        setPaymentMethod(e.target.value)
                                    }
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="Cash on Delivery">
                                        Cash on Delivery
                                    </option>
                                    <option
                                        value="credit_card disabled"
                                        disabled
                                    >
                                        Credit Card Coming Soon
                                    </option>
                                    <option
                                        value="debit_card disabled"
                                        disabled
                                    >
                                        Debit Card Coming Soon
                                    </option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={isProcessing}
                                className={`w-full ${
                                    isProcessing
                                        ? "bg-gray-400"
                                        : "bg-blue-600 hover:bg-blue-700"
                                } text-white p-2 rounded transition`}
                            >
                                {isProcessing ? "Processing..." : "Place Order"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

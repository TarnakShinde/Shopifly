"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function CheckoutPage() {
    const router = useRouter();
    const [cartItems, setCartItems] = useState([]);
    const [user, setUser] = useState(null);
    const [shippingDetails, setShippingDetails] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        zip: "",
    });
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchUser() {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            console.log("User ka detail:", user);
            if (user) {
                setUser(user);
                setShippingDetails((prev) => ({ ...prev, email: user.email }));
            } else {
                // Redirect to login if no user is found
                router.push("/login");
            }
        }

        fetchUser();
    }, [router]);

    // Fetch cart items on page load
    useEffect(() => {
        async function fetchCartItems() {
            if (!user) return;
            const { data, error } = await supabase
                .from("cart")
                .select("*")
                .eq("user_id", user.id);
            if (!error && data) {
                setCartItems(data);
            } else if (error) {
                console.error("Error fetching cart items:", error);
                setError("Failed to load cart items");
            }
        }

        if (user) {
            fetchCartItems();
        }
    }, [user]);
    // Handle checkout process
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

        try {
            // Calculate total price safely
            const totalPrice = cartItems.reduce((total, item) => {
                const price = Number(item.discounted_price) || 0;
                const quantity = Number(item.quantity) || 1;
                return total + price * quantity;
            }, 0);

            const { data, error } = await supabase.from("orders").insert([
                {
                    user_id: user.id,
                    products: cartItems,
                    total_price: totalPrice,
                    shipping_details: shippingDetails,
                    status: "pending",
                },
            ]);

            if (error) {
                console.error("Order creation error:", error);
                setError("Checkout failed. Please try again.");
            } else {
                // Clear the cart after successful order
                await supabase.from("cart").delete().eq("user_id", user.id);

                router.push("/order-success");
            }
        } catch (err) {
            console.error("Checkout exception:", err);
            setError("An unexpected error occurred. Please try again.");
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
                    {/* Order Summary */}
                    <div>
                        <h2 className="text-xl font-semibold">Order Summary</h2>
                        <div className="mt-4 space-y-4">
                            {cartItems.map((item) => (
                                <div
                                    key={item.cart_id || item.uniq_id}
                                    className="flex items-center space-x-4 border p-4 rounded-lg"
                                >
                                    <img
                                        src={item.image1}
                                        alt={item.product_name}
                                        className="w-16 h-16 object-contain"
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

                            <div className="border-t pt-4 mt-4">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>
                                        ₹
                                        {cartItems
                                            .reduce(
                                                (total, item) =>
                                                    total +
                                                    (Number(
                                                        item.discounted_price
                                                    ) || 0) *
                                                        (Number(
                                                            item.quantity
                                                        ) || 1),
                                                0
                                            )
                                            .toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between font-bold mt-2">
                                    <span>Total:</span>
                                    <span>
                                        ₹
                                        {cartItems
                                            .reduce(
                                                (total, item) =>
                                                    total +
                                                    (Number(
                                                        item.discounted_price
                                                    ) || 0) *
                                                        (Number(
                                                            item.quantity
                                                        ) || 1),
                                                0
                                            )
                                            .toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Details */}
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
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
                            >
                                Place Order
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

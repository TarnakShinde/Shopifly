"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import { Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";

const Cart = () => {
    const { cart, removeFromCart, updateQuantity } = useCart();
    const router = useRouter();

    const calculateTotal = () => {
        return cart.reduce((total, item) => {
            const price = Number(item.discounted_price) || 0;
            const qty = Number(item.quantity) || 1;
            return total + price * qty;
        }, 0);
    };

    const handleCheckout = () => {
        router.push("/checkout");
    };

    const handleQuantityUpdate = (cartId, newQuantity) => {
        // Prevent quantity from going below 1
        if (newQuantity < 1) return;

        updateQuantity(cartId, newQuantity);
    };

    if (!cart || cart.length === 0) {
        return (
            <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg text-center">
                <p className="text-gray-500 mb-4">Your cart is empty</p>
                <button
                    onClick={() => router.push("/")}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    Browse Products
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Your Cart</h2>

            {cart.map((item) => (
                <div
                    key={
                        item.cart_id || `item-${item.uniq_id}-${Math.random()}`
                    }
                    className="flex flex-col sm:flex-row items-center justify-between border-b py-4 gap-4"
                >
                    {/* Product Image and Info */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                            <Image
                                src={item.image1 || "/placeholder-image.png"}
                                alt={item.product_name}
                                fill
                                sizes="(max-width: 768px) 64px, 80px"
                                className="object-contain rounded-md"
                                onError={(e) => {
                                    e.currentTarget.src =
                                        "/placeholder-image.png";
                                }}
                            />
                        </div>
                        <div>
                            <h3 className="font-semibold text-center sm:text-left">
                                {item.product_name}
                            </h3>
                            <p className="text-gray-500 text-center sm:text-left">
                                ₹{Number(item.discounted_price).toFixed(2)}
                            </p>
                        </div>
                    </div>

                    {/* Quantity Controls and Price */}
                    <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                        <div className="flex items-center border rounded-full overflow-hidden">
                            <button
                                onClick={() =>
                                    handleQuantityUpdate(
                                        item.cart_id,
                                        Number(item.quantity) - 1
                                    )
                                }
                                className="p-2 bg-gray-200 hover:bg-gray-300 transition"
                                aria-label="Decrease quantity"
                                disabled={Number(item.quantity) <= 1}
                            >
                                <Minus size={16} />
                            </button>
                            <span className="px-4 text-center w-8 mr-2">
                                {Number(item.quantity)}
                            </span>
                            <button
                                onClick={() =>
                                    handleQuantityUpdate(
                                        item.cart_id,
                                        Number(item.quantity) + 1
                                    )
                                }
                                className="p-2 bg-gray-200 hover:bg-gray-300 transition"
                                aria-label="Increase quantity"
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                        {/* Total Price */}
                        <span className="font-bold text-lg">
                            ₹
                            {(
                                Number(item.discounted_price) *
                                Number(item.quantity)
                            ).toFixed(2)}
                        </span>

                        {/* Delete Button */}
                        <button
                            onClick={() => removeFromCart(item.cart_id)}
                            className="text-red-500 hover:text-red-600 transition"
                            aria-label="Remove item"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>
            ))}
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <span className="font-bold text-xl">Total:</span>
                    <span className="ml-2 text-2xl font-bold text-green-600">
                        ₹{calculateTotal().toFixed(2)}
                    </span>
                </div>
                <button
                    className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition w-full sm:w-auto"
                    onClick={handleCheckout}
                >
                    Proceed to Checkout
                </button>
            </div>
        </div>
    );
};

export default Cart;

"use client";
import React from "react";
import Image from "next/image";
import { Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "../context/CartContext";

const Cart = () => {
    const { cart, removeFromCart, updateQuantity } = useCart();

    const calculateTotal = () => {
        return cart.reduce((total, item) => {
            const price = Number(item.discounted_price) || 0; // Convert to number
            const qty = Number(item.quantity) || 1; // Convert to number
            return total + price * qty;
        }, 0);
    };
    if (cart.length === 0) {
        return (
            <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg text-center">
                <p className="text-gray-500">Your cart is empty</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Your Cart</h2>
            {cart.map((item, index) => (
                <div
                    className="flex items-center justify-between border-b py-4"
                    key={index}
                >
                    <div className="flex items-center space-x-4">
                        {/* <Image
                            key={`image-${item.unique_id}`}
                            src={item.image1}
                            alt={item.product_name}
                            width={80}
                            height={80}
                            className="object-cover rounded-md"
                        /> */}
                        <Image
                            src={item.image1 || "/placeholder-image.png"} // Fallback image
                            alt={item.product_name || item.product_name}
                            width={80}
                            height={80}
                            className="object-cover rounded-md"
                        />

                        <div key={`info-${item.unique_id}`}>
                            <h3 className="font-semibold">
                                {item.product_name}
                            </h3>
                            <p className="text-gray-500">
                                ₹{item.discounted_price}
                            </p>
                        </div>
                    </div>
                    <div
                        key={`controls-${item.unique_id}`}
                        className="flex items-center space-x-4"
                    >
                        <div className="flex items-center border rounded-full">
                            <button
                                key={`minus-${item.unique_id}`}
                                onClick={() =>
                                    updateQuantity(
                                        item.unique_id,
                                        item.quantity - 1
                                    )
                                }
                                // disabled={item.quantity <= 1}
                                className="p-2 disabled:opacity-50"
                            >
                                <Minus size={16} />
                            </button>
                            <span
                                key={`quantity-${item.unique_id}`}
                                className="px-4"
                            >
                                {item.quantity}
                            </span>
                            <button
                                key={`plus-${item.unique_id}`}
                                onClick={() =>
                                    updateQuantity(
                                        item.unique_id,
                                        item.quantity + 1
                                    )
                                }
                                className="p-2"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                        <span
                            key={`total-${item.unique_id}`}
                            className="font-bold"
                        >
                            ₹
                            {(item.discounted_price * item.quantity).toFixed(2)}
                        </span>
                        <button
                            key={`delete-${item.unique_id}`}
                            onClick={() => removeFromCart(item.unique_id)}
                            className="text-red-500"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>
            ))}
            <div className="mt-6 flex justify-between items-center">
                <div>
                    <span className="font-bold text-xl">Total:</span>
                    <span className="ml-2 text-2xl font-bold text-green-600">
                        ₹{calculateTotal().toFixed(2)}
                    </span>
                </div>
                <button className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition">
                    Proceed to Checkout
                </button>
            </div>
        </div>
    );
};

export default Cart;

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
                    key={index}
                    className="flex flex-col sm:flex-row items-center justify-between border-b py-4 gap-4"
                >
                    {/* Product Image and Info */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <Image
                            src={item.image1 || "/placeholder-image.png"} // Fallback image
                            alt={item.product_name}
                            width={80}
                            height={80}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-md"
                        />
                        <div>
                            <h3 className="font-semibold text-center sm:text-left">
                                {item.product_name}
                            </h3>
                            <p className="text-gray-500 text-center sm:text-left">
                                ₹{item.discounted_price}
                            </p>
                        </div>
                    </div>

                    {/* Quantity Controls and Price */}
                    <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                        <div className="flex items-center border rounded-full overflow-hidden">
                            <button
                                onClick={() =>
                                    updateQuantity(
                                        item.cart_id,
                                        item.quantity - 1
                                    )
                                }
                                className="p-2 bg-gray-200 hover:bg-gray-300 transition"
                            >
                                <Minus size={16} />
                            </button>
                            <span className="px-4 text-center w-8 mr-2">
                                {item.quantity}
                            </span>
                            <button
                                onClick={() =>
                                    updateQuantity(
                                        item.cart_id,
                                        item.quantity + 1
                                    )
                                }
                                className="p-2 bg-gray-200 hover:bg-gray-300 transition"
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                        {/* Total Price */}
                        <span className="font-bold text-lg">
                            ₹
                            {(item.discounted_price * item.quantity).toFixed(2)}
                        </span>

                        {/* Delete Button */}
                        <button
                            onClick={() => removeFromCart(item.cart_id)}
                            className="text-red-500 hover:text-red-600 transition"
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

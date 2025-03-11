"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client";

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [user, setUser] = useState(null);
    const supabase = createClient();

    useEffect(() => {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
            setCart(JSON.parse(storedCart));
        }

        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
            if (user) fetchCart(user.id);
        });
    }, []);

    //!Fetch cart from Supabase by user_id
    const fetchCart = async (userId) => {
        if (!userId) return;

        const { data, error } = await supabase
            .from("cart")
            .select("*")
            .eq("user_id", userId);

        if (error) {
            console.error("Error fetching cart:", error);
            return;
        }

        setCart(data || []);
        localStorage.setItem("cart", JSON.stringify(data || []));
    };
    //! Add item to cart by product_uniq_id
    const addToCart = async (item) => {
        if (!user) {
            console.error("User not logged in");
            return;
        }
        if (!item || !item.product_uniq_id) {
            console.error("Invalid item:", item);
            return;
        }

        // Generate a random cart ID if it doesn't exist
        const cartId =
            item.cart_id ||
            `cart_${Math.random().toString(36).substring(2, 15)}`;

        // Ensure the item has the correct fields
        const formattedItem = {
            user_id: user.id,
            product_uniq_id: item.product_uniq_id,
            quantity: item.quantity || 1,
            discounted_price: Number(item.discounted_price) || 0,
            product_name: item.product_name || "Unknown Product",
            image1: item.image1 || "/placeholder-image.png",
            cart_id: cartId,
            created_at: new Date().toISOString(),
            is_checked_out: false, // Flag to track checkout status
        };

        console.log("Adding to cart:", formattedItem);

        try {
            // Insert into Supabase
            const { error } = await supabase
                .from("cart")
                .upsert([formattedItem], {
                    onConflict: "user_id, product_uniq_id", // Update if this combination exists
                    returning: "minimal", // Don't need to return the row
                });

            if (error) {
                console.error("Error inserting into Supabase:", error);
                return;
            }

            // Check if item already exists in cart to prevent duplicates
            const existingItemIndex = cart.findIndex(
                (i) => i.product_uniq_id === item.product_uniq_id
            );

            let updatedCart;
            if (existingItemIndex >= 0) {
                // Update existing item
                updatedCart = [...cart];
                updatedCart[existingItemIndex] = formattedItem;
            } else {
                // Add new item
                updatedCart = [...cart, formattedItem];
            }

            setCart(updatedCart);
            localStorage.setItem("cart", JSON.stringify(updatedCart));
            console.log("Item added successfully!");
        } catch (err) {
            console.error("Unexpected error:", err);
        }
    };

    //! Remove item from cart by cart_id
    const removeFromCart = async (cart_id) => {
        if (!user) {
            console.error("User not logged in");
            return;
        }

        if (!cart_id) {
            console.error("Invalid cart ID");
            // Try to get more diagnostic information
            console.log(
                "Attempted to remove item with invalid cart_id:",
                cart_id
            );
            console.log("Current cart state:", cart);
            return;
        }

        try {
            // Log the item being removed for debugging
            console.log("Attempting to remove item with cart_id:", cart_id);

            // Remove from Supabase first
            const { error, data } = await supabase
                .from("cart")
                .delete()
                .match({
                    cart_id: cart_id,
                    user_id: user.id,
                    is_checked_out: false,
                })
                .select(); // Return the deleted data for confirmation

            if (error) {
                console.error("Error removing item from database:", error);
                return;
            }

            console.log("Database removal result:", data);

            // Update local state
            const updatedCart = cart.filter((item) => item.cart_id !== cart_id);

            // Debug: Check what was filtered out
            if (updatedCart.length === cart.length) {
                console.warn(
                    "Item with cart_id not found in local cart:",
                    cart_id
                );
            }

            setCart(updatedCart);

            // Update localStorage
            localStorage.setItem("cart", JSON.stringify(updatedCart));

            console.log("Item removed successfully");
        } catch (err) {
            console.error("Unexpected error removing item:", err);
        }
    };
    //! Update item quantity in cart
    const updateQuantity = async (cart_id, quantity) => {
        if (!user) {
            console.error("User not logged in");
            return;
        }

        if (!cart_id) {
            console.error("Invalid cart ID");
            return;
        }

        const newQuantity = parseInt(quantity, 10);
        if (isNaN(newQuantity)) {
            console.error("Invalid quantity:", quantity);
            return;
        }
        if (newQuantity < 1) {
            removeFromCart(cart_id);
            return;
        }

        try {
            // Find the item in the cart
            const itemToUpdate = cart.find((item) => item.cart_id === cart_id);

            if (!itemToUpdate) {
                console.error("Item not found in cart:", cart_id);
                return;
            }

            // Update Supabase first
            const { error } = await supabase
                .from("cart")
                .update({ quantity: newQuantity })
                .match({
                    cart_id: cart_id,
                    user_id: user.id,
                    is_checked_out: false,
                });

            if (error) {
                console.error("Error updating quantity in Supabase:", error);
                return;
            }

            // Update local cart state if database update was successful
            const updatedCart = cart.map((item) =>
                item.cart_id === cart_id
                    ? { ...item, quantity: newQuantity }
                    : item
            );

            setCart(updatedCart);
            localStorage.setItem("cart", JSON.stringify(updatedCart));

            console.log(`Quantity updated successfully for item ${cart_id}`);
        } catch (err) {
            console.error("Unexpected error updating quantity:", err);
        }
    };

    return (
        <CartContext.Provider
            value={{ cart, addToCart, removeFromCart, updateQuantity }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client";

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    // Initialize cart when component mounts
    useEffect(() => {
        const initializeCart = async () => {
            setIsLoading(true);
            try {
                // Check if user is logged in
                const {
                    data: { user },
                } = await supabase.auth.getUser();
                setUser(user);

                if (user) {
                    // Logged in user: get cart from database
                    await fetchCart(user.id);
                } else {
                    // Guest user: get cart from localStorage
                    const storedCart = localStorage.getItem("cart");
                    if (storedCart) {
                        setCart(JSON.parse(storedCart));
                    }
                }
            } catch (error) {
                console.error("Error initializing cart:", error);
                // Fallback to local storage if there's an error
                const storedCart = localStorage.getItem("cart");
                if (storedCart) {
                    setCart(JSON.parse(storedCart));
                }
            } finally {
                setIsLoading(false);
            }
        };

        initializeCart();

        // Set up auth state listener
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === "SIGNED_IN" && session?.user) {
                    setUser(session.user);
                    // When user signs in, merge local cart with database cart
                    await mergeLocalCartWithDatabase(session.user.id);
                } else if (event === "SIGNED_OUT") {
                    setUser(null);
                    // Revert to local cart only when signed out
                    const storedCart = localStorage.getItem("cart");
                    if (storedCart) {
                        setCart(JSON.parse(storedCart));
                    } else {
                        setCart([]);
                    }
                }
            }
        );

        return () => {
            if (authListener && authListener.subscription) {
                authListener.subscription.unsubscribe();
            }
        };
    }, []);

    // Fetch cart from Supabase by user_id
    const fetchCart = async (userId) => {
        if (!userId) return;

        try {
            const { data, error } = await supabase
                .from("cart")
                .select("*")
                .eq("user_id", userId)
                .eq("is_checked_out", false);

            if (error) {
                console.error("Error fetching cart:", error);
                return;
            }

            setCart(data || []);
            // Also update localStorage for offline access
            localStorage.setItem("cart", JSON.stringify(data || []));
        } catch (err) {
            console.error("Unexpected error fetching cart:", err);
        }
    };

    // Merge local cart with database when user logs in
    const mergeLocalCartWithDatabase = async (userId) => {
        try {
            const storedCart = localStorage.getItem("cart");
            const localCart = storedCart ? JSON.parse(storedCart) : [];

            if (localCart.length === 0) {
                // If local cart is empty, just fetch the database cart
                await fetchCart(userId);
                return;
            }

            // Get the current database cart
            const { data: dbCart, error } = await supabase
                .from("cart")
                .select("*")
                .eq("user_id", userId)
                .eq("is_checked_out", false);

            if (error) {
                console.error("Error fetching database cart for merge:", error);
                return;
            }

            // Prepare items to upsert
            const itemsToUpsert = localCart.map((item) => ({
                ...item,
                user_id: userId,
                cart_id:
                    item.cart_id ||
                    `cart_${Math.random().toString(36).substring(2, 15)}`,
                created_at: item.created_at || new Date().toISOString(),
                is_checked_out: false,
            }));

            // Upsert all local items to database
            const { error: upsertError } = await supabase
                .from("cart")
                .upsert(itemsToUpsert, {
                    onConflict: "user_id, product_uniq_id",
                    returning: "minimal",
                });

            if (upsertError) {
                console.error("Error merging carts:", upsertError);
                return;
            }

            // Fetch the merged cart
            await fetchCart(userId);
        } catch (err) {
            console.error("Unexpected error merging carts:", err);
        }
    };

    // Add item to cart
    const addToCart = async (item) => {
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
            product_uniq_id: item.product_uniq_id,
            quantity: item.quantity || 1,
            discounted_price: Number(item.discounted_price) || 0,
            product_name: item.product_name || "Unknown Product",
            image1: item.image1 || "/placeholder-image.png",
            cart_id: cartId,
            created_at: new Date().toISOString(),
            is_checked_out: false,
        };

        try {
            // If user is logged in, save to database
            if (user) {
                const { error } = await supabase
                    .from("cart")
                    .upsert([{ ...formattedItem, user_id: user.id }], {
                        onConflict: "user_id, product_uniq_id",
                        returning: "minimal",
                    });

                if (error) {
                    console.error("Error adding item to database:", error);
                    return;
                }
            }

            // Update local state regardless of login status
            const existingItemIndex = cart.findIndex(
                (i) => i.product_uniq_id === item.product_uniq_id
            );

            let updatedCart;
            if (existingItemIndex >= 0) {
                // Update existing item
                updatedCart = [...cart];
                updatedCart[existingItemIndex] = {
                    ...updatedCart[existingItemIndex],
                    quantity:
                        (updatedCart[existingItemIndex].quantity || 0) +
                        (formattedItem.quantity || 1),
                };
            } else {
                // Add new item
                updatedCart = [...cart, formattedItem];
            }

            setCart(updatedCart);
            localStorage.setItem("cart", JSON.stringify(updatedCart));
            return { success: true, item: formattedItem };
        } catch (err) {
            console.error("Unexpected error adding item to cart:", err);
            return { success: false, error: err.message };
        }
    };

    // Remove item from cart
    const removeFromCart = async (cart_id) => {
        if (!cart_id) {
            console.error("Invalid cart ID");
            return { success: false, error: "Invalid cart ID" };
        }

        try {
            // If user is logged in, remove from database
            if (user) {
                const { error } = await supabase.from("cart").delete().match({
                    cart_id: cart_id,
                    user_id: user.id,
                    is_checked_out: false,
                });

                if (error) {
                    console.error("Error removing item from database:", error);
                    return { success: false, error: error.message };
                }
            }

            // Always update local state
            const updatedCart = cart.filter((item) => item.cart_id !== cart_id);
            setCart(updatedCart);
            localStorage.setItem("cart", JSON.stringify(updatedCart));
            return { success: true };
        } catch (err) {
            console.error("Unexpected error removing item:", err);
            return { success: false, error: err.message };
        }
    };

    // Update item quantity
    const updateQuantity = async (cart_id, quantity) => {
        if (!cart_id) {
            console.error("Invalid cart ID");
            return { success: false, error: "Invalid cart ID" };
        }

        const newQuantity = parseInt(quantity, 10);
        if (isNaN(newQuantity)) {
            console.error("Invalid quantity:", quantity);
            return { success: false, error: "Invalid quantity" };
        }

        // If quantity is less than 1, remove the item
        if (newQuantity < 1) {
            return removeFromCart(cart_id);
        }

        try {
            // Find the item in the cart
            const itemToUpdate = cart.find((item) => item.cart_id === cart_id);

            if (!itemToUpdate) {
                console.error("Item not found in cart:", cart_id);
                return { success: false, error: "Item not found in cart" };
            }

            // If user is logged in, update database
            if (user) {
                const { error } = await supabase
                    .from("cart")
                    .update({ quantity: newQuantity })
                    .match({
                        cart_id: cart_id,
                        user_id: user.id,
                        is_checked_out: false,
                    });

                if (error) {
                    console.error(
                        "Error updating quantity in database:",
                        error
                    );
                    return { success: false, error: error.message };
                }
            }

            // Always update local state
            const updatedCart = cart.map((item) =>
                item.cart_id === cart_id
                    ? { ...item, quantity: newQuantity }
                    : item
            );

            setCart(updatedCart);
            localStorage.setItem("cart", JSON.stringify(updatedCart));
            return { success: true };
        } catch (err) {
            console.error("Unexpected error updating quantity:", err);
            return { success: false, error: err.message };
        }
    };

    // Clear cart (useful after checkout)
    const clearCart = async () => {
        try {
            // If user is logged in, mark items as checked out in database
            if (user) {
                const { error } = await supabase
                    .from("cart")
                    .update({ is_checked_out: true })
                    .match({
                        user_id: user.id,
                        is_checked_out: false,
                    });

                if (error) {
                    console.error("Error clearing cart in database:", error);
                    return { success: false, error: error.message };
                }
            }

            // Clear local state
            setCart([]);
            localStorage.removeItem("cart");
            return { success: true };
        } catch (err) {
            console.error("Unexpected error clearing cart:", err);
            return { success: false, error: err.message };
        }
    };

    // Calculate cart totals
    const getCartTotals = () => {
        const itemCount = cart.reduce(
            (total, item) => total + (item.quantity || 1),
            0
        );
        const subtotal = cart.reduce(
            (total, item) =>
                total + (item.discounted_price || 0) * (item.quantity || 1),
            0
        );

        return {
            itemCount,
            subtotal: parseFloat(subtotal.toFixed(2)),
        };
    };

    // Check if an item is already in the cart
    const isItemInCart = (product_uniq_id) => {
        return cart.some((item) => item.product_uniq_id === product_uniq_id);
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getCartTotals,
                isLoading,
                isItemInCart,
                user,
            }}
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

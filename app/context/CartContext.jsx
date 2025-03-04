"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client";

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [user, setUser] = useState(null);
    const supabase = createClient();

    // Load cart from local storage on mount
    useEffect(() => {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
            setCart(JSON.parse(storedCart));
        }

        // Fetch user
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
            if (user) syncCartWithDB();
        });
    }, []);

    // Sync cart with Supabase when user logs in
    const syncCartWithDB = async () => {
        if (!user) return;

        const { data: existingCart } = await supabase
            .from("cart")
            .select("*")
            .eq("user_id", user.id);

        if (existingCart?.length) {
            setCart(existingCart);
        } else {
            await supabase.from("cart").insert(
                cart.map((item) => ({
                    ...item,
                    user_id: user.id,
                }))
            );
        }

        localStorage.removeItem("cart");
    };

    const addToCart = async (item) => {
        const updatedCart = [...cart, item];
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));

        if (user) {
            await supabase.from("cart").upsert({ ...item, user_id: user.id });
        }
    };

    const removeFromCart = async (id) => {
        const updatedCart = cart.filter((item) => item.id !== id);
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));

        if (user) {
            await supabase.from("cart").delete().eq("id", id);
        }
    };

    const clearCart = async () => {
        setCart([]);
        localStorage.removeItem("cart");

        if (user) {
            await supabase.from("cart").delete().eq("user_id", user.id);
        }
    };

    // const updateQuantity = async (unique_id, quantity) => {
    //     if (!unique_id) return;
    //     const newQuantity = parseInt(quantity, 10);
    //     if (isNaN(newQuantity) || newQuantity < 0) return;

    //     setCart((currentCart) =>
    //         currentCart.map((item) =>
    //             item.unique_id === unique_id
    //                 ? { ...item, quantity: newQuantity }
    //                 : item
    //         )
    //     );
    //     localStorage.setItem("cart", JSON.stringify(cart));

    //     // if (user) {
    //     //     if (newQuantity === 0) {
    //     //         await removeFromCart(unique_id);
    //     //     } else {
    //     //         await supabase
    //     //             .from("cart")
    //     //             .update({ quantity: newQuantity })
    //     //             .eq("unique_id", unique_id)
    //     //             .eq("user_id", user.id);
    //     //     }
    //     // }
    // };
    const updateQuantity = async (unique_id, quantity) => {
        if (!unique_id) return;

        const newQuantity = parseInt(quantity, 10);
        if (isNaN(newQuantity) || newQuantity < 0) return;

        if (newQuantity === 0) {
            removeFromCart(unique_id);
        } else {
            setCart((currentCart) =>
                currentCart.map((item) =>
                    item.unique_id === unique_id
                        ? { ...item, quantity: newQuantity }
                        : item
                )
            );

            localStorage.setItem(
                "cart",
                JSON.stringify(
                    cart.map((item) =>
                        item.unique_id === unique_id
                            ? { ...item, quantity: newQuantity }
                            : item
                    )
                )
            );
        }
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                clearCart,
                syncCartWithDB,
                updateQuantity,
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

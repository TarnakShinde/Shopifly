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

    //!Fetch cart from Supabase
    // const fetchCart = async (userId) => {
    //     if (!userId) return;
    //     const { data } = await supabase
    //         .from("cart")
    //         .select("*")
    //         .eq("userid", userId);
    //     setCart(data || []);
    // };
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

    //! Add item to cart
    // const addToCart = async (product_uniq_id) => {
    //     if (!user) {
    //         console.error("User not logged in");
    //         return;
    //     }

    //     const existingItem = cart.find(
    //         (item) => item.product_uniq_id === product_uniq_id
    //     );
    //     let updatedCart;

    //     if (existingItem) {
    //         updatedCart = cart.map((item) =>
    //             item.product_uniq_id === product_uniq_id
    //                 ? { ...item, quantity: item.quantity + 1 }
    //                 : item
    //         );

    //         await supabase
    //             .from("cart")
    //             .update({ quantity: existingItem.quantity + 1 })
    //             .eq("product_uniq_id", product_uniq_id)
    //             .eq("userid", user.id);
    //     } else {
    //         updatedCart = [...cart, { product_uniq_id, quantity: 1 }];
    //         await supabase
    //             .from("cart")
    //             .insert({ userid: user.id, product_uniq_id, quantity: 1 });
    //     }

    //     setCart(updatedCart);
    // };
    // const addToCart = async (item) => {
    //     if (!item || !item.product_uniq_id) {
    //         console.error("Invalid item:", item);
    //         return;
    //     }

    //     const formattedItem = {
    //         cartid: item.cartid || Date.now(), // Unique ID if not provided
    //         user_id: user?.id || null, // Ensure user ID exists
    //         product_uniq_id: item.product_uniq_id,
    //         quantity: item.quantity || 1, // Default quantity = 1
    //         discounted_price: Number(item.discounted_price) || 0, // Ensure a valid price
    //         product_name: item.product_name, // Fallback product name
    //         image1: item.image1 || "/placeholder-image.png", // Fallback image
    //     };

    //     console.log("Adding to cart:", formattedItem);

    //     const updatedCart = [...cart, formattedItem];
    //     setCart(updatedCart);
    //     localStorage.setItem("cart", JSON.stringify(updatedCart));

    //     if (user) {
    //         await supabase.from("cart").upsert(formattedItem);
    //     }
    // };
    // const addToCart = async (item) => {
    //     if (!item || !item.product_uniq_id) {
    //         console.error("Invalid item:", item);
    //         return;
    //     }

    //     const formattedItem = {
    //         cartid: item.cartid || Date.now(),
    //         user_id: user?.id || null,
    //         product_uniq_id: item.product_uniq_id,
    //         quantity: item.quantity || 1,
    //         discounted_price: Number(item.discounted_price) || 0,
    //         product_name: item.product_name,
    //         image1: item.image1 || "/placeholder-image.png",
    //     };

    //     console.log("Adding to cart:", formattedItem);

    //     const updatedCart = [...cart, formattedItem];
    //     setCart(updatedCart);
    //     localStorage.setItem("cart", JSON.stringify(updatedCart));

    //     if (user) {
    //         const { error } = await supabase.from("cart").upsert([
    //             {
    //                 user_id: user.id,
    //                 product_uniq_id: formattedItem.product_uniq_id,
    //                 quantity: formattedItem.quantity,
    //                 discounted_price: formattedItem.discounted_price,
    //                 image1: formattedItem.image1,
    //                 product_name: formattedItem.product_name,
    //             },
    //         ]);

    //         if (error) {
    //             console.error("Error inserting into Supabase:", error);
    //         }
    //     }
    // };
    const addToCart = async (item) => {
        if (!user) {
            console.error("User not logged in");
            return;
        }

        if (!item || !item.product_uniq_id) {
            console.error("Invalid item:", item);
            return;
        }

        // Ensure the item has the correct fields
        const formattedItem = {
            user_id: user.id, // Correct user identifier
            product_uniq_id: item.product_uniq_id,
            quantity: item.quantity || 1, // Default to 1
            discounted_price: Number(item.discounted_price) || 0, // Convert to number
            product_name: item.product_name || "Unknown Product", // Fallback name
            image1: item.image1 || "/placeholder-image.png", // Fallback image
        };

        console.log("Adding to cart:", formattedItem);

        try {
            // Insert into Supabase
            const { error } = await supabase
                .from("cart")
                .upsert([formattedItem]); // Use upsert to add or update

            if (error) {
                console.error("Error inserting into Supabase:", error);
                return;
            }

            // Update local state
            const updatedCart = [...cart, formattedItem];
            setCart(updatedCart);
            localStorage.setItem("cart", JSON.stringify(updatedCart));

            console.log("Item added successfully!");
        } catch (err) {
            console.error("Unexpected error:", err);
        }
    };

    //! Remove item from cart
    // const removeFromCart = async (product_uniq_id) => {
    //     if (!user) return;
    //     setCart(
    //         cart.filter((item) => item.product_uniq_id !== product_uniq_id)
    //     );

    //     await supabase
    //         .from("cart")
    //         .delete()
    //         .eq("product_uniq_id", product_uniq_id)
    //         .eq("userid", user.id);
    // };
    const removeFromCart = async (product_uniq_id) => {
        if (!user) return;

        const updatedCart = cart.filter(
            (item) => item.product_uniq_id !== product_uniq_id
        );
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));

        await supabase
            .from("cart")
            .delete()
            .eq("product_uniq_id", product_uniq_id)
            .eq("user_id", user.id);
    };

    // Update item quantity
    // const updateQuantity = async (product_uniq_id, quantity) => {
    //     if (!user) return;

    //     const newQuantity = parseInt(quantity, 10);
    //     if (isNaN(newQuantity) || newQuantity < 1) return;

    //     setCart(
    //         cart.map((item) =>
    //             item.product_uniq_id === product_uniq_id
    //                 ? { ...item, quantity: newQuantity }
    //                 : item
    //         )
    //     );

    //     await supabase
    //         .from("cart")
    //         .update({ quantity: newQuantity })
    //         .eq("product_uniq_id", product_uniq_id)
    //         .eq("userid", user.id);
    // };
    const updateQuantity = async (product_uniq_id, quantity) => {
        if (!user) {
            console.error("User not logged in");
            return;
        }

        const newQuantity = parseInt(quantity, 10);
        if (isNaN(newQuantity) || newQuantity < 1) return;

        // Update local cart state
        const updatedCart = cart.map((item) =>
            item.product_uniq_id === product_uniq_id
                ? { ...item, quantity: newQuantity }
                : item
        );

        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));

        // Update Supabase
        const { error } = await supabase
            .from("cart")
            .update({ quantity: newQuantity })
            .eq("product_uniq_id", product_uniq_id)
            .eq("user_id", user.id); // Ensure user_id is used correctly

        if (error) {
            console.error("Error updating quantity in Supabase:", error);
        } else {
            console.log(`Quantity updated successfully for ${product_uniq_id}`);
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

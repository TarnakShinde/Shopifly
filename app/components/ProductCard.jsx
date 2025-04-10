"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client";
import { useCart } from "../context/CartContext";
import { handleAddToFavorites } from "../../utils/favorites";
import { toast } from "react-toastify";

const ProductCard = ({ data, isLoggedIn }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [user, setUser] = useState(null);
    const [isHoveredHeart, setIsHoveredHeart] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const images = [
        data?.image1,
        data?.image2,
        data?.image3,
        data?.image4,
    ].filter(Boolean);
    const [randomReviewCount, setRandomReviewCount] = useState(null);
    const router = useRouter();
    const supabase = createClient();
    const { addToCart } = useCart();

    // Rotate images every 3 seconds
    useEffect(() => {
        // Only rotate images if there are multiple images
        if (images.length > 1) {
            const interval = setInterval(() => {
                setCurrentImageIndex(
                    (prevIndex) => (prevIndex + 1) % images.length
                );
            }, 3000); // Change image every 3 seconds
            return () => clearInterval(interval); // Cleanup on unmount
        }
    }, [images.length]);

    // Generate a random review count for the product
    useEffect(() => {
        if (data?.product_name) {
            // Generate a stable random review count based on product name
            const productNameHash = data.product_name
                .split("")
                .reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const count = 1000 + (productNameHash % 2000); // Between 1000 and 3000
            setRandomReviewCount(count);
        }
    }, [data?.product_name]);

    useEffect(() => {
        const getUser = async () => {
            try {
                const { data: userData, error } = await supabase.auth.getUser();
                if (error) {
                    console.error("Error fetching user:", error);
                    return;
                }
                setUser(userData?.user || null);
            } catch (err) {
                console.error("Exception fetching user:", err);
            }
        };
        getUser();
    }, [supabase.auth]);

    useEffect(() => {
        const checkFavorite = async () => {
            if (!user || !data?.uniq_id) return;

            const { data: favData, error } = await supabase
                .from("favorites")
                .select("id")
                .eq("user_id", user.id)
                .eq("product_id", data.uniq_id)
                .single();

            if (error && error.code !== "PGRST116") {
                console.error(
                    "Error checking favorites status:",
                    error.message
                );
            }

            setIsFavorited(!!favData);
        };

        checkFavorite();
    }, [user, data?.uniq_id]);

    const handleAddToCart = async (productData) => {
        if (isAddingToCart) return; // Prevent multiple clicks

        try {
            setIsAddingToCart(true);

            // Check if user is logged in first
            const { data: sessionData } = await supabase.auth.getSession();

            // If no session exists, redirect to login
            if (!sessionData?.session) {
                // Store current location for redirect after login
                if (typeof window !== "undefined") {
                    sessionStorage.setItem(
                        "redirectAfterAuth",
                        window.location.pathname
                    );
                }
                toast.info("Please login to add items to your cart");
                router.push("/login");
                return;
            }

            // At this point we know the user is logged in
            // Get the current user data
            const { data: userData, error: userError } =
                await supabase.auth.getUser();
            if (userError || !userData?.user) {
                toast.error(
                    "Authentication error. Please try logging in again."
                );
                router.push("/login");
                return;
            }

            const currentUser = userData.user;

            // Validate product data
            if (!productData || !productData.uniq_id) {
                console.error("Invalid product data:", productData);
                toast.error("Unable to add item to cart");
                return;
            }

            const productToAdd = {
                user_id: currentUser.id,
                product_uniq_id: productData.uniq_id,
                quantity: 1,
                discounted_price: parseFloat(productData.discounted_price) || 0,
                retail_price: parseFloat(productData.retail_price) || 0,
                image1: productData.image1 || "/placeholder-image.png",
                product_name: productData.product_name,
                uniq_id: productData.uniq_id, // Ensure this ID is included
            };

            // Call the context method which should handle the Supabase insertion
            const result = await addToCart(productToAdd);
            if (result && result.error) {
                console.error("Error adding to cart:", result.error);
                toast.error("Failed to add item to cart. Please try again.");
            } else {
                toast.success("Added to cart");
            }
        } catch (err) {
            console.error("Exception adding to cart:", err);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsAddingToCart(false);
        }
    };
    // If data is not available, show a loading state
    if (!data || randomReviewCount === null) {
        return (
            <div className="w-64 h-[380px] bg-white rounded-xl shadow-md border border-gray-200 p-4 flex flex-col hover:shadow-lg transition-shadow">
                <div className="animate-pulse h-[210px] bg-gray-200 rounded-xl"></div>
                <div className="mt-3 animate-pulse h-12 bg-gray-200 rounded-md"></div>
                <div className="mt-2 animate-pulse h-8 bg-gray-200 rounded-md"></div>
                <div className="mt-auto flex justify-center gap-2">
                    <div className="animate-pulse bg-gray-200 h-8 w-1/2 rounded-md"></div>
                    <div className="animate-pulse bg-gray-200 h-8 w-1/2 rounded-md"></div>
                </div>
            </div>
        );
    }

    // Calculate discount percentage
    const discountPercentage =
        data.retail_price > 0
            ? Math.floor(
                  ((data.retail_price - data.discounted_price) /
                      data.retail_price) *
                      100
              )
            : 0;

    return (
        <div className="w-64 h-[380px] bg-white rounded-xl shadow-md border border-gray-200 p-4 flex flex-col hover:shadow-lg transition-shadow">
            {/* Image Section */}
            <div className="relative h-[210px] w-full flex items-center justify-center overflow-hidden">
                <Link
                    href={`/product/${data.uniq_id}`}
                    className="relative w-full h-full"
                >
                    <Image
                        src={
                            images[currentImageIndex] ||
                            "/placeholder-image.jpg"
                        }
                        alt={data.product_name}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-contain transition-all duration-300"
                        onError={(e) => {
                            e.target.src = "/placeholder-image.jpg";
                        }}
                    />
                </Link>
                <button
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    onMouseEnter={() => setIsHoveredHeart(true)}
                    onMouseLeave={() => setIsHoveredHeart(false)}
                    onClick={async () => {
                        if (!user) {
                            // Store current page URL for redirect after auth
                            if (typeof window !== "undefined") {
                                sessionStorage.setItem(
                                    "redirectAfterAuth",
                                    window.location.pathname
                                );
                            }
                            router.push("/login");
                            return;
                        }

                        const result = await handleAddToFavorites(
                            data.uniq_id,
                            user
                        );
                        if (result.requiresAuth) {
                            router.push("/login");
                        }
                    }}
                    aria-label="Add to favorites"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill={
                            isHoveredHeart ? "rgba(239, 68, 68, 0.2)" : "none"
                        }
                        strokeWidth="2"
                        stroke={
                            isHoveredHeart ? "rgb(239, 68, 68)" : "currentColor"
                        }
                        className="w-6 h-6 transition-all"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M20.84 2.61a5.5 5.5 0 0 0-7.78 0L12 3.67l-1.06-1.06a5.501 5.501 0 0 0-7.78 7.78l1.06 1.06L12 19.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                        ></path>
                    </svg>
                </button>
            </div>
            {/* Product Details */}
            <div className="mt-3 text-center flex-grow flex flex-col">
                <h2 className="text-sm font-semibold text-gray-700 line-clamp-2 mb-2">
                    {data.product_name}
                </h2>
                <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-md">
                        {data.productrating || "4.0"}
                    </span>
                    <span className="text-gray-500 text-sm">
                        {randomReviewCount.toLocaleString()} reviews
                    </span>
                </div>
                <div className="mb-auto">
                    <span className="text-lg font-bold text-gray-800">
                        ₹{Number(data.discounted_price).toLocaleString()}
                    </span>
                    {data.retail_price > data.discounted_price && (
                        <>
                            <span className="text-sm line-through text-gray-500 ml-2">
                                ₹{Number(data.retail_price).toLocaleString()}
                            </span>
                            {discountPercentage > 0 && (
                                <span className="text-sm text-green-600 ml-2">
                                    {discountPercentage}% off
                                </span>
                            )}
                        </>
                    )}
                </div>
                <div className="flex justify-center gap-2 mt-2">
                    <button
                        className={`flex-1 ${
                            isAddingToCart
                                ? "bg-gray-400"
                                : "bg-orange-600 hover:bg-orange-500"
                        } text-white px-3 py-1.5 rounded-lg font-semibold text-sm transition-colors`}
                        onClick={() => handleAddToCart(data)}
                        disabled={isAddingToCart}
                    >
                        {isAddingToCart ? "Adding..." : "Add to Cart"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;

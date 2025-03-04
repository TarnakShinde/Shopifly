"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client";
import { useCart } from "../context/CartContext";

const ProductCard = ({ data, isLoggedIn }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHoveredHeart, setIsHoveredHeart] = useState(false);
    const images = [data.image1, data.image2, data.image3, data.image4].filter(
        Boolean
    );
    const [randomReviewCount, setRandomReviewCount] = useState(null);

    const router = useRouter();
    const supabase = createClient();

    const { addToCart } = useCart();

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

    useEffect(() => {
        // Generate a stable random review count based on product name
        const productNameHash = data.product_name
            .split("")
            .reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const count = 1000 + (productNameHash % 2000); // Between 1000 and 3000
        setRandomReviewCount(count);
    }, [data.product_name]);

    // Function to handle adding to cart
    const handleAddToCart = async () => {
        // if (!isLoggedIn) {
        //     // Store current page URL for redirect after auth
        //     if (typeof window !== "undefined") {
        //         sessionStorage.setItem(
        //             "redirectAfterAuth",
        //             window.location.pathname
        //         );
        //     }
        //     // Redirect to login page
        //     router.push("/login");
        //     return;
        // }

        // Check if data is valid and contains the needed ID
        if (!data || !data.uniq_id) {
            console.error("Data is missing uniq_id:", data);
            return;
        }

        // Create a properly formatted product object
        const productToAdd = {
            unique_id: data.unique_id,
            product_name: data.product_name,
            discounted_price: data.discounted_price,
            image1: data.image1,
            quantity: 1, // Adding default quantity
        };

        console.log("Adding to cart:", productToAdd);
        addToCart(productToAdd);
    };

    // Function to handle adding to favorites
    const handleAddToFavorites = async () => {
        if (!isLoggedIn) {
            // Store current page URL for redirect after auth
            if (typeof window !== "undefined") {
                sessionStorage.setItem(
                    "redirectAfterAuth",
                    window.location.pathname
                );
            }
            // Redirect to login page
            router.push("/login");
            return;
        }
        // If logged in, add to favorites logic here
        console.log("Adding to favorites:", data.uniq_id);
        // Additional favorites logic can be implemented here
    };

    if (!data || randomReviewCount === null) {
        return (
            <div className="w-64 h-[380px] bg-white rounded-xl shadow-md border border-gray-200 p-4 flex items-center justify-center">
                Loading...
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
                    />
                </Link>
                <button
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    onMouseEnter={() => setIsHoveredHeart(true)}
                    onMouseLeave={() => setIsHoveredHeart(false)}
                    onClick={handleAddToFavorites}
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
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-semibold text-sm transition-colors"
                        onClick={handleAddToCart}
                    >
                        Add to Cart
                    </button>
                    <Link
                        href={
                            isLoggedIn ? `/product/${data.uniq_id}` : "/login"
                        }
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg font-semibold text-sm transition-colors"
                        onClick={() => {
                            if (!isLoggedIn && typeof window !== "undefined") {
                                sessionStorage.setItem(
                                    "redirectAfterAuth",
                                    `/product/${data.uniq_id}`
                                );
                            }
                        }}
                    >
                        Buy Now
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;

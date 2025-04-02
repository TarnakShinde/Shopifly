// app/liked-products/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    getUserLikedProducts,
    handleRemoveFromFavorites,
} from "../../utils/favorites";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { CircleX } from "lucide-react";
import Image from "next/image";

export default function LikedProductsPage() {
    const [likedProducts, setLikedProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user, isLoggedIn } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Fetch liked products when component mounts
        const fetchLikedProducts = async () => {
            if (!isLoggedIn) {
                router.push("/login");
                return;
            }

            setIsLoading(true);
            const result = await getUserLikedProducts(user);
            if (result.success) {
                setLikedProducts(result.data);
            }
            setIsLoading(false);
        };

        if (user) {
            fetchLikedProducts();
        } else if (!isLoggedIn && !isLoading) {
            router.push("/login");
        }
    }, [user, isLoggedIn, router]);

    const removeFavorite = async (productId) => {
        const result = await handleRemoveFromFavorites(productId, user);
        if (result.success) {
            // Remove from UI
            setLikedProducts(
                likedProducts.filter((product) => product.uniq_id !== productId)
            );
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-4">
                Loading your favorites...
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Your Favorite Products</h1>

            {likedProducts.length === 0 ? (
                <div className="text-center py-10">
                    <p className="mb-4">
                        You haven't added any products to your favorites yet.
                    </p>
                    <Link
                        href="/"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {likedProducts.map((product) => (
                        <div
                            key={product.uniq_id}
                            className="relative bg-white p-4 rounded-lg shadow flex items-center space-x-4"
                        >
                            <div className="relative w-20 h-20">
                                <Image
                                    src={
                                        product.image2 ||
                                        "/placeholder-image.png"
                                    }
                                    alt={product.product_name}
                                    className="object-contain rounded"
                                    layout="fill"
                                    priority={true}
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-md font-semibold">
                                    {product.product_name}
                                </h3>
                                <p className="font-bold text-gray-800">
                                    ₹{product.discounted_price}
                                    <span className="text-sm line-through text-gray-500 ml-2">
                                        ₹{product.retail_price}
                                    </span>
                                </p>
                                <Link
                                    href={`/product/${product.uniq_id}`}
                                    className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    View More
                                </Link>
                            </div>
                            <button
                                onClick={() => removeFavorite(product.uniq_id)}
                                className="absolute top-2 right-2 p-2 rounded-full"
                                aria-label="Remove from favorites"
                            >
                                <CircleX />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

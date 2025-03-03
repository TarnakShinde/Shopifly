"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import Link from "next/link";

const ProductCard = ({ data, id }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = [data.image1, data.image2, data.image3, data.image4];
    const [randomReviewCount, setRandomReviewCount] = useState(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex(
                (prevIndex) => (prevIndex + 1) % images.length
            );
        }, 3000); // Change image every 3 seconds

        return () => clearInterval(interval); // Cleanup on unmount
    }, [images.length]);


    useEffect(() => {
        const count = Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000;
        setRandomReviewCount(count);
    }, [data.product_name]);
    if (randomReviewCount === null) {
        return <div>Loading...</div>;
    }

    return (
        <div className="w-64 h-[380px] bg-white rounded-xl shadow-md border border-gray-200 p-4 flex flex-col">
            {/* Image Section */}
            <div className="relative h-[210px] w-full flex items-center justify-center overflow-hidden">
                <Link
                    href={`/product/${data.uniq_id}`}
                    className="relative w-full h-full"
                >
                    <Image
                        src={images[currentImageIndex]}
                        alt={data.product_name}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-contain transition-all duration-100"
                    />
                </Link>
                <button className="absolute top-2 right-2 text-gray-600 hover:text-red-500 hover:bg-red-500">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="21"
                        id="heart"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="w-6 h-6"
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
            <div className="mt-4 text-center flex-grow">
                <h2 className="text-sm font-semibold text-gray-700 line-clamp-2">
                    {data.product_name}
                </h2>

                <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                        {data.productrating}
                    </span>
                    <span className="text-gray-500 text-sm" suppressHydrationWarning>
                        {randomReviewCount}
                    </span>
                </div>

                <div className="mt-2">
                    <span className="text-lg font-bold text-gray-800">
                        ₹{data.discounted_price}
                    </span>
                    <span className="text-sm line-through text-gray-500 ml-2">
                        ₹{data.retail_price}
                    </span>
                    {(
                        ((data.retail_price - data.discounted_price) /
                            data.retail_price) *
                        100
                    ).toFixed(0) == 0 ? (
                        ""
                    ) : (
                        <span className="text-sm text-green-600 ml-2">
                            {(
                                ((data.retail_price - data.discounted_price) /
                                    data.retail_price) *
                                100
                            ).toFixed(0)}{" "}
                            % off
                        </span>
                    )}
                </div>
                <button className="w-50 bg-green-400 px-2 py-1 rounded-xl font-bold mt-1">
                    Buy Now
                </button>
                <button className="ml-1 w-50 bg-orange-400 px-2 py-1 rounded-xl font-bold mt-1">
                    Add to Cart
                </button>
            </div>
        </div>
    );
};

export default ProductCard;

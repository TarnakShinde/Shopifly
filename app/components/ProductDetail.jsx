"use client";

import Image from "next/image";
import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { Heart } from "lucide-react";

const ProductDetail = ({ product }) => {
    const [selectedImage, setSelectedImage] = useState(product.image1);
    const [openIndex, setOpenIndex] = useState(null);
    const [isHoveredHeart, setIsHoveredHeart] = useState(false);
    const { addToCart } = useCart();
    const accordionItems = [
        {
            title: "Specifications",
            content: {
                type: "specifications",
            },
        },
    ];
    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };
    const DownIcon = () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="w-4 h-4"
        >
            <path
                fillRule="evenodd"
                d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
            />
        </svg>
    );

    const UpIcon = () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="w-4 h-4"
        >
            <path
                fillRule="evenodd"
                d="M11.78 9.78a.75.75 0 0 1-1.06 0L8 7.06 5.28 9.78a.75.75 0 0 1-1.06-1.06l3.25-3.25a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06Z"
                clipRule="evenodd"
            />
        </svg>
    );
    const handleAddToCart = () => {
        addToCart({
            unique_id: product.unique_id,
            product_name: product.product_name,
            discounted_price: product.discounted_price,
            image1: product.image1,
            quantity: 1,
        });
    };
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
    return (
        <div className="flex flex-col md:flex-row gap-8 p-6 max-w-5xl mx-auto">
            {/* Product Images */}
            <div className="w-full md:w-1/2 flex flex-col gap-4">
                <div className="w-full aspect-square relative">
                    <Image
                        src={selectedImage}
                        alt="Selected Product"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-contain rounded-lg shadow-lg w-auto h-auto"
                    />
                    <button
                        onMouseEnter={() => setIsHoveredHeart(true)}
                        onMouseLeave={() => setIsHoveredHeart(false)}
                        onClick={handleAddToFavorites}
                        className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 transition-colors  "
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill={
                                isHoveredHeart
                                    ? "rgba(239, 68, 68, 0.2)"
                                    : "none"
                            }
                            strokeWidth="2"
                            stroke={
                                isHoveredHeart
                                    ? "rgb(239, 68, 68)"
                                    : "currentColor"
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
                <div className="flex gap-8 overflow-x-auto">
                    {[
                        product.image1,
                        product.image2,
                        product.image3,
                        product.image4,
                    ].map((img, index) => (
                        <div
                            key={index}
                            className="w-24 h-24 flex-shrink-0 relative cursor-pointer"
                            onClick={() => setSelectedImage(img)}
                        >
                            {img && (
                                <Image
                                    src={img}
                                    alt={`Product ${index}`}
                                    fill
                                    priority
                                    sizes="96px"
                                    className="object-contain rounded-lg border hover:border hover:border-blue-400 w-auto h-auto"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Product Info */}
            <div className="w-full md:w-[75%] flex flex-col gap-4">
                <h1 className="text-xl md:text-2xl font-bold">
                    {product.product_name}
                </h1>
                <p className="text-gray-700 text-sm md:text-base">
                    {product.description}
                </p>
                <p className="text-lg md:text-xl font-semibold text-green-600">
                    ₹{product.discounted_price}
                    <span className="ml-4 line-through text-gray-600">
                        ₹{product.retail_price}
                    </span>
                </p>
                <div className="flex gap-5">
                    <button className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600">
                        Buy Now
                    </button>
                    <button
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                        onClick={handleAddToCart}
                    >
                        Add to Cart
                    </button>
                </div>
                {/* Specifications */}
                <div className="relative flex flex-col w-full text-gray-700 bg-white shadow-md bg-clip-border rounded-xl custom-scrollbar">
                    {accordionItems.map((item, index) => (
                        <div key={index} className="accordion-item border-b">
                            <button
                                onClick={() => toggleAccordion(index)}
                                className="flex justify-between items-center w-full p-4 text-center"
                            >
                                <span>{item.title}</span>
                                <span>
                                    {openIndex === index ? (
                                        <DownIcon />
                                    ) : (
                                        <UpIcon />
                                    )}
                                </span>
                            </button>
                            <div
                                className={`overflow-hidden transition-max-height duration-300 ease-in-out ${
                                    openIndex === index
                                        ? "max-h-screen"
                                        : "max-h-0"
                                }`}
                            >
                                <div className="p-4">
                                    {item.content.type === "specifications" ? (
                                        <div className="relative flex flex-col w-full h-96 overflow-y-auto lg:overflow-x-hidden overflow-x-auto text-gray-700 bg-white shadow-md bg-clip-border rounded-xl custom-scrollbar break-before-auto">
                                            <table className="w-full text-left table-auto min-w-max h-96">
                                                <tbody>
                                                    {product.product_specifications.product_specification.map(
                                                        (spec, specIndex) => (
                                                            <tr
                                                                className="even:bg-blue-gray-50/50"
                                                                key={specIndex}
                                                            >
                                                                <td className="p-4 break-words whitespace-normal max-w-xs">
                                                                    <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900 break-words">
                                                                        {
                                                                            spec.key
                                                                        }
                                                                    </p>
                                                                </td>
                                                                <td className="p-4 break-words whitespace-normal max-w-xs">
                                                                    <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                                                                        {
                                                                            spec.value
                                                                        }
                                                                    </p>
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        item.content
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;

"use client";
import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Link from "next/link";
import { useState } from "react";
import { ShoppingCartIcon } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useCart } from "../context/CartContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const HeroSlider = ({ products }) => {
    const [imageError, setImageError] = useState({});
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [user, setUser] = useState(null);
    const { addToCart } = useCart();

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: true,
    };

    const truncateText = (text, wordLimit) => {
        if (!text) return "";
        const words = text.split(" ");
        if (words.length > wordLimit) {
            return words.slice(0, wordLimit).join(" ") + " ...";
        }
        return text;
    };

    // Function to handle image loading failures with multiple fallbacks
    const handleImageError = (id) => {
        setImageError((prev) => ({
            ...prev,
            [id]: true,
        }));
    };
    const handleAddToCart = async (product) => {
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

            // Validate product data
            if (!product || !product.uniq_id) {
                console.error("Invalid product data:", product);
                toast.error("Unable to add item to cart");
                return;
            }

            // Format the item for the cart context
            const cartItem = {
                product_uniq_id: product.uniq_id,
                quantity: 1,
                discounted_price: parseFloat(product.discounted_price) || 0,
                product_name: product.product_name || "Unknown Product",
                image1: product.image1 || "/placeholder-image.png",
            };

            // Call the addToCart method from the context
            const result = await addToCart(cartItem);

            if (result && result.success) {
                toast.success("Added to cart");
            } else {
                console.error("Error adding to cart:", result?.error);
                toast.error("Failed to add item to cart. Please try again.");
            }
        } catch (err) {
            console.error("Exception adding to cart:", err);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsAddingToCart(false);
        }
    };
    const getImageSrc = (product) => {
        // If the primary image has already errored
        if (imageError[product.image1]) {
            // Try secondary image options in sequence
            if (product.image2) {
                return product.image2;
            } else if (product.image1) {
                return product.image1;
            } else {
                return "/public/icons8-shopping-bag-48.png";
            }
        }
        // Default to the primary image if no errors yet
        return product.image1 || "/public/icons8-shopping-bag-48.png";
    };

    return (
        <div className="relative max-w-full">
            <Slider {...settings}>
                {products.map((product) => (
                    <div key={product.uniq_id} className="relative w-full">
                        {/* Mobile & Medium Layout (Background Image with Overlay) */}
                        <div className="lg:hidden relative min-h-[450px] overflow-hidden rounded-lg border border-gray-200 flex flex-col">
                            {/* Product image section */}
                            <div className="relative h-64 bg-gray-100 flex items-center justify-center">
                                <Image
                                    src={product.image1}
                                    alt={product.product_name}
                                    width={300}
                                    height={300}
                                    className="object-contain p-4 mix-blend-multiply"
                                />
                            </div>
                            {/* Product details section */}
                            <div className="flex-grow p-4 md:p-6 flex flex-col">
                                <h1 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight mb-2 capitalize">
                                    {product.product_name}
                                </h1>
                                <p className="text-gray-600 text-sm md:text-md flex-grow mb-4">
                                    {truncateText(product.description, 25)}
                                </p>
                                <div className="mt-auto">
                                    <Link
                                        href={`/product/${product.uniq_id}`}
                                        className="block"
                                    >
                                        <button className="w-full bg-orange-500 text-white px-8 py-3 text-base md:text-lg font-medium hover:bg-orange-400 transition-colors duration-300 rounded-md">
                                            Shop Now
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Desktop Layout (Grid) */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-100 p-6 rounded-xl shadow-sm border border-blue-100">
                            <div className="hidden lg:block min-h-[450px] bg-[var(--fourth-color)]">
                                <div className="grid grid-cols-2 gap-12 h-full max-w-7xl mx-auto">
                                    <div className="flex flex-col justify-center space-y-4 p-8">
                                        <h1 className="text-3xl font-bold text-black leading-tight">
                                            <span className="block">
                                                {product.product_name}
                                            </span>
                                        </h1>
                                        <p className="text-black/80 text-md max-w-lg">
                                            {truncateText(
                                                product.description,
                                                25
                                            )}
                                        </p>
                                        <div className="pt-4 flex gap-4">
                                            <Link
                                                href={`/product/${product.uniq_id}`}
                                            >
                                                <button className="bg-green-500 text-white px-8 py-3 text-lg font-medium hover:bg-green-300 transition-colors duration-300 rounded-md">
                                                    Shop Now
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() =>
                                                    handleAddToCart(product)
                                                }
                                                disabled={isAddingToCart}
                                                // className="bg-green-600 text-white px-8 py-3 text-lg font-medium hover:bg-green-500 transition-colors duration-300 rounded-md flex items-center gap-2"
                                                className="bg-orange-500 text-white px-8 py-3 text-lg font-medium hover:bg-orange-300 transition-colors duration-300 rounded-md flex gap-2"
                                            >
                                                <ShoppingCartIcon />
                                                {isAddingToCart
                                                    ? "Adding..."
                                                    : "Add to Cart"}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center h-[450px] relative">
                                        {/* Replace img with Next.js Image component for better performance and error handling */}
                                        <div className="relative w-full h-full max-h-[450px] max-w-[450px]">
                                            <Image
                                                src={
                                                    getImageSrc(product) ||
                                                    process.env
                                                        .NEXT_PUBLIC_PLACEHOLDER_IMAGE ||
                                                    "/placeholder-image.jpg"
                                                }
                                                alt={
                                                    product.product_name ||
                                                    "Product image"
                                                }
                                                onError={() =>
                                                    handleImageError(
                                                        product.uniq_id
                                                    )
                                                }
                                                fill
                                                className="rounded-lg object-contain mix-blend-multiply p-4"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                priority={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default HeroSlider;

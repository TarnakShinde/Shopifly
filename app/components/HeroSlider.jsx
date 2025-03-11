"use client";
import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Link from "next/link";
import { useState } from "react";

const HeroSlider = ({ products }) => {
    const [imageError, setImageError] = useState({});

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

    const handleImageError = (id) => {
        setImageError((prev) => ({
            ...prev,
            [id]: true,
        }));
    };

    // Use a placeholder image when the original image fails to load
    const getImageSrc = (product) => {
        if (imageError[product.uniq_id]) {
            return (
                product.image1 ||
                process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE ||
                "/placeholder-image.jpg"
            );
        }
        return product.image1;
    };

    return (
        <div className="relative max-w-full">
            <Slider {...settings}>
                {products.map((product) => (
                    <div key={product.uniq_id} className="relative w-full">
                        {/* Mobile & Medium Layout (Background Image with Overlay) */}

                        <div className="lg:hidden relative min-h-[450px] overflow-hidden rounded-lg">
                            {/* Background image with reduced brightness */}
                            <div
                                className="absolute inset-0 bg-no-repeat bg-center"
                                onError={() =>
                                    handleImageError(product.uniq_id)
                                }
                                style={{
                                    backgroundImage: `url(${getImageSrc(
                                        product
                                    )})`,
                                    backgroundSize: "cover",
                                    filter: "brightness(0.7)", // Reduced brightness to make text more readable
                                }}
                            />

                            {/* Text overlay directly on image */}
                            <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6 space-y-4">
                                <h1 className="text-xl md:text-2xl font-bold text-white leading-tight drop-shadow-md">
                                    <span className="block">
                                        {product.product_name}
                                    </span>
                                </h1>
                                <p className="text-white/90 text-sm md:text-md max-w-lg drop-shadow-md">
                                    {truncateText(product.description, 25)}
                                </p>
                                <div className="pt-4 pb-6">
                                    <Link href={`/product/${product.uniq_id}`}>
                                        <button className="w-full sm:w-auto bg-orange-500 text-white px-8 py-3 text-base md:text-lg font-medium hover:bg-orange-300 transition-colors duration-300 rounded-md">
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
                                        <div className="pt-4">
                                            <Link
                                                href={`/product/${product.uniq_id}`}
                                            >
                                                <button className="bg-orange-500 text-white px-12 py-3 text-lg font-medium hover:bg-orange-300 transition-colors duration-300 rounded-md">
                                                    Shop Now
                                                </button>
                                            </Link>
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

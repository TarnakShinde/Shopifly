"use client";
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import ProductCard from "./ProductCard";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ArrowBigRight, ArrowBigLeft } from "lucide-react";

const ProductSlider = ({ id }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryInfo, setCategoryInfo] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch products
                const productsResponse = await fetch(
                    `/api/sliderData?id=${id}`
                );
                const productsData = await productsResponse.json();
                setProducts(productsData);

                // Fetch category information
                const categoryResponse = await fetch(
                    `/api/getcategory?id=${id}`
                );
                const categoryData = await categoryResponse.json();
                if (categoryData.success) {
                    setCategoryInfo(categoryData.category);
                }
            } catch (error) {
                console.error("Error:", error);
                setProducts([]); // Set empty array on error
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]); // Added id as dependency to refetch when id changes

    // Custom arrow components with improved visibility and positioning
    const NextArrow = (props) => {
        const { onClick } = props;
        return (
            <div
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 cursor-pointer bg-white bg-opacity-70 p-2 rounded-full shadow-md hover:bg-opacity-100 transition-all duration-300"
                onClick={onClick}
                style={{ right: "-10px" }}
            >
                <ArrowBigRight size={24} className="text-blue-600" />
            </div>
        );
    };

    const PrevArrow = (props) => {
        const { onClick } = props;
        return (
            <div
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 cursor-pointer bg-white bg-opacity-70 p-2 rounded-full shadow-md hover:bg-opacity-100 transition-all duration-300"
                onClick={onClick}
                style={{ left: "-10px" }}
            >
                <ArrowBigLeft size={24} className="text-blue-600" />
            </div>
        );
    };

    const settings = {
        dots: false,
        infinite: products.length > 4,
        speed: 800,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 1200,
        pauseOnFocus: true,
        swipeToSlide: true,
        vertical: false,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        responsive: [
            {
                breakpoint: 1280,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 1,
                    infinite: products.length > 3,
                },
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    infinite: products.length > 2,
                },
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    autoplaySpeed: 5000,
                    dots: false,
                    infinite: products.length > 1,
                },
            },
        ],
    };

    if (loading) {
        return (
            <div
                role="status"
                className="flex items-center justify-center h-screen"
            >
                <svg
                    aria-hidden="true"
                    className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-yellow-400"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                    />
                    <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                    />
                </svg>
                <span className="sr-only">Loading...</span>
            </div>
        );
    }

    // Add check for empty products
    if (!products || products.length === 0) {
        return (
            <div className="max-w-screen-xl mx-auto p-4">
                <p>No products available</p>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-100 p-6 rounded-xl outline-none focus:outline-none">
            <div className="max-w-screen-xl mx-auto lg:px-16 md:px-8 sm:px-4">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                    {categoryInfo
                        ? categoryInfo.name
                        : id === "0"
                        ? "Featured Products"
                        : "Products"}
                </h2>

                <div className="relative mx-6 py-3">
                    <Slider {...settings}>
                        {/* Add gap using margin on each product */}
                        {products.map((prod, index) => (
                            <div
                                key={`product-${prod.id || index}`}
                                className="px-3 hover:scale-105 transition duration-300"
                            >
                                <ProductCard data={prod} />
                            </div>
                        ))}
                    </Slider>
                </div>
            </div>
        </div>
    );
};

export default ProductSlider;

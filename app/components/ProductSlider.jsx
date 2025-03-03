"use client";
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import ProductCard from "./ProductCard";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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
                console.log("catdata: ", categoryData);
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
        responsive: [
            {
                breakpoint: 1280,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    infinite: products.length > 3,
                },
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
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
            <div className="max-w-screen-xl mx-auto p-4">
                <div className="animate-pulse h-64 bg-gray-200 rounded-lg" />
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
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-6">
                {categoryInfo
                    ? categoryInfo.name
                    : id === "0"
                    ? "Featured Products"
                    : categoryInfo.name}
            </h2>
            <div className="relative mx-4 py-3">
                <Slider {...settings}>
                    {products.map((prod, index) => (
                        <div
                            key={`product-${prod.id || index}`}
                            className="px-3 py-2 hover:scale-105 transition duration-300"
                        >
                            <ProductCard data={prod} />
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
};

export default ProductSlider;

"use client";
import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Link from "next/link";

const CategorySlider = () => {
    const categoryImage = [
        { id: 1, name: "Mens", src: "/men.png" },
        { id: 2, name: "Womens", src: "/women.png" },
        { id: 3, name: "Kids", src: "/boy.png" },
        { id: 4, name: "Jewellery", src: "/jewellery.png" },
        { id: 5, name: "Pen And Stationary", src: "/stationary.png" },
        { id: 6, name: "FootWear Mens", src: "/footwear_men.png" },
        { id: 7, name: "FootWear Womens", src: "/footwear_women.png" },
        { id: 8, name: "FootWear Kids", src: "/footwear_kids.png" },
        { id: 9, name: "Mobile Accessories", src: "/accessories.png" },
        { id: 10, name: "Sports", src: "/sports.png" },
        { id: 11, name: "Rings", src: "/rings.png" },
    ];
    const settings = {
        dots: false,
        infinite: true,
        speed: 1000,
        slidesToShow: 5,
        slidesToScroll: 3,
        autoplay: true,
        autoplaySpeed: 1500,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 3,
                    infinite: true,
                },
            },
            {
                breakpoint: 768,
                settings: { slidesToShow: 2, slidesToScroll: 1 },
            },
            {
                breakpoint: 480,
                settings: { slidesToShow: 1, slidesToScroll: 1 },
            },
        ],
    };

    return (
        <div className="w-full px-4 py-6 bg-gradient-to-r from-blue-50 to-indigo-100">
            <div className="max-w-6xl mx-auto">
                <Slider {...settings} className="category-slider">
                    {categoryImage.map((category) => (
                        <div key={category.id} className="px-2">
                            <Link href={`/productListing/${category.id}`}>
                                <div className="group flex flex-col items-center cursor-pointer">
                                    <div className="aspect-square w-[150px] h-[150px] rounded-full border-2 border-black hover:border-red-500 transition-colors duration-300 overflow-hidden bg-gradient-to-br from-orange-300 to-amber-300 flex items-center justify-center">
                                        <img
                                            src={category.src}
                                            alt={category.name}
                                            className="w-[100px] h-[100px] object-contain transition-transform duration-300 group-hover:scale-75"
                                        />
                                    </div>
                                    <p className="text-center mt-2 text-sm font-medium text-gray-800">
                                        {category.name}
                                    </p>
                                </div>
                            </Link>
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
};

export default CategorySlider;

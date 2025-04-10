"use client";

import React, { useEffect, useState } from "react";
import ProductDetail from "../../components/ProductDetail"; // Adjust the import path as necessary
import { useParams } from "next/navigation"; // Import useParams from next/navigation

const ProductPage = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (id) {
                try {
                    const res = await fetch(`/api/productView?id=${id}`);
                    if (!res.ok) {
                        throw new Error("Network response was not ok");
                    }
                    const result = await res.json();
                    setData(result[0]);
                } catch (error) {
                    console.error("Error fetching data:", error);
                    setError("Failed to load product details.");
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [id]);

    if (loading)
        return (
            <div
                className="flex justify-center items-center h-screen"
                role="status"
            >
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-2">Loading...</p>
                </div>
            </div>
        );
    if (error) return <div>{error}</div>;
    if (!data) return <div>No product found.</div>;

    return <ProductDetail product={data} />;
};

export default ProductPage;

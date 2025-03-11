"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams } from "next/navigation";
import ProductCard from "../../components/ProductCard";
import ProductSlider from "../../components/ProductSlider";

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ProductListing = ({ searchParams }) => {
    const { id } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [priceFilter, setPriceFilter] = useState("all");
    const [sortBy, setSortBy] = useState("price-low");
    const itemsPerPage = 12;

    const fetchProducts = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from("products")
                .select("*", { count: "exact" })
                .eq("categoryid", id); // Filter products by category ID

            // Apply price filter
            if (priceFilter === "under-500") {
                query = query.lt("discounted_price", 500);
            } else if (priceFilter === "500-1000") {
                query = query
                    .gte("discounted_price", 500)
                    .lt("discounted_price", 1000);
            } else if (priceFilter === "above-1000") {
                query = query.gte("discounted_price", 1000);
            }

            // Apply sorting
            if (sortBy === "price-low") {
                query = query.order("discounted_price", { ascending: true });
            } else if (sortBy === "price-high") {
                query = query.order("discounted_price", { ascending: false });
            } else if (sortBy === "rating") {
                query = query.order("productrating", { ascending: false });
            }

            // Apply pagination
            const start = (currentPage - 1) * itemsPerPage;
            const end = start + itemsPerPage - 1;
            query = query.range(start, end);

            const { data, count, error } = await query;

            if (error) throw error;

            setProducts(data);
            setTotalPages(Math.ceil(count / itemsPerPage));
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            // Only fetch products if category ID is available
            fetchProducts();
        }
    }, [currentPage, priceFilter, sortBy, id]); // Added id to dependency array

    const handlePriceFilterChange = (e) => {
        setPriceFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
        setCurrentPage(1);
    };

    // Show loading state if no category ID is available
    if (!id) {
        return (
            <div className="flex justify-center items-center h-64">
                <p>No category selected</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/*Product Slider*/}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-100 p-6 mb-8 rounded-xl shadow-sm border border-blue-100">
                <ProductSlider id={id} />
            </div>
            {/* Filters and Sort Section */}
            <div className="mb-6 flex flex-wrap gap-4">
                <select
                    value={priceFilter}
                    onChange={handlePriceFilterChange}
                    className="p-2 border rounded-lg"
                >
                    <option value="all">All Prices</option>
                    <option value="under-500">Under ₹500</option>
                    <option value="500-1000">₹500 - ₹1000</option>
                    <option value="above-1000">Above ₹1000</option>
                </select>

                <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="p-2 border rounded-lg"
                >
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Rating</option>
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <>
                    {/* Product Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product, index) => (
                            <div key={index}>
                                <ProductCard
                                    data={product}
                                    id={product.uniq_id}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="mt-8 flex justify-center gap-2">
                        <button
                            onClick={() =>
                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={currentPage === 1}
                            className="px-4 py-2 border rounded-lg disabled:opacity-50"
                        >
                            Previous
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`px-4 py-2 border rounded-lg ${
                                    currentPage === i + 1
                                        ? "bg-blue-500 text-white"
                                        : ""
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() =>
                                setCurrentPage((prev) =>
                                    Math.min(prev + 1, totalPages)
                                )
                            }
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border rounded-lg disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ProductListing;

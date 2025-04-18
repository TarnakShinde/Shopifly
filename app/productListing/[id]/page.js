"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";
import ProductCard from "../../components/ProductCard";
import ProductSlider from "../../components/ProductSlider";
import { supabase } from "../../../lib/supabase";

const ProductListing = ({ searchParams }) => {
    const { id } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [priceFilter, setPriceFilter] = useState("all");
    const [sortBy, setSortBy] = useState("price-low");
    const [subcategories, setSubcategories] = useState([]);
    const [subcategoryFilter, setSubcategoryFilter] = useState("all");
    const itemsPerPage = 12;

    // Fetch available subcategories for the current category
    const fetchSubcategories = async () => {
        try {
            const { data, error } = await supabase
                .from("products")
                .select("subcategory")
                .eq("categoryid", id)
                .not("subcategory", "is", null);

            if (error) throw error;

            // Extract unique subcategories
            const uniqueSubcategories = [
                ...new Set(data.map((item) => item.subcategory)),
            ];
            setSubcategories(uniqueSubcategories);
        } catch (error) {
            console.error("Error fetching subcategories:", error);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from("products")
                .select("*", { count: "exact" })
                .eq("categoryid", id); // Filter products by category ID

            // Apply subcategory filter
            if (subcategoryFilter !== "all") {
                query = query.eq("subcategory", subcategoryFilter);
            }

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
            // Fetch subcategories when category ID changes
            fetchSubcategories();
            // Reset subcategory filter when category changes
            setSubcategoryFilter("all");
            // Fetch products
            fetchProducts();
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            // Only fetch products if category ID is available
            fetchProducts();
        }
    }, [currentPage, priceFilter, sortBy, subcategoryFilter, id]);

    const handlePriceFilterChange = (e) => {
        setPriceFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
        setCurrentPage(1);
    };

    const handleSubcategoryFilterChange = (e) => {
        setSubcategoryFilter(e.target.value);
        setCurrentPage(1);
    };

    // Show loading state if no category ID is available
    if (!id) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-2">No category selected</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Product Slider */}
            <div className="max-w-full p-6 mb-8 rounded-xl shadow-sm border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-100">
                <ProductSlider id={id} />
            </div>
            <div className="container mx-auto px-4 py-8">
                {/* Filters and Sort Section */}
                <div className="mb-6 flex flex-wrap gap-4">
                    {/* Subcategory Filter */}
                    {id == 1 || id == 2 || id == 3 ? (
                        <select
                            value={subcategoryFilter}
                            onChange={handleSubcategoryFilterChange}
                            className="p-2 border rounded-lg"
                        >
                            <option value="all">All Subcategories</option>
                            {subcategories.map((subcategory) => (
                                <option key={subcategory} value={subcategory}>
                                    {subcategory}
                                </option>
                            ))}
                        </select>
                    ) : null}

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
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 bg-gradient-to-r from-blue-50 to-indigo-100 p-6 rounded-xl shadow-sm border border-blue-100">
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
                                    setCurrentPage((prev) =>
                                        Math.max(prev - 1, 1)
                                    )
                                }
                                disabled={currentPage === 1}
                                className="px-4 py-2 border rounded-lg disabled:opacity-50 transition-colors hover:bg-blue-200"
                                aria-label="Previous page"
                            >
                                Previous
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`px-4 py-2 border rounded-lg transition-colors ${
                                        currentPage === i + 1
                                            ? "bg-blue-500 text-white"
                                            : "hover:bg-blue-100"
                                    }`}
                                    aria-label={`Page ${i + 1}`}
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
                                className="px-4 py-2 border rounded-lg disabled:opacity-50 transition-colors hover:bg-blue-200"
                                aria-label="Next page"
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default ProductListing;

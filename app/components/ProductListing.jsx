"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Heart } from "lucide-react";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ProductListing = () => {
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
        .eq("categoryid", parseInt(query))
        .select("*", { count: "exact" });

      // Apply price filter
      if (priceFilter === "under-500") {
        query = query.lt("price", 500);
      } else if (priceFilter === "500-1000") {
        query = query.gte("price", 500).lt("price", 1000);
      } else if (priceFilter === "above-1000") {
        query = query.gte("price", 1000);
      }

      // Apply sorting
      if (sortBy === "price-low") {
        query = query.order("price", { ascending: true });
      } else if (sortBy === "price-high") {
        query = query.order("price", { ascending: false });
      } else if (sortBy === "rating") {
        query = query.order("rating", { ascending: false });
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
    fetchProducts();
  }, [currentPage, priceFilter, sortBy]);

  const handlePriceFilterChange = (e) => {
    setPriceFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1); // Reset to first page when sort changes
  };

  return (
    <div className="container mx-auto px-4 py-8">
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
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
                <div className="relative">
                  <img
                    src={product.image_url || "/placeholder.png"}
                    alt={product.name}
                    className="w-full h-48 object-contain"
                  />
                  <button className="absolute top-2 right-2">
                    <Heart className="w-6 h-6 text-gray-500 hover:text-red-500" />
                  </button>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold truncate">{product.name}</h3>
                  <div className="flex items-center mt-2">
                    <div className="bg-green-500 text-white px-2 py-1 rounded-full text-sm">
                      {product.rating} ★
                    </div>
                    <span className="ml-2 text-gray-600">{product.reviews_count || 0} reviews</span>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <div>
                      <span className="text-xl font-bold">₹{product.price}</span>
                      {product.original_price && (
                        <>
                          <span className="ml-2 text-gray-500 line-through">₹{product.original_price}</span>
                          <span className="ml-2 text-green-600">
                            {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% off
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600">
                      Buy Now
                    </button>
                    <button className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                  currentPage === i + 1 ? "bg-blue-500 text-white" : ""
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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

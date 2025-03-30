"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { toast } from "react-toastify";
import { logoutActionforDashboard } from "../../logout/actions";
import { useRouter } from "next/navigation";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const fetchOrderData = async () => {
    const { data, error } = await supabase.from("orders").select("*");

    if (error) {
        console.error("Error fetching orders:", error);
        return [];
    }

    return data;
};

// Function to process orders data for the chart
const processOrdersForChart = (orders) => {
    if (!orders || orders.length === 0) return [];

    // Group orders by date and count them
    const ordersByDate = orders.reduce((acc, order) => {
        // Format date to YYYY-MM-DD from the created_at field
        try {
            const date = new Date(order.created_at);
            // Format as YYYY-MM-DD for consistent grouping
            const formattedDate = date.toISOString().split("T")[0];

            if (!acc[formattedDate]) {
                acc[formattedDate] = 0;
            }
            acc[formattedDate] += 1;
        } catch (e) {
            console.error("Date formatting error:", e);
            console.log("Original date string:", order.created_at);
        }
        return acc;
    }, {});

    // Convert to array format for chart
    return Object.entries(ordersByDate)
        .map(([date, count]) => ({
            date,
            count,
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
};

export default function Dashboard() {
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [currentAction, setCurrentAction] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [orderData, setOrderData] = useState([]);
    const [orders, setOrders] = useState([]);
    const [editingProduct, setEditingProduct] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const productsPerPage = 25;

    // Calculate total pages
    const totalPages = Math.ceil(products.length / productsPerPage);

    // Slice products to show only the ones for the current page
    const paginatedProducts = products.slice(
        (currentPage - 1) * productsPerPage,
        currentPage * productsPerPage
    );
    const [newProduct, setNewProduct] = useState({
        uniq_id: "",
        product_name: "",
        retail_price: 0,
        discounted_price: 0,
        pid: "",
        image1: "",
        image2: "",
        image3: "",
        image4: "",
        description: "",
        product_specifications: "{}",
        categoryid: 0,
        productstockquantity: 0,
        productrating: 0.0,
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrderData = async () => {
            const data = await fetchOrderData();
            setOrders(data);
            const chartData = processOrdersForChart(data);
            setOrderData(chartData);
        };
        loadOrderData();
    }, []);

    // Fetch products and users when the page loads
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const { data: productData, error: productError } =
                    await supabase.from("products").select("*");
                const { data: userData, error: userError } = await supabase
                    .from("profiles")
                    .select("*");
                if (productError || userError) {
                    setError("Error fetching data.");
                } else {
                    setProducts(productData);
                    setUsers(userData);
                }
            } catch (error) {
                setError("Something went wrong.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Add product function
    const handleAddProduct = async () => {
        try {
            // Ensure JSON is valid before inserting
            const formattedProduct = {
                ...newProduct,
                product_specifications:
                    JSON.parse(newProduct.product_specifications) || {},
            };

            const { error } = await supabase
                .from("products")
                .insert([formattedProduct]);

            if (error) {
                console.error("Supabase Error:", error.message);
                toast.error("Failed to add product");
                return;
            }

            // Fetch updated product list
            const { data: updatedProducts, error: fetchError } = await supabase
                .from("products")
                .select("*");

            if (fetchError) {
                console.error("Fetch Error:", fetchError.message);
                return;
            }

            setProducts(updatedProducts);
            setError(null);
            toast.success("Product added successfully!");

            // ✅ Clear the form by resetting newProduct
            setNewProduct({
                uniq_id: "",
                product_name: "",
                retail_price: "",
                discounted_price: "",
                pid: "",
                image1: "",
                image2: "",
                image3: "",
                image4: "",
                description: "",
                product_specifications: "{}", // Reset as empty JSON string
                categoryid: "",
                productstockquantity: "",
                productrating: "",
            });

            setCurrentAction(null); // Hide the form after submission
        } catch (error) {
            console.error("Unexpected Error:", error);
            setError("Error adding product.");
            toast.error("Error adding product.");
        }
    };

    // Delete product function
    const handleDeleteProduct = async (uniq_id) => {
        if (confirm("Are you sure you want to delete this product?")) {
            try {
                const { error } = await supabase
                    .from("products")
                    .delete()
                    .eq("uniq_id", uniq_id);
                if (error) {
                    setError("Failed to delete product.");
                } else {
                    setProducts(
                        products.filter(
                            (product) => product.uniq_id !== uniq_id
                        )
                    );
                    setError(null);
                    alert("Product deleted successfully!");
                }
            } catch (error) {
                setError("Error deleting product.");
            }
        }
    };

    // View product function
    const handleViewProduct = (uniq_id) => {
        if (!products) {
            return;
        }
        router.push(`/product/${uniq_id}`);
    };

    // Function to handle clicking the Edit button
    const handleEditProduct = (productId) => {
        // Find the product to edit from the products array
        const productToEdit = products.find(
            (product) => product.uniq_id === productId
        );

        // Set the product data in state for editing
        setEditingProduct(productToEdit);

        // Change the current action to the edit form view
        setCurrentAction("editProduct");

        // Optionally: scroll to the edit form
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // Function to handle form field changes
    const handleEditFormChange = (e) => {
        const { name, value } = e.target;

        // Handle different field types appropriately
        let processedValue = value;

        if (
            name === "retail_price" ||
            name === "discounted_price" ||
            name === "productstockquantity" ||
            name === "categoryid"
        ) {
            processedValue = value === "" ? null : parseInt(value);
        } else if (name === "productrating") {
            processedValue = value === "" ? null : parseFloat(value);
        } else if (name === "product_specifications") {
            try {
                processedValue = value === "" ? null : JSON.parse(value);
            } catch (error) {
                console.error("Invalid JSON for product specifications");
                // Keep the existing value if the new one is invalid
                processedValue = editingProduct.product_specifications;
            }
        }

        setEditingProduct({
            ...editingProduct,
            [name]: processedValue,
        });
    };

    // Function to save the edited product to the database
    // Function to save the edited product to the Supabase database
    const handleSaveProduct = async () => {
        try {
            // Show loading state
            setIsLoading(true);

            // Get the Supabase client (assuming it's imported and initialized elsewhere in your app)
            // If not already imported, you'll need to import it:
            // import { supabase } from '../lib/supabaseClient';

            // Update the product in the Supabase 'products' table
            const { data, error } = await supabase
                .from("products")
                .update({
                    product_name: editingProduct.product_name,
                    pid: editingProduct.pid,
                    retail_price: editingProduct.retail_price,
                    discounted_price: editingProduct.discounted_price,
                    image1: editingProduct.image1,
                    image2: editingProduct.image2,
                    image3: editingProduct.image3,
                    image4: editingProduct.image4,
                    description: editingProduct.description,
                    product_specifications:
                        editingProduct.product_specifications,
                    categoryid: editingProduct.categoryid,
                    productstockquantity: editingProduct.productstockquantity,
                    productrating: editingProduct.productrating,
                    subcategory: editingProduct.subcategory,
                })
                .eq("uniq_id", editingProduct.uniq_id);

            if (error) {
                throw new Error(`Supabase error: ${error.message}`);
            }

            // Update the product in the local state
            const updatedProducts = products.map((product) =>
                product.uniq_id === editingProduct.uniq_id
                    ? editingProduct
                    : product
            );
            setProducts(updatedProducts);
            toast.success("Product updated successfully!");
            // Go back to product list
            setCurrentAction("manageProducts");
            setEditingProduct(null);
        } catch (error) {
            console.error("Error updating product:", error);
            toast.error("Error updating product.");
        } finally {
            setIsLoading(false);
        }
    };

    // Function to cancel editing and return to product list
    const handleCancelEdit = () => {
        setEditingProduct(null);
        setCurrentAction("manageProducts");
    };

    // Delete user function
    const handleDeleteUser = async (userid) => {
        if (confirm("Are you sure you want to delete this user?")) {
            try {
                const { error } = await supabase
                    .from("profiles")
                    .delete()
                    .eq("userid", userid);
                if (error) {
                    setError("Failed to delete user.");
                } else {
                    setUsers(users.filter((user) => user.userid !== userid));
                    setError(null);
                    alert("User deleted successfully!");
                }
            } catch (error) {
                setError("Error deleting user.");
            }
        }
    };

    // Function to format date
    const formatDate = (dateString) => {
        console.log("Date string:", dateString); // Debug log
        if (!dateString) return "N/A";

        try {
            const date = new Date(dateString);

            // Format as DD/MM/YYYY
            const day = date.getDate().toString().padStart(2, "0");
            const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-indexed
            const year = date.getFullYear();

            return `${day}/${month}/${year}`;
        } catch (e) {
            console.error("Date formatting error:", e);
            console.log("Original date string:", dateString);
            return dateString; // Return original string if formatting fails
        }
    };

    // Function to format currency
    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return "₹0.00";

        try {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "INR",
            }).format(amount);
        } catch (e) {
            console.error("Currency formatting error:", e);
            return `${amount}`; // Fallback formatting
        }
    };

    // Add this function to your component
    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            // Set loading state if needed
            setLoading(true);

            // Make API call to update order status
            const response = await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error("Failed to update order status");
            }

            // Update local state to reflect the change immediately
            setOrders(
                orders.map((order) =>
                    order.id === orderId
                        ? { ...order, status: newStatus }
                        : order
                )
            );

            // Show success notification
            toast.success(`Order #${orderId} status updated to ${newStatus}`);
        } catch (error) {
            console.error("Error updating order status:", error);
            toast.error("Failed to update order status. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-2">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="container mx-auto px-4 py-8 min-h-screen">
                <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
                        Admin Dashboard
                    </h1>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {/* Navigation Tabs */}
                    <div className="flex flex-wrap gap-2 mb-6 items-center justify-center">
                        <button
                            onClick={() => setCurrentAction("addProduct")}
                            className={`px-4 py-2 rounded-md transition-colors ${
                                currentAction === "addProduct"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                            }`}
                        >
                            Add Product
                        </button>
                        <button
                            onClick={() => setCurrentAction("manageProducts")}
                            className={`px-4 py-2 rounded-md transition-colors ${
                                currentAction === "manageProducts"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                            }`}
                        >
                            Manage Products
                        </button>
                        <button
                            onClick={() => setCurrentAction("manageUsers")}
                            className={`px-4 py-2 rounded-md transition-colors ${
                                currentAction === "manageUsers"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                            }`}
                        >
                            Manage Users
                        </button>
                        <button
                            onClick={() => setCurrentAction("orderChart")}
                            className={`px-4 py-2 rounded-md transition-colors ${
                                currentAction === "orderChart"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                            }`}
                        >
                            Order Analytics
                        </button>
                        <button
                            onClick={() => logoutActionforDashboard()}
                            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                        >
                            Logout
                        </button>
                        {currentAction == "addProduct" ||
                        currentAction == "manageUsers" ||
                        currentAction == "manageProducts" ||
                        currentAction == "orderChart" ? (
                            <button
                                type="button"
                                onClick={() => setCurrentAction(null)}
                                className="px-6 py-2 ml-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                            >
                                Cancel
                            </button>
                        ) : (
                            <></>
                        )}
                    </div>

                    {/* Add Product Form */}
                    {currentAction === "addProduct" && (
                        <div className="bg-gray-50 p-4 rounded-lg shadow-md mb-6">
                            <h2 className="text-xl font-semibold mb-4">
                                Add New Product
                            </h2>
                            <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Unique ID
                                    </label>
                                    <input
                                        type="text"
                                        value={newProduct.uniq_id}
                                        onChange={(e) =>
                                            setNewProduct({
                                                ...newProduct,
                                                uniq_id: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Product Name
                                    </label>
                                    <input
                                        type="text"
                                        value={newProduct.product_name}
                                        onChange={(e) =>
                                            setNewProduct({
                                                ...newProduct,
                                                product_name: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Retail Price
                                    </label>
                                    <input
                                        type="number"
                                        value={newProduct.retail_price}
                                        onChange={(e) =>
                                            setNewProduct({
                                                ...newProduct,
                                                retail_price: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Discounted Price
                                    </label>
                                    <input
                                        type="number"
                                        value={newProduct.discounted_price}
                                        onChange={(e) =>
                                            setNewProduct({
                                                ...newProduct,
                                                discounted_price:
                                                    e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        PID
                                    </label>
                                    <input
                                        type="text"
                                        value={newProduct.pid}
                                        onChange={(e) =>
                                            setNewProduct({
                                                ...newProduct,
                                                pid: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Image 1 URL
                                    </label>
                                    <input
                                        type="text"
                                        value={newProduct.image1}
                                        onChange={(e) =>
                                            setNewProduct({
                                                ...newProduct,
                                                image1: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Image 2 URL
                                    </label>
                                    <input
                                        type="text"
                                        value={newProduct.image2}
                                        onChange={(e) =>
                                            setNewProduct({
                                                ...newProduct,
                                                image2: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Image 3 URL
                                    </label>
                                    <input
                                        type="text"
                                        value={newProduct.image3}
                                        onChange={(e) =>
                                            setNewProduct({
                                                ...newProduct,
                                                image3: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Image 4 URL
                                    </label>
                                    <input
                                        type="text"
                                        value={newProduct.image4}
                                        onChange={(e) =>
                                            setNewProduct({
                                                ...newProduct,
                                                image4: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Description
                                    </label>
                                    <textarea
                                        value={newProduct.description}
                                        onChange={(e) =>
                                            setNewProduct({
                                                ...newProduct,
                                                description: e.target.value,
                                            })
                                        }
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    ></textarea>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Product Specifications (JSON)
                                    </label>
                                    <textarea
                                        value={
                                            newProduct.product_specifications
                                        } // Corrected name
                                        onChange={(e) =>
                                            setNewProduct({
                                                ...newProduct,
                                                product_specifications:
                                                    e.target.value, // Corrected name
                                            })
                                        }
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                        required
                                    ></textarea>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Category ID
                                    </label>
                                    <input
                                        type="number"
                                        value={newProduct.categoryid}
                                        onChange={(e) =>
                                            setNewProduct({
                                                ...newProduct,
                                                categoryid: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Stock Quantity
                                    </label>
                                    <input
                                        type="number"
                                        value={newProduct.productstockquantity}
                                        onChange={(e) =>
                                            setNewProduct({
                                                ...newProduct,
                                                productstockquantity:
                                                    e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Product Rating
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="5"
                                        value={newProduct.productrating}
                                        onChange={(e) =>
                                            setNewProduct({
                                                ...newProduct,
                                                productrating: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2 lg:col-span-3 mt-4">
                                    <button
                                        type="button"
                                        onClick={handleAddProduct}
                                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                                    >
                                        Add Product
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Manage Products */}
                    {currentAction === "manageProducts" && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">
                                Manage Products
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Product ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Price
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Stock
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {paginatedProducts.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan="5"
                                                    className="px-6 py-4 text-center text-gray-500"
                                                >
                                                    No products found
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedProducts.map((product) => (
                                                <tr
                                                    key={product.uniq_id}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {product.uniq_id}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {product.product_name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        ₹{product.retail_price}
                                                        {product.discounted_price >
                                                            0 && (
                                                            <span className="ml-2 text-green-600">
                                                                ₹
                                                                {
                                                                    product.discounted_price
                                                                }
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {
                                                            product.productstockquantity
                                                        }
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        <button
                                                            onClick={() =>
                                                                handleViewProduct(
                                                                    product.uniq_id
                                                                )
                                                            }
                                                            className="mr-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleEditProduct(
                                                                    product.uniq_id
                                                                )
                                                            }
                                                            className="mr-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteProduct(
                                                                    product.uniq_id
                                                                )
                                                            }
                                                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex justify-between items-center mt-4">
                                <button
                                    onClick={() =>
                                        setCurrentPage(currentPage - 1)
                                    }
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 rounded ${
                                        currentPage === 1
                                            ? "bg-gray-300"
                                            : "bg-blue-500 text-white hover:bg-blue-600"
                                    }`}
                                >
                                    Previous
                                </button>
                                <span className="text-gray-700">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() =>
                                        setCurrentPage(currentPage + 1)
                                    }
                                    disabled={currentPage === totalPages}
                                    className={`px-4 py-2 rounded ${
                                        currentPage === totalPages
                                            ? "bg-gray-300"
                                            : "bg-blue-500 text-white hover:bg-blue-600"
                                    }`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/*Edit Products*/}
                    {currentAction === "editProduct" && editingProduct && (
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 className="text-xl font-semibold mb-4">
                                Edit Product
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {/* Product ID - Read-only */}
                                <div>
                                    <label
                                        htmlFor="uniq_id"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Product ID (Read-only)
                                    </label>
                                    <input
                                        type="text"
                                        id="uniq_id"
                                        name="uniq_id"
                                        value={editingProduct.uniq_id || ""}
                                        readOnly
                                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                                    />
                                </div>

                                {/* Product Name */}
                                <div>
                                    <label
                                        htmlFor="product_name"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Product Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="product_name"
                                        name="product_name"
                                        value={
                                            editingProduct.product_name || ""
                                        }
                                        onChange={handleEditFormChange}
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* PID (optional) */}
                                <div>
                                    <label
                                        htmlFor="pid"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        PID
                                    </label>
                                    <input
                                        type="text"
                                        id="pid"
                                        name="pid"
                                        value={editingProduct.pid || ""}
                                        onChange={handleEditFormChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Retail Price */}
                                <div>
                                    <label
                                        htmlFor="retail_price"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Retail Price (₹)
                                    </label>
                                    <input
                                        type="number"
                                        id="retail_price"
                                        name="retail_price"
                                        value={
                                            editingProduct.retail_price || ""
                                        }
                                        onChange={handleEditFormChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Discounted Price */}
                                <div>
                                    <label
                                        htmlFor="discounted_price"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Discounted Price (₹)
                                    </label>
                                    <input
                                        type="number"
                                        id="discounted_price"
                                        name="discounted_price"
                                        value={
                                            editingProduct.discounted_price ||
                                            ""
                                        }
                                        onChange={handleEditFormChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Stock Quantity */}
                                <div>
                                    <label
                                        htmlFor="productstockquantity"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Stock Quantity
                                    </label>
                                    <input
                                        type="number"
                                        id="productstockquantity"
                                        name="productstockquantity"
                                        value={
                                            editingProduct.productstockquantity ||
                                            ""
                                        }
                                        onChange={handleEditFormChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Category ID */}
                                <div>
                                    <label
                                        htmlFor="categoryid"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Category ID
                                    </label>
                                    <input
                                        type="number"
                                        id="categoryid"
                                        name="categoryid"
                                        value={editingProduct.categoryid || ""}
                                        onChange={handleEditFormChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Subcategory */}
                                <div>
                                    <label
                                        htmlFor="subcategory"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Subcategory
                                    </label>
                                    <input
                                        type="text"
                                        id="subcategory"
                                        name="subcategory"
                                        value={editingProduct.subcategory || ""}
                                        onChange={handleEditFormChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Product Rating */}
                                <div>
                                    <label
                                        htmlFor="productrating"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Product Rating
                                    </label>
                                    <input
                                        type="number"
                                        id="productrating"
                                        name="productrating"
                                        value={
                                            editingProduct.productrating || ""
                                        }
                                        onChange={handleEditFormChange}
                                        min="0"
                                        max="5"
                                        step="0.1"
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Image URLs - displayed in a single row */}
                            <div className="mb-4">
                                <h3 className="text-md font-medium text-gray-700 mb-2">
                                    Product Images
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="image1"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Image 1 URL
                                        </label>
                                        <input
                                            type="text"
                                            id="image1"
                                            name="image1"
                                            value={editingProduct.image1 || ""}
                                            onChange={handleEditFormChange}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="image2"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Image 2 URL
                                        </label>
                                        <input
                                            type="text"
                                            id="image2"
                                            name="image2"
                                            value={editingProduct.image2 || ""}
                                            onChange={handleEditFormChange}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="image3"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Image 3 URL
                                        </label>
                                        <input
                                            type="text"
                                            id="image3"
                                            name="image3"
                                            value={editingProduct.image3 || ""}
                                            onChange={handleEditFormChange}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="image4"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Image 4 URL
                                        </label>
                                        <input
                                            type="text"
                                            id="image4"
                                            name="image4"
                                            value={editingProduct.image4 || ""}
                                            onChange={handleEditFormChange}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-4">
                                <label
                                    htmlFor="description"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Product Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={editingProduct.description || ""}
                                    onChange={handleEditFormChange}
                                    rows="4"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                ></textarea>
                            </div>

                            {/* Product Specifications (JSONB) */}
                            <div className="mb-6">
                                <label
                                    htmlFor="product_specifications"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Product Specifications (JSON)
                                </label>
                                <textarea
                                    id="product_specifications"
                                    name="product_specifications"
                                    value={
                                        editingProduct.product_specifications
                                            ? JSON.stringify(
                                                  editingProduct.product_specifications,
                                                  null,
                                                  2
                                              )
                                            : ""
                                    }
                                    onChange={handleEditFormChange}
                                    rows="6"
                                    className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder='{"key": "value"}'
                                ></textarea>
                                <p className="text-xs text-gray-500 mt-1">
                                    Enter product specifications in valid JSON
                                    format
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={handleCancelEdit}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveProduct}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Manage Users */}
                    {currentAction === "manageUsers" && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">
                                Manage Users
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {users.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan="3"
                                                    className="px-6 py-4 text-center text-gray-500"
                                                >
                                                    No users found
                                                </td>
                                            </tr>
                                        ) : (
                                            users.map((user) => (
                                                <tr
                                                    key={user.userid}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {user.userid}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {user.userEmail}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {user.userRole}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteUser(
                                                                    user.userid
                                                                )
                                                            }
                                                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Order Analytics Chart */}
                    {currentAction === "orderChart" && (
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4">
                                Order Analytics
                            </h2>
                            {/* Orders Chart */}
                            <div className="mb-8">
                                <h3 className="text-lg font-medium mb-3">
                                    Orders Per Day
                                </h3>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <LineChart
                                            data={orderData}
                                            margin={{
                                                top: 5,
                                                right: 30,
                                                left: 20,
                                                bottom: 5,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="count"
                                                stroke="#3B82F6"
                                                name="Orders"
                                                strokeWidth={2}
                                                dot={{ r: 4 }}
                                                activeDot={{ r: 8 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Order Details Table */}
                            <div>
                                <h3 className="text-lg font-medium mb-3">
                                    Recent Orders
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Order ID
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    User ID
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Total Amount
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {orders.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan="6"
                                                        className="px-6 py-4 text-center text-gray-500"
                                                    >
                                                        No orders found
                                                    </td>
                                                </tr>
                                            ) : (
                                                orders.map((order) => (
                                                    <tr
                                                        key={order.id}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {order.id}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {order.user_id}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {formatDate(
                                                                order.created_at
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {formatCurrency(
                                                                order.total_price
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <span
                                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                    order.status ===
                                                                    "completed"
                                                                        ? "bg-green-100 text-green-800"
                                                                        : order.status ===
                                                                          "pending"
                                                                        ? "bg-yellow-100 text-yellow-800"
                                                                        : order.status ===
                                                                          "processing"
                                                                        ? "bg-blue-100 text-blue-800"
                                                                        : "bg-gray-100 text-gray-800"
                                                                }`}
                                                            >
                                                                {order.status
                                                                    ? order.status
                                                                          .charAt(
                                                                              0
                                                                          )
                                                                          .toUpperCase() +
                                                                      order.status.slice(
                                                                          1
                                                                      )
                                                                    : "Unknown"}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <div className="relative">
                                                                <select
                                                                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                                                    value={
                                                                        order.status ||
                                                                        ""
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        updateOrderStatus(
                                                                            order.id,
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                >
                                                                    <option value="pending">
                                                                        Pending
                                                                    </option>
                                                                    <option value="delivered">
                                                                        Delivered
                                                                    </option>
                                                                    <option value="shipped">
                                                                        Shipped
                                                                    </option>
                                                                    <option value="cancelled">
                                                                        Cancelled
                                                                    </option>
                                                                </select>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

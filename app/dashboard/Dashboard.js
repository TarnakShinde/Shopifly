"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { toast } from "react-toastify";
import { logoutActionforDashboard } from "../logout/actions";
import Router from "next/navigation";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [currentAction, setCurrentAction] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
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
        <div className="container mx-auto px-4 py-8">
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
                        onClick={() => logoutActionforDashboard()}
                        className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                        Logout
                    </button>
                    {currentAction == "addProduct" ||
                    currentAction == "manageUsers" ||
                    currentAction == "manageProducts" ? (
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
                    <div className="bg-gray-50 p-4 rounded-lg">
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
                                            discounted_price: e.target.value,
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
                                    value={newProduct.product_specifications} // Corrected name
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
                                onClick={() => setCurrentPage(currentPage - 1)}
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
                                onClick={() => setCurrentPage(currentPage + 1)}
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

                {/* Dashboard Home/Welcome */}
                {!currentAction && (
                    <div className="text-center py-12">
                        <h2 className="text-xl font-semibold mb-4">
                            Welcome to the Admin Dashboard
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Select an option above to manage your store
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
                                <h3 className="font-medium text-blue-800 mb-2">
                                    Products
                                </h3>
                                <p className="text-3xl font-bold">
                                    {products.length}
                                </p>
                            </div>

                            <div className="bg-green-50 p-6 rounded-lg shadow-sm">
                                <h3 className="font-medium text-green-800 mb-2">
                                    Users
                                </h3>
                                <p className="text-3xl font-bold">
                                    {users.length}
                                </p>
                            </div>

                            <div className="bg-purple-50 p-6 rounded-lg shadow-sm">
                                <h3 className="font-medium text-purple-800 mb-2">
                                    Categories
                                </h3>
                                <p className="text-3xl font-bold">
                                    {
                                        new Set(
                                            products.map((p) => p.categoryid)
                                        ).size
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

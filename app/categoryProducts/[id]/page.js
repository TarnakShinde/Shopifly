"use client";
import { useParams, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";

const CategoryProducts = ({ searchParams }) => {
    const { id } = useParams();
    // console.log("CID:", id);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchCategoryData = async () => {
            if (id) {
                try {
                    const res = await fetch(`/api/catProducts?id=${id}`);
                    if (!res.ok) {
                        throw new Error("Network response was not ok");
                    }
                    const result = await res.json();
                    setData(result);
                    console.log(result);
                } catch (error) {
                    console.error("Error fetching data:", error);
                    setError("Failed to load category data.");
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchCategoryData();
    }, [id]);

    return (
        <>
            <div>
                <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4 text-center">
                        Product Details
                    </h2>
                    <table className="w-fit border-collapse h-fit">
                        <thead className="w-fit">
                            <tr className="bg-gray-100">
                                <th className="border p-2">UNIQ_ID</th>
                                <th className="border p-2">PID</th>
                                <th className="border p-2">Name</th>
                                <th className="border p-2">Retail Price</th>
                                <th className="border p-2">Discounted Price</th>
                                <th className="border p-2">Description</th>
                                <th className="border p-2">Image1</th>
                                <th className="border p-2">Image2</th>
                                <th className="border p-2">Image3</th>
                                <th className="border p-2">Image4</th>
                                <th className="border p-2">
                                    Product Specification
                                </th>
                                <th className="border p-2">
                                    Product Stock Quantity
                                </th>
                                <th className="border p-2">Product Rating</th>
                                <th className="border p-2">Category</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((product) => (
                                <tr
                                    key={product.uniq_id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="border p-2">
                                        {product.uniq_id}
                                    </td>
                                    <td className="border p-2">
                                        {product.pid}
                                    </td>
                                    <td className="border p-2">
                                        {product.product_name}
                                    </td>
                                    <td className="border p-2">
                                        ₹{product.retail_price}
                                    </td>
                                    <td className="border p-2">
                                        ₹{product.discounted_price}
                                    </td>
                                    <td className="border p-2">
                                        {product.description}
                                    </td>
                                    <td className="border p-2">
                                        {product.image1 != null ? (
                                            <img
                                                src={product.image1}
                                                alt="image"
                                                className="object-contain"
                                            />
                                        ) : (
                                            "NULL"
                                        )}
                                    </td>
                                    <td className="border p-2">
                                        {product.image2 != null ? (
                                            <img
                                                src={product.image2}
                                                alt="image"
                                                className="object-contain"
                                            />
                                        ) : (
                                            "NULL"
                                        )}
                                    </td>
                                    <td className="border p-2">
                                        {product.image3 != null ? (
                                            <img
                                                src={product.image3}
                                                alt="image"
                                                className="object-contain"
                                            />
                                        ) : (
                                            "NULL"
                                        )}
                                    </td>
                                    <td className="border p-2">
                                        {product.image4 != null ? (
                                            <img
                                                src={product.image4}
                                                alt="image"
                                                className="object-contain"
                                            />
                                        ) : (
                                            "NULL"
                                        )}
                                    </td>
                                    <td className="border p-10">
                                        {product.product_specifications.product_specification.map(
                                            (spec, index) => (
                                                <li key={index}>
                                                    <strong>{spec.key}:</strong>{" "}
                                                    {spec.value}
                                                </li>
                                            )
                                        )}
                                    </td>
                                    <td className="border p-2">
                                        {product.productstockquantity}
                                    </td>
                                    <td className="border p-2">
                                        {product.productrating}
                                    </td>
                                    <td className="border p-2">
                                        {product.categoryid}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* <button
                    className="bg-blue-300 w-full"
                    onClick={() => {
                        console.log("Clicked");
                        addData();
                    }}
                >
                    Fetch More
                </button> */}
            </div>
        </>
    );
};

export default CategoryProducts;

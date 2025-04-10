"use client";
import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import Image from "next/image";
import { supabase } from "../../lib/supabase";

const SearchBar = ({ results, handleSearch, handleProductClick, query }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchRef = useRef(null);
    const itemRefs = useRef([]);

    // Close the suggestion dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Function to log search term
    const logSearch = async (searchTerm) => {
        const user = await supabase.auth.getUser();
        if (user?.data?.user) {
            await supabase.from("search_history").insert([
                {
                    user_id: user.data.user.id,
                    search_term: searchTerm,
                },
            ]);
        }
    };

    useEffect(() => {
        if (selectedIndex !== -1 && itemRefs.current[selectedIndex]) {
            itemRefs.current[selectedIndex].scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }
    }, [selectedIndex]);

    // Handle Enter key press
    const handleKeyDown = (e) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setIsOpen(true);
            setSelectedIndex((prevIndex) =>
                prevIndex < results.length - 1 ? prevIndex + 1 : 0
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setIsOpen(true);
            setSelectedIndex((prevIndex) =>
                prevIndex > 0 ? prevIndex - 1 : results.length - 1
            );
        } else if (e.key === "Enter") {
            if (selectedIndex >= 0 && selectedIndex < results.length) {
                const selectedProduct = results[selectedIndex];
                handleProductClick(selectedProduct.uniq_id);
                logSearch(selectedProduct.product_name);
            } else {
                handleSearch({ target: { value: query } });
                logSearch(query);
            }
            setIsOpen(false);
            setSelectedIndex(-1);
        }
    };

    return (
        <div className="flex-grow flex items-center justify-center px-4 sm:px-2">
            <div
                ref={searchRef}
                className="relative w-full max-w-md sm:max-w-xs"
            >
                {/* Search Input */}
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            handleSearch(e);
                            setIsOpen(true);
                            setSelectedIndex(-1);
                        }}
                        onKeyDown={handleKeyDown} // Trigger handleKeyDown when Enter key is pressed
                        placeholder="Search Anything..."
                        className="w-full p-3 font-mono rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 bg-[var(--sixth-color)] text-[var(--forth-color)]"
                    />
                    <button
                        type="button"
                        onClick={() => {
                            handleSearch({ target: { value: query } });
                            logSearch(query); // Log search term when Search button is clicked
                            setIsOpen(false); // Close the suggestion dropdown
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 hover:text-gray-400 focus:outline-none"
                    >
                        <Search />
                    </button>
                </div>

                {/* Suggestions Dropdown */}
                {isOpen && results.length > 0 && (
                    <div className="absolute z-50 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-[300px] overflow-y-auto mt-2 animate-fade-in">
                        {/* {results.map((result) => (
                            <div
                                key={result.uniq_id}
                                onClick={() => {
                                    handleProductClick(result.uniq_id);
                                    logSearch(result.product_name); // Log clicked product name
                                    setIsOpen(false); // Close the suggestion dropdown
                                }}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-none"
                            >
                                <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded overflow-hidden">
                                    <Image
                                        src={result.image1}
                                        alt={result.product_name}
                                        width={48}
                                        height={48}
                                        className="object-contain"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900 truncate">
                                        {result.product_name}
                                    </p>
                                </div>
                            </div>
                        ))} */}
                        {results.map((result, index) => (
                            <div
                                key={result.uniq_id}
                                ref={(el) => (itemRefs.current[index] = el)} // attach ref
                                onClick={() => {
                                    handleProductClick(result.uniq_id);
                                    logSearch(result.product_name);
                                    setIsOpen(false);
                                    setSelectedIndex(-1);
                                }}
                                className={`flex items-center gap-3 p-3 cursor-pointer border-b border-gray-100 last:border-none ${
                                    selectedIndex === index
                                        ? "bg-blue-100"
                                        : "hover:bg-gray-50"
                                }`}
                            >
                                <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded overflow-hidden">
                                    <Image
                                        src={result.image1}
                                        alt={result.product_name}
                                        width={48}
                                        height={48}
                                        className="object-contain"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900 truncate">
                                        {result.product_name}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchBar;

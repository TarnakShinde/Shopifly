import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";

const SearchBar = ({ results, handleSearch, handleProductClick, query }) => {
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef(null);

    // Handle clicks outside to close dropdown
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
                            setIsOpen(true); // Open dropdown on input
                        }}
                        placeholder="Search Anything..."
                        className="w-full p-3 font-mono rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 bg-[var(--sixth-color)] text-[var(--forth-color)]"
                    />
                    <button
                        type="button"
                        onClick={() =>
                            handleSearch({ target: { value: query } })
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 hover:text-gray-400 focus:outline-none"
                    >
                        <Search />
                    </button>
                </div>

                {/* Suggestions Dropdown */}
                {isOpen && results.length > 0 && (
                    <div className="absolute z-50 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-[300px] overflow-y-auto mt-2 animate-fade-in">
                        {results.map((result) => (
                            <div
                                key={result.uniq_id}
                                onClick={() => {
                                    handleProductClick(result.uniq_id);
                                    setIsOpen(false); // Close dropdown on selection
                                }}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-none"
                            >
                                <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded overflow-hidden">
                                    <img
                                        src={result.image1}
                                        alt={result.product_name}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src =
                                                "/default-product-image.png";
                                        }}
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

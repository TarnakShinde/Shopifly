"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Heart,
    Search,
    ShoppingBag,
    CircleUserRound,
    House,
} from "lucide-react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Added import for toast styling
import { createClient } from "../../utils/supabase/client";
import { logoutAction } from "../logout/actions";

const Navbar = () => {
    const notify = (message) =>
        toast.success(message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
        });
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isClick, setIsClick] = useState(false);
    const router = useRouter();
    const searchField = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);

    const supabase = createClient();

    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleSearch = async (e) => {
        const value = e.target.value;
        setQuery(value);

        if (value.length > 0) {
            try {
                const res = await fetch(`/api/search?query=${value}`);
                if (!res.ok)
                    throw new Error(
                        `Network response was not ok: ${res.status}`
                    );
                const data = await res.json();
                setResults(data);
                setIsOpen(true);
            } catch (error) {
                console.error("Error fetching search results:", error);
                setResults([]);
                setIsOpen(true);
            }
        } else {
            setResults([]);
            setIsOpen(false);
        }
    };

    const handleProductClick = (productId) => {
        router.push(`/product/${productId}`);
        setQuery("");
        setResults([]);
        setIsOpen(false);
    };

    const toggleNavbar = () => {
        setIsClick(!isClick);
    };

    const handleCartClick = () => {
        if (!user) {
            toast.warning("Please login or signup to access your cart", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return false;
        }
        return true;
    };

    // Rest of the existing methods remain the same...

    useEffect(() => {
        async function getUser() {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setUser(user);
        }
        getUser();

        // Set up auth state change listener
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            const currentUser = session?.user || null;
            setUser(currentUser);

            // Show login/logout notifications
            // if (event === "SIGNED_IN") {
            //     notify("Successfully logged in");
            //     window.location.reload();
            // } else if (event === "SIGNED_OUT") {
            //     notify("Successfully logged out");
            //     window.location.reload();
            // }
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    // Prepare menu items based on user authentication state
    const menuItems = user
        ? [
              <MenuItem key="profile" onClick={handleClose}>
                  <Link href={`/profile`} className="w-full block">
                      Profile
                  </Link>
              </MenuItem>,
              <MenuItem
                  key="logout"
                  onClick={() => {
                      handleClose();
                      logoutAction();
                  }}
              >
                  Logout
              </MenuItem>,
          ]
        : [
              <MenuItem key="login" onClick={handleClose}>
                  <Link href="/login" className="w-full block">
                      Login
                  </Link>
              </MenuItem>,
              <MenuItem key="signup" onClick={handleClose}>
                  <Link href="/signup" className="w-full block">
                      Signup
                  </Link>
              </MenuItem>,
          ];

    return (
        <>
            <nav className="bg-[var(--second-color)] shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo Section */}
                        <div className="flex-shrink-0">
                            <Link
                                href="/"
                                className="lg:text-2xl md:text-xl sm:text-base text-white font-bold"
                            >
                                SHOPI
                                <span className="text-[var(--first-color)]">
                                    FLY
                                </span>
                            </Link>
                        </div>

                        {/* Search Bar Section */}
                        <div className="flex-grow flex items-center justify-center">
                            <div className="mt-1 flex items-center relative">
                                <div className="relative w-full md:w-[300px] sm:w-[100px]  mx-auto">
                                    <div className="">
                                        <input
                                            type="text"
                                            value={query}
                                            onChange={handleSearch}
                                            placeholder="Search Anything.."
                                            className="sm:w-[100px] w-full md:w-[300px] p-2 font-mono rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 py-3 px-4 bg-[var(--sixth-color)] text-[var(--forth-color)]"
                                            ref={searchField}
                                        />
                                        <Search className="absolute right-3 bottom-3.5 w-5 h-5 text-gray-600 hover:text-gray-400 " />
                                    </div>

                                    {/* Suggestions Dropdown */}
                                    {isOpen && results.length > 0 && (
                                        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[400px] overflow-y-auto">
                                            {results.map((result) => (
                                                <div
                                                    key={result.uniq_id}
                                                    onClick={() =>
                                                        handleProductClick(
                                                            result.uniq_id
                                                        )
                                                    }
                                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-none"
                                                >
                                                    <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded overflow-hidden">
                                                        <img
                                                            src={result.image1}
                                                            alt={
                                                                result.product_name
                                                            }
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-gray-900 truncate">
                                                            {
                                                                result.product_name
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Links Section */}
                        <div className="hidden md:block">
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/"
                                    className="text-white hover:bg-white hover:text-black rounded-lg p-2"
                                >
                                    <House />
                                </Link>
                                <Link
                                    href="/liked-products"
                                    className="text-white hover:bg-white hover:text-black rounded-lg p-2"
                                >
                                    <Heart />
                                </Link>
                                <Link
                                    href="/cart"
                                    className="text-white hover:bg-white hover:text-black rounded-lg p-2"
                                    onClick={(e) => {
                                        if (!handleCartClick()) {
                                            e.preventDefault();
                                        }
                                    }}
                                >
                                    <ShoppingBag />
                                </Link>
                                <div className="text-white hover:bg-white hover:text-black rounded-lg p-2">
                                    <div
                                        id="basic-button"
                                        aria-controls={
                                            open ? "basic-menu" : undefined
                                        }
                                        aria-haspopup="true"
                                        aria-expanded={
                                            open ? "true" : undefined
                                        }
                                        onClick={handleClick}
                                        className="cursor-pointer"
                                    >
                                        <CircleUserRound />
                                    </div>
                                    <Menu
                                        id="basic-menu"
                                        anchorEl={anchorEl}
                                        open={open}
                                        onClose={handleClose}
                                        MenuListProps={{
                                            "aria-labelledby": "basic-button",
                                        }}
                                    >
                                        {menuItems}
                                    </Menu>
                                </div>
                            </div>
                        </div>
                        <ToastContainer />
                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center">
                            <button
                                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                onClick={toggleNavbar}
                                aria-expanded={isClick}
                                aria-controls="mobile-menu"
                            >
                                {isClick ? (
                                    <svg
                                        className="h-6 w-6"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        className="h-6 w-6"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 6h16M4 12h16m-7 6h7"
                                        />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isClick && (
                    <div id="mobile-menu" className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col items-center text-center sm:mx-auto">
                            <Link
                                href="/"
                                className="text-white hover:bg-white hover:text-black rounded-lg p-2 w-full text-center flex gap-2"
                                onClick={() => setIsClick(false)}
                            >
                                <House size={25} />{" "}
                                <span className="text-xl font-semibold">
                                    Home
                                </span>
                            </Link>
                            <Link
                                href="/liked-products"
                                className="text-white flex gap-2 hover:bg-white hover:text-black rounded-lg p-2 w-full text-center"
                                onClick={() => setIsClick(false)}
                            >
                                <Heart size={25} />
                                <span className="text-xl font-semibold">
                                    Favorite
                                </span>
                            </Link>
                            <Link
                                href="/cart"
                                className="text-white flex gap-2 hover:bg-white hover:text-black rounded-lg p-2 w-full text-center"
                                onClick={(e) => {
                                    if (!handleCartClick()) {
                                        e.preventDefault();
                                    }
                                    setIsClick(false);
                                }}
                            >
                                <ShoppingBag size={25} />
                                <span className="text-xl font-semibold">
                                    Cart
                                </span>
                            </Link>
                            {user ? (
                                <>
                                    <Link
                                        href="/profile"
                                        className="text-white flex gap-2 hover:bg-white hover:text-black rounded-lg p-2 w-full text-center"
                                        onClick={() => setIsClick(false)}
                                    >
                                        <CircleUserRound size={25} />
                                        <span className="text-xl font-semibold">
                                            Profile
                                        </span>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            logoutAction();
                                            setIsClick(false);
                                        }}
                                        className="text-white flex gap-2 hover:bg-white hover:text-black rounded-lg p-2 w-full text-center"
                                    >
                                        <span className="text-xl font-semibold">
                                            Logout
                                        </span>
                                    </button>
                                </>
                            ) : (
                                [
                                    <Link
                                        key="login"
                                        href="/login"
                                        className="text-white flex gap-2 hover:bg-white hover:text-black rounded-lg p-2 w-full text-center"
                                        onClick={() => setIsClick(false)}
                                    >
                                        <CircleUserRound size={25} />
                                        <span className="text-xl font-semibold">
                                            Login
                                        </span>
                                    </Link>,
                                    <Link
                                        key="signup"
                                        href="/signup"
                                        className="text-white flex gap-2 hover:bg-white hover:text-black rounded-lg p-2 w-full text-center"
                                        onClick={() => setIsClick(false)}
                                    >
                                        <span className="text-xl font-semibold">
                                            Sign Up
                                        </span>
                                    </Link>,
                                ]
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
};

export default Navbar;

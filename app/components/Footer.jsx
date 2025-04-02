import React from "react";
import { Facebook, Instagram, Github, Youtube, Twitter } from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-[var(--second-color)] shadow-lg text-gray-400 py-6 text-center">
            <div className="flex justify-center space-x-6 text-sm mb-4">
                <a href="/" className="hover:text-white">
                    Home
                </a>
                <a href="/productListing/1" className="hover:text-white">
                    Men
                </a>
                <a href="/productListing/2" className="hover:text-white">
                    Women
                </a>
                <a href="/productListing/3" className="hover:text-white">
                    Kids
                </a>

                <a href="/" className="hover:text-white">
                    Many More
                </a>
            </div>

            <div className="flex justify-center space-x-6 text-xl mb-4">
                <a href="#" className="hover:text-white">
                    <Facebook />
                </a>
                <a href="#" className="hover:text-white">
                    <Instagram />
                </a>
                <a href="#" className="hover:text-white">
                    <Twitter />
                </a>
                <a href="#" className="hover:text-white">
                    <Github />
                </a>
                <a href="#" className="hover:text-white">
                    <Youtube />
                </a>
            </div>

            <p className="text-sm">© 2025 Shopifly. All rights reserved.</p>
        </footer>
    );
};

export default Footer;

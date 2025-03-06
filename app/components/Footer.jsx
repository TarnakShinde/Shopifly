import React from "react";
import { Facebook, Instagram, Github, Youtube } from "lucide-react";
import { Twitter } from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-400 py-6 text-center">
            <div className="flex justify-center space-x-6 text-sm mb-4">
                <a href="#" className="hover:text-white">
                    Home
                </a>
                <a href="#" className="hover:text-white">
                    Shop
                </a>
                <a href="#" className="hover:text-white">
                    About Us
                </a>
                <a href="#" className="hover:text-white">
                    Contact
                </a>
                <a href="#" className="hover:text-white">
                    Privacy Policy
                </a>
                <a href="#" className="hover:text-white">
                    Terms of Service
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

            <p className="text-sm">
                © 2024 Your Company, Inc. All rights reserved.
            </p>
        </footer>
    );
};

export default Footer;

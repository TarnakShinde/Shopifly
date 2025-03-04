import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { CartProvider } from "./context/CartContext";

const poppins = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], // Ensure weight is an array of strings
});

export const metadata = {
    title: "Shopifly",
    description: "A simple e-commerce app",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${poppins.variable} antialiased`}>
                <CartProvider>
                    <Navbar />
                    {children}
                </CartProvider>
            </body>
        </html>
    );
}

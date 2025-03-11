import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { headers } from "next/headers"; // ✅ Use headers() instead of usePathname()

const poppins = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
    title: "Shopifly",
    description: "A simple e-commerce app",
};

export default function RootLayout({ children }) {
    const pathname = headers().get("x-pathname") || ""; // ✅ Get the current path from headers
    const isDashboard = pathname.startsWith("/dashboard"); // ✅ Check if it's a dashboard page

    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${poppins.variable} antialiased`}>
                <AuthProvider>
                    <CartProvider>
                        {/* ✅ Show Navbar & Footer only if NOT in /dashboard */}
                        {!isDashboard && <Navbar />}
                        {children}
                        {!isDashboard && <Footer />}
                    </CartProvider>
                </AuthProvider>
            </body>
        </html>
    );
}

import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { headers } from "next/headers";

const poppins = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
    title: "Shopifly",
    description: "A simple e-commerce app",
};

export default async function RootLayout({ children }) {
    // Get the current path from the "x-url" header
    const headersList = headers();
    const url = new URL("http://localhost:3000/");
    const pathname = url.pathname;
    const isDashboard = pathname.startsWith("/dashboard");

    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${poppins.variable} antialiased`}>
                <AuthProvider>
                    <CartProvider>
                        {!isDashboard && <Navbar />}
                        {children}
                        {!isDashboard && <Footer />}
                    </CartProvider>
                </AuthProvider>
            </body>
        </html>
    );
}

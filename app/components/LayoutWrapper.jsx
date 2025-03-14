import { Poppins } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import LayoutWrapper from "./components/LayoutWrapper"; // ✅ Import the new wrapper

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
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${poppins.variable} antialiased`}>
                <AuthProvider>
                    <CartProvider>
                        <LayoutWrapper> {children}</LayoutWrapper>
                    </CartProvider>
                </AuthProvider>
            </body>
        </html>
    );
}

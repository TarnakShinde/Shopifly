/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "http",
                hostname: "img5a.flixcart.com",
                pathname: "**",
            },
            {
                protocol: "http",
                hostname: "img6a.flixcart.com",
                pathname: "**",
            },
            {
                protocol: "https",
                hostname: "rukminim2.flixcart.com",
                pathname: "**",
            },
        ],
    },
};

export default nextConfig;

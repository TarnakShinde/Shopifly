"use client";
import { useEffect, useState } from "react";
import HeroSlider from "./components/HeroSlider";
import CategorySlider from "./components/CategorySlider";
import ChatBot from "./components/ChatBot";
import ProductSlider from "./components/ProductSlider";
import { getUsersForHero } from "./api/products/route";
const Home = () => {
    const [heroData, setHeroData] = useState([]);
    useEffect(() => {
        async function products() {
            const products = await getUsersForHero();
            setHeroData(products);
        }
        products();
    }, []);

    return (
        <div>
            <HeroSlider products={heroData} />
            <CategorySlider />
            <ChatBot />
            <ProductSlider id={0} />
            {/* <SignUp /> */}
            {/* <RegistrationPage /> */}
        </div>
    );
};
export default Home;

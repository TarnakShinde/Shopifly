"use client";
import { useEffect, useState } from "react";
import HeroSlider from "./components/HeroSlider";
import CategorySlider from "./components/CategorySlider";
import ProductSlider from "./components/ProductSlider";
import { getUsersForHero } from "../lib/product";

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
        <div className="scroll-smooth">
            <HeroSlider products={heroData} />
            <CategorySlider />
            <ProductSlider id={0} />
        </div>
    );
};
export default Home;

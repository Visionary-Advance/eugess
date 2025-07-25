'use client'

import FoodSection from "@/Components/FoodSection";
import PopularSection from "@/Components/PopularSection";
import {
  ArrowLeft,
  ArrowRight,
  Star,
  
  Phone,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import {
  MapPin,
  Clock,
} from "lucide-react";
import Link from "next/link";
import NeighborhoodSection from "@/Components/NeighborhoodSection";
import Blogs from "@/Components/Blogs";
import RandomRestaurantsSection from "@/Components/RandomRestaurantSection";
import BlogHomeSection from "@/Components/BlogHomeSection";
import CommunitySignup from "@/Components/CommunitySignUp";



const Index = () => {
  

   const [currentNeighborhoodIndex, setCurrentNeighborhoodIndex] = useState(0);
  const [email, setEmail] = useState("");

  

  const restaurants = [
    {
      id: 1,
      name: "Isayaki",
      cuisine: "Japanese",
      rating: 4.8,
      priceLevel: "$$",
      address: "1646 E 19th Ave, Eugene, OR 97403",
      phone: "555-555-5555",
      isOpen: true,
      image:
        "https://api.builder.io/api/v1/image/assets/TEMP/placeholder-restaurant?width=400",
    },
    {
      id: 2,
      name: "Sushi Station",
      cuisine: "Japanese",
      rating: 4.8,
      priceLevel: "$$",
      address: "1646 E 19th Ave, Eugene, OR 97403",
      phone: "555-555-5555",
      isOpen: true,
      image:
        "https://api.builder.io/api/v1/image/assets/TEMP/placeholder-restaurant?width=400",
    },
    {
      id: 3,
      name: "Bistro Café",
      cuisine: "French",
      rating: 4.8,
      priceLevel: "$$",
      address: "1646 E 19th Ave, Eugene, OR 97403",
      phone: "555-555-5555",
      isOpen: false,
      image:
        "https://api.builder.io/api/v1/image/assets/TEMP/placeholder-restaurant?width=400",
    },
  ];

 

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    console.log("Email submitted:", email);
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      

      {/* Hero Section */}
      <section className="relative h-[650px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/b4be72286317f104b41aaba2870d655292d2bae7?width=4000"
            alt="Eugene City Overview"
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/55"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="font-serif text-white text-4xl md:text-5xl lg:text-[64px] font-bold leading-tight max-w-[797px] mb-8">
            Discover your next favorite spot in Eugene
          </h1>
          <p className="font-serif text-white text-lg md:text-xl lg:text-[25px] max-w-[723px] leading-relaxed">
            Local favorites, hidden gems, and everything you need to explore
            Eugene's food scene
          </p>
        </div>
      </section>

     <FoodSection />

      <PopularSection />
       <div className=" bg-[#F5F5F5]">
      

      {/* Browse By Neighborhood Section */}
    <NeighborhoodSection />

    <RandomRestaurantsSection />

<CommunitySignup />

    <BlogHomeSection />
    </div>

    </div>

  );
};

export default Index;

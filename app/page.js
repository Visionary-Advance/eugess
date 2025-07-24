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

      {/* Community Signup Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-[#8A9A5B] rounded-[30px] lg:p-16 pt-56 px-5 pb-3 overflow-visible ">
            {/* Background Image */}
            <div className="absolute left-1/2 -translate-x-1/2 lg:left-8 lg:translate-x-0 -top-20 block">
  <img
    src="https://api.builder.io/api/v1/image/assets/TEMP/368f0253ba9aa3f28d3f09cb749966ca7d4c5b59?width=922"
    alt="Community"
    className="w-[300px] h-[300px] scale-150 lg:scale-100 xl:w-[461px] xl:h-[461px] object-contain"
  />
</div>

            {/* Content */}
            <div className="lg:ml-[400px] xl:ml-[500px] max-w-[500px]">
              <h2 className="font-serif text-[40px]  font-semibold text-white lg:text-left">
                Join Our Community
              </h2>
              <p className="font-serif text-[20px] font-semibold text-white mb-8 leading-relaxed">
                Get updates about updates, community votes and
                events
              </p>

              {/* Email Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full h-[55px] rounded-[20px] border border-black bg-[#F5F5F5] px-6 font-serif text-[20px] text-black placeholder-[#858585] focus:outline-none focus:ring-2 focus:ring-white"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-[40px] cursor-pointer rounded-[20px] bg-[#FFA500] text-white font-serif text-[20px] hover:bg-[#FF9500] transition-colors"
                >
                  Join Now
                </button>
              </form>

              <p className="font-serif text-[12px] text-white text-center mt-4 leading-relaxed">
                *We will not sell your information, we will only send you
                updates or community related events
              </p>
            </div>
          </div>
        </div>
      </section>

      <Blogs />
    </div>

    <BlogHomeSection />
    </div>

  );
};

export default Index;

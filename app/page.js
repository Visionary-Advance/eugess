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

      {/* Browse All Restaurants Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 lg:mb-16">
          <h1 className="font-serif text-[40px] font-semibold text-black text-left mb-4 lg:mb-0">
            Browse All Restaurants
          </h1>
          <button className="block border border-primary active:scale-95 text-[#355E3B] hover:bg-[#355E3B] cursor-pointer font-serif text-[24px] md:text-[30px] px-6 py-2 rounded-[20px] hover:bg-primary hover:text-white transition-colors">
              Browse All
            </button>
        </div>


          {/* Restaurant Cards */}
          <div className="space-y-6">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-[#F5F5F5] border border-black rounded-[30px] overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex">
                  {/* Restaurant Image */}
                  <div className="w-26  lg:w-[200px] lg:h-[200px] bg-white border-r border-black rounded-l-[25px] flex-shrink-0">
                    <div className="w-full h-full bg-gray-200 rounded-l-[25px]"></div>
                  </div>

                  {/* Restaurant Info */}
                  <div className="flex-1 px-3 pt-3 relative">
                    {/* Restaurant Name & Status */}
                    <div className="flex items-start mb-2">
                      <h3 className="font-serif text-[20px] lg:text-[30px] font-semibold text-black">
                        {restaurant.name}
                      </h3>
                       <span className="mx-2 text-black text-[20px] lg:text-[30px]">•</span>
                      <div
                        className={`px-3 py-1 mt-1 rounded-[20px] text-[13px] lg:text-[18px] font-serif ${
                          restaurant.isOpen
                            ? "bg-[#276B00] text-[#0CAE00]"
                            : "bg-[#770C0C] text-[#EA0000]"
                        }`}
                      >
                        {restaurant.isOpen ? "Open" : "Closed"}
                      </div>
                    </div>

                    {/* Cuisine, Rating, Price */}
                    <div className="flex items-center gap-2 lg:mb-6">
                      <span className="font-serif text-[14px] lg:text-[18px] font-semibold text-[#868686]">
                        {restaurant.cuisine}
                      </span>
                      <span className="text-[#868686] text-[15px] lg:text-[20px]">•</span>
                      <div className="flex items-center gap-1">
                        <Star
                          className="w-[18px] h-[18px] text-[#FFDB3A] fill-[#FFDB3A]"
                          strokeWidth={2}
                        />
                        <span className="font-serif text-[14px] lg:text-[18px] font-semibold text-[#868686]">
                          {restaurant.rating}
                        </span>
                      </div>
                      <span className="text-[#868686] text-[15px]">•</span>
                      <span className="font-serif text-[14px] lg:text-[18px] text-[#868686]">
                        {restaurant.priceLevel}
                      </span>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Phone
                          className="w-[22px] h-[22px] lg:w-[25px] lg:h-[25px] text-[#868686]"
                          strokeWidth={2}
                        />
                        <Link href={`tel: ${restaurant.phone}`} >
                        <span className="font-sans underline text-[14px] lg:text-[22px] text-[#868686]">
                          {restaurant.phone}
                        </span>
                        </Link>
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <MapPin
                          className="w-[22px] h-[22px] lg:w-[25px] lg:h-[25px] text-[#868686]"
                          strokeWidth={2}
                        />
                        <span className="font-sans text-[14px] lg:text-[22px] text-[#868686]">
                          {restaurant.address}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="absolute right-3 lg:right-6 top-1/2 transform -translate-y-1/2">
                      <ChevronRight
                        className="w-[45px] h-[45px] lg:w-[90px] lg:h-[90px] text-black"
                        strokeWidth={2}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
    </div>
  );
};

export default Index;

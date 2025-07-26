'use client';

import { useState, useEffect } from "react";
import { Star, Phone, MapPin, ChevronRight } from "lucide-react";

export default function RandomRestaurantsSection() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRandomRestaurants() {
      try {
        const response = await fetch('/api/businesses/random');
        const data = await response.json();
        setRestaurants(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching random restaurants:', error);
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRandomRestaurants();
  }, []);

  // Helper function to format cuisine type
  const formatCuisineType = (cuisineType) => {
    if (!cuisineType) return 'Restaurant';
    return cuisineType
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // Helper function to format price level
  const formatPriceLevel = (priceLevel) => {
    if (!priceLevel) return '$';
    return '$'.repeat(priceLevel);
  };

  // Helper function to format address
  const formatAddress = (restaurant) => {
    const parts = [];
    if (restaurant.street_address) parts.push(restaurant.street_address);
    if (restaurant.city) parts.push(restaurant.city);
    if (restaurant.state) parts.push(restaurant.state);
    if (restaurant.zip_code) parts.push(restaurant.zip_code);
    return parts.join(', ');
  };

  // Mock function for open/closed status (you can enhance this with business hours later)
  const getOpenStatus = (restaurant) => {
    // For now, randomly assign open/closed status
    // You can later integrate with business hours logic
    const isOpen = Math.random() > 0.3; // 70% chance of being open
    return isOpen;
  };

  // Image component with fallback
  const RestaurantImage = ({ restaurant }) => {
    const [imageError, setImageError] = useState(false);
    
    const handleImageError = () => {
      setImageError(true);
    };

    if (imageError || !restaurant.image_url) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-[#355E3B] to-[#8A9A5B] rounded-l-[25px] flex items-center justify-center">
          <div className="text-center text-white p-2">
            <div className="text-2xl mb-1">🍽️</div>
            <p className="text-xs font-serif line-clamp-2">{restaurant.name}</p>
          </div>
        </div>
      );
    }

    return (
      <img
        src={restaurant.image_url}
        alt={restaurant.name}
        className="w-full h-full object-cover rounded-l-[25px]"
        onError={handleImageError}
        loading="lazy"
      />
    );
  };

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 lg:mb-16">
            <h1 className="font-serif text-[40px] font-semibold text-black text-left mb-4 lg:mb-0">
              Browse All Restaurants
            </h1>
            <a href="/directory/all">
              <button className="block border border-primary active:scale-95 text-[#355E3B] hover:bg-[#355E3B] cursor-pointer font-serif text-[24px] md:text-[30px] px-6 py-2 rounded-[20px] hover:bg-primary hover:text-white transition-colors">
                Browse All
              </button>
            </a>
          </div>

          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#F5F5F5] border border-black rounded-[30px] overflow-hidden h-[200px] animate-pulse">
                <div className="flex h-full">
                  <div className="w-26 lg:w-[200px] bg-gray-200 border-r border-black rounded-l-[25px] flex-shrink-0"></div>
                  <div className="flex-1 p-6">
                    <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (restaurants.length === 0) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 lg:mb-16">
            <h1 className="font-serif text-[40px] font-semibold text-black text-left mb-4 lg:mb-0">
              Browse All Restaurants
            </h1>
            <a href="/directory/all">
              <button className="block border border-primary active:scale-95 text-[#355E3B] hover:bg-[#355E3B] cursor-pointer font-serif text-[24px] md:text-[30px] px-6 py-2 rounded-[20px] hover:bg-primary hover:text-white transition-colors">
                Browse All
              </button>
            </a>
          </div>
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No restaurants found. Check back soon!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 lg:mb-16">
          <h1 className="font-serif text-[40px] font-semibold text-black text-left mb-4 lg:mb-0">
            Browse All Restaurants
          </h1>
          <a href="/directory/all">
            <button className="block border border-primary active:scale-95 text-[#355E3B] hover:bg-[#355E3B] cursor-pointer font-serif text-[24px] md:text-[30px] px-6 py-2 rounded-[20px] hover:bg-primary hover:text-white transition-colors">
              Browse All
            </button>
          </a>
        </div>

        {/* Restaurant Cards */}
        <div className="gap-y-6">
          {restaurants.map((restaurant) => {
            const isOpen = getOpenStatus(restaurant);
            const cuisine = formatCuisineType(restaurant.cuisine_type);
            const priceLevel = formatPriceLevel(restaurant.price_level);
            const address = formatAddress(restaurant);

            return (
              <a key={restaurant.id} href={`/business/${restaurant.slug}`}>
                <div className="bg-[#F5F5F5] border my-6 border-black rounded-[30px] overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex">
                    {/* Restaurant Image */}
                    <div className="w-26 lg:w-[200px] lg:h-[200px] bg-white border-r border-black rounded-l-[25px] flex-shrink-0">
                      <RestaurantImage restaurant={restaurant} />
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
                            isOpen
                              ? "bg-[#276B00] text-[#0CAE00]"
                              : "bg-[#770C0C] text-[#EA0000]"
                          }`}
                        >
                          {isOpen ? "Open" : "Closed"}
                        </div>
                      </div>

                      {/* Cuisine, Rating, Price */}
                      <div className="flex items-center gap-2 lg:mb-6">
                        <span className="font-serif text-[14px] lg:text-[18px] font-semibold text-[#868686]">
                          {cuisine}
                        </span>
                        <span className="text-[#868686] text-[15px] lg:text-[20px]">•</span>
                        <div className="flex items-center gap-1">
                          <Star
                            className="w-[18px] h-[18px] text-[#FFDB3A] fill-[#FFDB3A]"
                            strokeWidth={2}
                          />
                          <span className="font-serif text-[14px] lg:text-[18px] font-semibold text-[#868686]">
                            4.8
                          </span>
                        </div>
                        <span className="text-[#868686] text-[15px]">•</span>
                        <span className="font-serif text-[14px] lg:text-[18px] text-[#868686]">
                          {priceLevel}
                        </span>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2">
                        {restaurant.phone && (
                          <div className="flex items-center gap-3">
                            <Phone
                              className="w-[22px] h-[22px] lg:w-[25px] lg:h-[25px] text-[#868686]"
                              strokeWidth={2}
                            />
                            <span className="font-sans underline text-[14px] lg:text-[22px] text-[#868686]">
                              {restaurant.phone}
                            </span>
                          </div>
                        )}
                        {address && (
                          <div className="flex items-center gap-3 mb-2">
                            <MapPin
                              className="w-[22px] h-[22px] lg:w-[25px] lg:h-[25px] text-[#868686]"
                              strokeWidth={2}
                            />
                            <span className="font-sans text-[14px] lg:text-[22px] text-[#868686]">
                              {address}
                            </span>
                          </div>
                        )}
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
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
'use client'

import {
  MapPin,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function PopularSection() {
  const [popularSpots, setPopularSpots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPopularSpots() {
      try {
        const response = await fetch('/api/businesses/popular');
        const data = await response.json();
        // Ensure data is an array
        setPopularSpots(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching popular spots:', error);
        setPopularSpots([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    }

    fetchPopularSpots();
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-serif text-[40px] font-semibold text-black mb-16 text-left">
            Popular Spots
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="bg-gray-200 rounded-[40px] h-[600px] animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-5 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <h2 className="font-serif text-[40px] font-semibold text-black mb-16 text-left">
          Popular Spots
        </h2>

        {/* Spots Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {popularSpots.map((spot) => (
            <div
              key={spot.id}
              className="bg-white rounded-[40px] max-w-2xl mx-auto overflow-hidden shadow-lg h-full flex flex-col"
            >
              {/* Restaurant Image */}
              <div className="relative h-[300px] overflow-hidden flex-shrink-0">
                <img
                  src={spot.image || "https://via.placeholder.com/400x300?text=No+Image"}
                  alt={spot.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Restaurant Info */}
              <div className="p-6 md:p-8 rounded-b-[40px] bg-[#F5F5F5] border border-black/30 flex-1 flex flex-col">
                {/* Restaurant Name */}
                <h3 className="font-serif text-[36px] font-semibold text-black text-center mb-4">
                  {spot.name}
                </h3>

                {/* Description */}
                <p className="font-sans text-[16px] md:text-[20px] text-black mb-8 leading-relaxed flex-1">
                  {spot.description || spot.short_description || "No description available"}
                </p>

                {/* Bottom Section - Fixed at bottom */}
                <div className="mt-auto">
                  {/* Divider */}
                  <div className="w-full h-px bg-black/30 mb-4"></div>

                  {/* Location and Hours */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="flex items-center gap-1 flex-1">
                      <MapPin
                        className="w-[25px] h-[25px] text-black flex-shrink-0"
                        strokeWidth={2}
                      />
                      <span className="font-sans text-[14px] text-black mt-1">
                        {`${spot.street_address}, ${spot.city}, ${spot.state} ${spot.zip_code}`}
                      </span>
                    </div>

                    {/* Vertical divider */}
                    <div className="w-px h-8 bg-black/30"></div>

                    <div className="flex items-center gap-1 flex-1">
                      <Clock
                        className="w-[25px] h-[25px] text-black flex-shrink-0"
                        strokeWidth={2}
                      />
                      <span className="font-sans text-[14px] text-black mt-1">
                        {spot.hours || "Hours not available"}
                      </span>
                    </div>
                  </div>

                  {/* View More Button */}
                  <button className="bg-[#355E3B] text-white font-serif text-[20px]  px-6  py-2 rounded-[14px] hover:bg-[#2a4a2f] transition-colors">
                    View More
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
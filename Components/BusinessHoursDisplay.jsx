'use client'

import {
  MapPin,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useCurrentDayHours, getHourDisplay } from '@/Components/BusinessHoursDisplay';

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

  // Image component with fallback
  const BusinessImage = ({ spot }) => {
    const [imageError, setImageError] = useState(false);
    
    const handleImageError = () => {
      setImageError(true);
    };

    if (imageError || !spot.image_url) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-[#355E3B] to-[#8A9A5B] flex items-center justify-center">
          <div className="text-center text-white p-4">
            <div className="text-4xl mb-2">🍽️</div>
            <p className="text-sm font-serif">{spot.name}</p>
          </div>
        </div>
      );
    }

    return (
      <img
        src={spot.image_url}
        alt={spot.name}
        className="w-full h-full object-cover"
        onError={handleImageError}
        loading="lazy"
      />
    );
  };

  // Component to show current day hours for each business
  const BusinessHours = ({ businessId }) => {
    const { currentDayHours, loading: hoursLoading } = useCurrentDayHours(businessId);

    if (hoursLoading) {
      return (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      );
    }

    return (
      <span className="font-sans text-[14px] text-black mt-1">
        {getHourDisplay(currentDayHours)}
      </span>
    );
  };

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
              className="bg-white rounded-[40px] overflow-hidden shadow-lg h-full flex flex-col w-full"
            >
              {/* Restaurant Image */}
              <div className="relative h-[300px] overflow-hidden flex-shrink-0">
                <BusinessImage spot={spot} />
              </div>

              {/* Restaurant Info */}
              <div className="p-6 md:p-8 rounded-b-[40px] bg-[#F5F5F5] border border-black/30 flex-1 flex flex-col">
                {/* Restaurant Name */}
                <h3 className="font-serif text-[36px] font-semibold text-black text-center mb-4 min-h-[44px] flex items-center justify-center">
                  {spot.name}
                </h3>

                {/* Description */}
                <p className="font-sans text-[16px] md:text-[20px] text-black mb-8 leading-relaxed flex-1 min-h-[120px]">
                  {spot.short_description || "No description available"}
                </p>

                {/* Bottom Section - Fixed at bottom */}
                <div className="mt-auto">
                  {/* Divider */}
                  <div className="w-full h-px bg-black/30 mb-4"></div>

                  {/* Location and Hours */}
                  <div className="flex items-center gap-4 mb-8 min-h-[32px]">
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
                      <BusinessHours businessId={spot.id} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
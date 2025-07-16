import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

export default function NeighborhoodSection() {
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentNeighborhoodIndex, setCurrentNeighborhoodIndex] = useState(0);

  useEffect(() => {
    async function fetchNeighborhoods() {
      try {
        const response = await fetch('/api/neighborhoods');
        const data = await response.json();
        setNeighborhoods(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching neighborhoods:', error);
        setNeighborhoods([]);
      } finally {
        setLoading(false);
      }
    }

    fetchNeighborhoods();
  }, []);

  const nextNeighborhood = () => {
    setCurrentNeighborhoodIndex((prev) =>
      prev >= neighborhoods.length - 1 ? 0 : prev + 1
    );
  };

  const prevNeighborhood = () => {
    setCurrentNeighborhoodIndex((prev) =>
      prev <= 0 ? neighborhoods.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="font-serif text-[40px] font-semibold text-black">
              Browse By Neighborhood
            </h2>
            <button className="hidden lg:block border border-primary text-[#355E3B] font-serif text-[24px] md:text-[30px] px-6 py-2 rounded-[20px] opacity-50">
              Browse All
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 px-12 md:px-16">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-full max-w-[325px] h-[375px] bg-gray-200 rounded-[40px] animate-pulse mb-4"></div>
                <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (neighborhoods.length === 0) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="font-serif text-[40px] font-semibold text-black">
              Browse By Neighborhood
            </h2>
          </div>
          <div className="text-center text-gray-500">
            No neighborhoods available at the moment.
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
            Browse All Neighborhoods
          </h1>
          <button className="block border border-primary active:scale-95 text-[#355E3B] hover:bg-[#355E3B] cursor-pointer font-serif text-[24px] md:text-[30px] px-6 py-2 rounded-[20px] hover:bg-primary hover:text-white transition-colors">
              Browse All
            </button>
        </div>

        {/* Neighborhood Cards with Navigation */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={prevNeighborhood}
            className="absolute left-0 md:left-[40px] top-1/2 transform -translate-y-1/2 z-10 w-[50px] h-[50px] rounded-full bg-[#355E3B] flex items-center justify-center hover:bg-[#355E3B]/80 transition-colors"
            aria-label="Previous neighborhoods"
          >
            <ArrowLeft
              className="w-[24px] h-[24px] text-white"
              strokeWidth={2}
            />
          </button>

          {/* Right Arrow */}
          <button
            onClick={nextNeighborhood}
            className="absolute right-0 md:right-[40px] top-1/2 transform -translate-y-1/2 z-10 w-[50px] h-[50px] rounded-full bg-[#355E3B] flex items-center justify-center hover:bg-[#355E3B]/80 cursor-pointer transition-colors"
            aria-label="Next neighborhoods"
          >
            <ArrowRight
              className="w-[24px] h-[24px] text-white"
              strokeWidth={2}
            />
          </button>

          {/* Neighborhood Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 px-12 md:px-16">
            {neighborhoods
              .slice(currentNeighborhoodIndex, currentNeighborhoodIndex + 4)
              .concat(neighborhoods.length > 0 && currentNeighborhoodIndex + 4 > neighborhoods.length 
                ? neighborhoods.slice(0, (currentNeighborhoodIndex + 4) - neighborhoods.length)
                : []
              )
              .map((neighborhood) => (
                <div
                  key={neighborhood.id}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="relative w-full max-w-[325px] h-[375px] rounded-[40px] overflow-hidden mb-4 group-hover:shadow-lg transition-shadow">
                    <img
                      src={neighborhood.image || "https://via.placeholder.com/325x375?text=No+Image"}
                      alt={neighborhood.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-serif text-[30px] font-semibold text-black text-center h-[80px] flex items-center justify-center">
                    {neighborhood.name}
                  </h3>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
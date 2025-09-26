import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

export default function NeighborhoodSection() {
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentNeighborhoodIndex, setCurrentNeighborhoodIndex] = useState(0);

  useEffect(() => {
    async function fetchNeighborhoods() {
      try {
        console.log('Fetching neighborhoods...');
        const response = await fetch('/api/neighborhoods');
        console.log('Neighborhoods response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Neighborhoods data received:', data);
        
        const neighborhoodsData = Array.isArray(data) ? data : [];
        console.log('Processed neighborhoods data:', neighborhoodsData);
        setNeighborhoods(neighborhoodsData);
      } catch (error) {
        console.error('Error fetching neighborhoods:', error);
        setNeighborhoods([]);
      } finally {
        setLoading(false);
      }
    }

    fetchNeighborhoods();
  }, []);

  // Simplified image function - only use database images or gradient fallback
  const getNeighborhoodImage = (neighborhood) => {
    console.log('Getting image for neighborhood:', neighborhood);
    console.log('Full neighborhood object:', JSON.stringify(neighborhood, null, 2));
    
    // Check for image_url from database first
    if (neighborhood.image_url && neighborhood.image_url.trim() !== '') {
      console.log('Using database image_url:', neighborhood.image_url);
      return neighborhood.image_url;
    }
    
    // Check for image field from database
    if (neighborhood.image && neighborhood.image.trim() !== '') {
      console.log('Using database image field:', neighborhood.image);
      return neighborhood.image;
    }

    // If no database image, return gradient placeholder class
    console.log('No database image found, using gradient placeholder for:', neighborhood.name);
    return generatePlaceholderImage(neighborhood.name);
  };

  // Generate a nice gradient placeholder with the neighborhood name
  const generatePlaceholderImage = (name) => {
    const colors = [
      'from-emerald-400 to-emerald-600',
      'from-blue-400 to-blue-600', 
      'from-purple-400 to-purple-600',
      'from-green-400 to-green-600',
      'from-teal-400 to-teal-600',
      'from-indigo-400 to-indigo-600',
      'from-slate-400 to-slate-600',
      'from-amber-400 to-amber-600',
      'from-rose-400 to-rose-600',
      'from-cyan-400 to-cyan-600'
    ];
    
    // Use the name to consistently pick a color
    const colorIndex = name ? name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length : 0;
    return colors[colorIndex];
  };

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

  const handleNeighborhoodClick = (neighborhood) => {
    console.log('Navigating to neighborhood:', neighborhood.slug);
    // Navigate to neighborhoods page with the selected neighborhood slug
    window.location.href = `/neighborhoods?selected=${neighborhood.slug}`;
  };

  // Enhanced Image component with better error handling
  const NeighborhoodImage = ({ neighborhood }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const imageUrl = getNeighborhoodImage(neighborhood);
    
    const handleImageError = () => {
      console.log('Image failed to load:', imageUrl);
      setImageError(true);
      setImageLoading(false);
    };

    const handleImageLoad = () => {
      console.log('Image loaded successfully:', imageUrl);
      setImageLoading(false);
    };

    // Check if imageUrl is a gradient class (starts with 'from-')
    const isGradientPlaceholder = typeof imageUrl === 'string' && imageUrl.includes('from-');
    
    // If it's a gradient class OR if image failed to load, show gradient placeholder
    if (isGradientPlaceholder || imageError) {
      const gradientClass = isGradientPlaceholder ? imageUrl : generatePlaceholderImage(neighborhood.name || 'Neighborhood');
      
      return (
        <div className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
          <div className="text-center text-white p-6">
            <div className="text-4xl mb-3">🏘️</div>
            <h3 className="text-xl font-serif font-bold">{neighborhood.name || 'Neighborhood'}</h3>
            <p className="text-sm opacity-90 mt-2">Eugene Neighborhood</p>
          </div>
        </div>
      );
    }

    // If we have a real URL but no error, render the image
    if (imageUrl && !isGradientPlaceholder) {
      return (
        <div className="w-full h-full relative">
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-gray-400">Loading...</div>
            </div>
          )}
          <img
            src={imageUrl}
            alt={`${neighborhood.name || 'Neighborhood'} neighborhood in Eugene, Oregon`}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
          />
        </div>
      );
    }

    // Fallback gradient if no URL at all
    const fallbackGradient = generatePlaceholderImage(neighborhood.name || 'Neighborhood');
    return (
      <div className={`w-full h-full bg-gradient-to-br ${fallbackGradient} flex items-center justify-center`}>
        <div className="text-center text-white p-6">
          <div className="text-4xl mb-3">🏘️</div>
          <h3 className="text-xl font-serif font-bold">{neighborhood.name || 'Neighborhood'}</h3>
          <p className="text-sm opacity-90 mt-2">Eugene Neighborhood</p>
        </div>
      </div>
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
            Browse By Neighborhood
          </h1>
          <a href="/neighborhoods">
            <button className="block border border-primary active:scale-95 text-[#355E3B] hover:bg-[#355E3B] cursor-pointer font-serif text-[24px] md:text-[30px] px-6 py-2 rounded-[20px] hover:bg-primary hover:text-white transition-colors">
              Browse All
            </button>
          </a>
        </div>

        {/* Neighborhood Cards with Navigation */}
        <div className="relative">
          {/* Left Arrow */}
          {neighborhoods.length > 4 && (
            <button
              onClick={prevNeighborhood}
              className="absolute left-0 md:left-[40px] top-1/2 transform -translate-y-1/2 z-10 w-[50px] h-[50px] rounded-full bg-[#355E3B] flex items-center justify-center hover:bg-[#355E3B]/80 transition-colors shadow-lg"
              aria-label="Previous neighborhoods"
            >
              <ArrowLeft
                className="w-[24px] h-[24px] text-white"
                strokeWidth={2}
              />
            </button>
          )}

          {/* Right Arrow */}
          {neighborhoods.length > 4 && (
            <button
              onClick={nextNeighborhood}
              className="absolute right-0 md:right-[40px] top-1/2 transform -translate-y-1/2 z-10 w-[50px] h-[50px] rounded-full bg-[#355E3B] flex items-center justify-center hover:bg-[#355E3B]/80 cursor-pointer transition-colors shadow-lg"
              aria-label="Next neighborhoods"
            >
              <ArrowRight
                className="w-[24px] h-[24px] text-white"
                strokeWidth={2}
              />
            </button>
          )}

          {/* Neighborhood Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4 md:px-8 lg:px-12 xl:px-16">
            {(neighborhoods.length <= 4 
              ? neighborhoods 
              : neighborhoods
                  .slice(currentNeighborhoodIndex, currentNeighborhoodIndex + 4)
                  .concat(neighborhoods.length > 0 && currentNeighborhoodIndex + 4 > neighborhoods.length 
                    ? neighborhoods.slice(0, (currentNeighborhoodIndex + 4) - neighborhoods.length)
                    : []
                  )
            ).map((neighborhood) => (
              <div
                key={neighborhood.id}
                onClick={() => handleNeighborhoodClick(neighborhood)}
                className="flex flex-col items-center cursor-pointer group"
              >
                <div className="relative w-full max-w-[325px] h-[375px] rounded-[40px] overflow-hidden mb-4 group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                  <NeighborhoodImage neighborhood={neighborhood} />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-white text-center">
                      <p className="text-lg font-serif font-semibold">Explore</p>
                      <p className="text-sm">{neighborhood.name}</p>
                    </div>
                  </div>
                </div>
                <h3 className="font-serif text-[24px] lg:text-[30px] font-semibold text-black text-center h-[80px] flex items-center justify-center group-hover:text-[#355E3B] transition-colors">
                  {neighborhood.name}
                </h3>
              </div>
            ))}
          </div>

          {/* Pagination dots for mobile */}
          {neighborhoods.length > 1 && (
            <div className="flex justify-center mt-8 md:hidden">
              <div className="flex space-x-2">
                {Array.from({ length: Math.ceil(neighborhoods.length / 1) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentNeighborhoodIndex(index * 1)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      Math.floor(currentNeighborhoodIndex / 1) === index
                        ? 'bg-[#355E3B]'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Pagination dots for tablet */}
          {neighborhoods.length > 2 && (
            <div className="hidden md:flex lg:hidden justify-center mt-8">
              <div className="flex space-x-2">
                {Array.from({ length: Math.ceil(neighborhoods.length / 2) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentNeighborhoodIndex(index * 2)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      Math.floor(currentNeighborhoodIndex / 2) === index
                        ? 'bg-[#355E3B]'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
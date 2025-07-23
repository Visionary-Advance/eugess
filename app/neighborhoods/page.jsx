// app/neighborhoods/page.jsx - Final working version with slugs

'use client';

import { useState, useEffect } from 'react';
import { MapPin, ChevronRight, Search, X } from 'lucide-react';

export default function NeighborhoodsPage() {
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [businesses, setBusinesses] = useState([]);
  const [businessesLoading, setBusinessesLoading] = useState(false);

  // Fetch neighborhoods on component mount
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
        setNeighborhoods(neighborhoodsData);
        
        // Auto-select first neighborhood if available
        if (neighborhoodsData.length > 0) {
          console.log('Auto-selecting first neighborhood:', neighborhoodsData[0]);
          setSelectedNeighborhood(neighborhoodsData[0]);
        }
      } catch (error) {
        console.error('Error fetching neighborhoods:', error);
        setNeighborhoods([]);
      } finally {
        setLoading(false);
      }
    }

    fetchNeighborhoods();
  }, []);

  // Fetch businesses when neighborhood changes
  useEffect(() => {
    if (selectedNeighborhood && selectedNeighborhood.slug) {
      fetchBusinessesForNeighborhood(selectedNeighborhood.slug);
    }
  }, [selectedNeighborhood]);

  const fetchBusinessesForNeighborhood = async (neighborhoodSlug) => {
    setBusinessesLoading(true);
    try {
      console.log('Fetching businesses for neighborhood slug:', neighborhoodSlug);
      const response = await fetch(`/api/businesses/neighborhood/${neighborhoodSlug}`);
      console.log('Businesses response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('No businesses found for this neighborhood');
          setBusinesses([]);
          return;
        }
        
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Businesses data received:', data);
      setBusinesses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching businesses for neighborhood:', error);
      setBusinesses([]);
    } finally {
      setBusinessesLoading(false);
    }
  };

  const handleNeighborhoodSelect = (neighborhood) => {
    console.log('Selected neighborhood:', neighborhood);
    setSelectedNeighborhood(neighborhood);
    setSearchTerm('');
  };

  const handleBusinessClick = (business) => {
    console.log('Navigating to business:', business.slug);
    window.location.href = `/business/${business.slug}`;
  };

  // Format cuisine type for display
  const formatCuisineType = (cuisineType) => {
    if (!cuisineType) return '';
    return cuisineType
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // Filter neighborhoods based on search
  const filteredNeighborhoods = neighborhoods.filter(neighborhood =>
    neighborhood.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (neighborhood.description && neighborhood.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded-lg w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl lg:text-5xl font-semibold text-black mb-4">
            Eugene Neighborhoods
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Explore Eugene's diverse neighborhoods and discover local businesses in each area.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search neighborhoods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl bg-white focus:ring-2 focus:ring-[#355E3B] focus:border-transparent font-serif text-lg"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Neighborhoods List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="font-serif text-2xl font-semibold text-black">
                  Neighborhoods ({filteredNeighborhoods.length})
                </h2>
              </div>
              
              <div className="max-h-[600px] overflow-y-auto">
                {filteredNeighborhoods.length > 0 ? (
                  <div className="space-y-0">
                    {filteredNeighborhoods.map((neighborhood) => (
                      <button
                        key={neighborhood.id}
                        onClick={() => handleNeighborhoodSelect(neighborhood)}
                        className={`w-full p-6 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                          selectedNeighborhood?.slug === neighborhood.slug
                            ? 'bg-[#355E3B]/10 border-l-4 border-l-[#355E3B]' 
                            : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className={`font-serif text-lg font-semibold mb-2 ${
                              selectedNeighborhood?.slug === neighborhood.slug
                                ? 'text-[#355E3B]' 
                                : 'text-black'
                            }`}>
                              {neighborhood.name}
                            </h3>
                            {neighborhood.description && (
                              <p className="text-gray-600 text-sm line-clamp-2">
                                {neighborhood.description}
                              </p>
                            )}
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>Eugene, Oregon</span>
                            </div>
                            {/* Show the slug */}
                           
                          </div>
                          <ChevronRight className={`w-5 h-5 ml-4 transition-colors ${
                            selectedNeighborhood?.slug === neighborhood.slug
                              ? 'text-[#355E3B]' 
                              : 'text-gray-400'
                          }`} />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg mb-2">No neighborhoods found</p>
                    <p className="text-sm">
                      {searchTerm 
                        ? `No neighborhoods match "${searchTerm}"`
                        : 'No neighborhoods are currently available'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Selected Neighborhood Details */}
          <div className="lg:col-span-2">
            {selectedNeighborhood ? (
              <div className="space-y-6">
                {/* Neighborhood Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Neighborhood Image */}
                  <div className="h-64 bg-gray-200 overflow-hidden">
                    <img
                      src={selectedNeighborhood.image || `https://via.placeholder.com/800x300/355E3B/white?text=${encodeURIComponent(selectedNeighborhood.name)}`}
                      alt={selectedNeighborhood.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-8">
                    <h2 className="font-serif text-3xl font-bold text-black mb-4">
                      {selectedNeighborhood.name}
                    </h2>
                    {selectedNeighborhood.description && (
                      <p className="text-gray-700 text-lg leading-relaxed mb-6">
                        {selectedNeighborhood.description}
                      </p>
                    )}
                    
                    
                   
                    {/* Neighborhood Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-[#355E3B]">
                          {businesses.length}
                        </div>
                        <div className="text-sm text-gray-600">
                          {businesses.length === 1 ? 'Business' : 'Businesses'}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-[#355E3B]">
                          {businesses.filter(b => b.has_takeout).length}
                        </div>
                        <div className="text-sm text-gray-600">Takeout Options</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-[#355E3B]">
                          {businesses.filter(b => b.has_delivery).length}
                        </div>
                        <div className="text-sm text-gray-600">Delivery Options</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Businesses in Neighborhood */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-serif text-2xl font-semibold text-black mb-6">
                    Businesses in {selectedNeighborhood.name}  
                    <span className="text-lg ms-1 text-gray-500 font-normal">
                      ({businesses.length})
                    </span>
                  </h3>
                  
                  {businessesLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
                      ))}
                    </div>
                  ) : businesses.length > 0 ? (
                    <div className="space-y-4">
                      {businesses.map((business) => (
                        <div
                          key={business.id}
                          onClick={() => handleBusinessClick(business)}
                          className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-serif text-xl font-semibold text-black mb-2">
                                {business.name}
                              </h4>
                              {business.short_description && (
                                <p className="text-gray-600 mb-3 line-clamp-2">
                                  {business.short_description}
                                </p>
                              )}
                              
                              {/* Business Address */}
                              {business.street_address && (
                                <p className="text-gray-500 text-sm mb-3 flex items-center">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {business.street_address}, {business.city}, {business.state}
                                </p>
                              )}
                              
                              {/* Business Tags - Only show for selected neighborhood */}
                              <div className="flex flex-wrap gap-2">
                                {business.cuisine_type && (
                                  <span className="px-3 py-1 bg-[#355E3B] text-white text-sm rounded-full">
                                    {formatCuisineType(business.cuisine_type)}
                                  </span>
                                )}
                                {business.has_takeout && (
                                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                    Takeout
                                  </span>
                                )}
                                {business.has_delivery && (
                                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                                    Delivery
                                  </span>
                                )}
                                {business.has_outdoor_seating && (
                                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                                    Outdoor Seating
                                  </span>
                                )}
                                {business.is_pet_friendly && (
                                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                                    Pet Friendly
                                  </span>
                                )}
                                {business.has_wifi && (
                                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                                    Free WiFi
                                  </span>
                                )}
                                {business.has_parking && (
                                  <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                                    Parking
                                  </span>
                                )}
                                {business.is_wheelchair_accessible && (
                                  <span className="px-3 py-1 bg-teal-100 text-teal-800 text-sm rounded-full">
                                    Wheelchair Accessible
                                  </span>
                                )}
                                {business.price_level && (
                                  <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                                    {Array(business.price_level).fill('$').join('')}
                                  </span>
                                )}
                                {business.is_verified && (
                                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                                    ✓ Verified
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-4xl mb-4">🏪</div>
                      <h4 className="font-serif text-xl text-gray-600 mb-2">
                        No businesses found
                      </h4>
                      <p className="text-gray-500">
                        No businesses are currently listed in {selectedNeighborhood.name}.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                <h3 className="font-serif text-2xl text-gray-600 mb-4">
                  Select a Neighborhood
                </h3>
                <p className="text-gray-500 text-lg">
                  Choose a neighborhood from the list to explore its businesses and details.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
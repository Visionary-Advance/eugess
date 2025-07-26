'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Phone, Globe, Star, ArrowLeft, ExternalLink } from 'lucide-react';
import BusinessHoursDisplay from '@/Components/BusinessHoursDisplay';

export default function BusinessPage() {
  const params = useParams();
  const router = useRouter();
  const businessSlug = params.slug;

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (businessSlug) {
      fetchBusinessData();
    }
  }, [businessSlug]);

  const fetchBusinessData = async () => {
    try {
      const response = await fetch(`/api/businesses/slug/${businessSlug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Business not found');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return;
      }
      
      const businessData = await response.json();
      setBusiness(businessData);
    } catch (error) {
      console.error('Error fetching business:', error);
      setError('Failed to load business information');
    } finally {
      setLoading(false);
    }
  };

  const formatCuisineType = (cuisineType) => {
    if (!cuisineType) return '';
    return cuisineType
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPriceLevelDisplay = (priceLevel) => {
    if (!priceLevel) return '';
    return Array(priceLevel).fill('$').join('');
  };

  const handleDirections = () => {
    if (business.street_address) {
      const address = `${business.street_address}, ${business.city}, ${business.state} ${business.zip_code}`;
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      window.open(mapsUrl, '_blank');
    }
  };

  const handlePhoneCall = () => {
    if (business.phone) {
      window.location.href = `tel:${business.phone}`;
    }
  };

  const handleWebsiteVisit = () => {
    if (business.website) {
      let url = business.website;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200"></div>
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-12 bg-gray-200 rounded w-3/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">
            {error || 'Business Not Found'}
          </h1>
          <p className="text-gray-500 mb-4">
            {businessSlug ? `The business "${businessSlug}" doesn't exist or is no longer available.` : 'Please check the URL and try again.'}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.back()}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
            <button
              onClick={() => router.push('/directory/all')}
              className="bg-[#355E3B] text-white px-6 py-2 rounded-lg hover:bg-[#2a4a2f] transition-colors"
            >
              Browse All Businesses
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-gray-300">
        {/* Placeholder for business image */}
        <div className="w-full h-full bg-gradient-to-r from-[#355E3B] to-[#8A9A5B] flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">🏪</div>
            <h1 className="text-4xl font-serif font-bold">{business.name}</h1>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 bg-white/90 text-gray-900 p-3 rounded-full hover:bg-white transition-colors shadow-lg"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Business Header */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-serif font-bold text-black mb-2">
                    {business.name}
                  </h1>
                  {business.cuisine_type && (
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-[#355E3B] text-white rounded-full text-sm font-medium">
                        {formatCuisineType(business.cuisine_type)}
                      </span>
                      {business.price_level && (
                        <span className="text-lg font-semibold text-[#355E3B]">
                          {getPriceLevelDisplay(business.price_level)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {business.is_verified && (
                  <div className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Verified
                  </div>
                )}
              </div>

              {/* Description */}
              {business.description && (
                <div className="prose prose-lg max-w-none mb-6">
                  <p className="text-gray-700 leading-relaxed">
                    {business.description}
                  </p>
                </div>
              )}

              {/* Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {business.has_takeout && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Takeout Available
                  </div>
                )}
                {business.has_delivery && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Delivery Available
                  </div>
                )}
                {business.has_outdoor_seating && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    Outdoor Seating
                  </div>
                )}
                {business.is_wheelchair_accessible && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    Wheelchair Accessible
                  </div>
                )}
                {business.has_wifi && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                    Free WiFi
                  </div>
                )}
                {business.is_pet_friendly && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
                    Pet Friendly
                  </div>
                )}
                {business.has_parking && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    Parking Available
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-serif font-semibold text-black mb-6">
                About This Business
              </h2>
              
              {business.short_description ? (
                <p className="text-gray-700 leading-relaxed">
                  {business.short_description}
                </p>
              ) : (
                <p className="text-gray-500 italic">
                  No additional information available at this time.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-serif font-semibold text-black mb-4">
                Contact Information
              </h3>
              
              <div className="space-y-4">
                {/* Address */}
                {business.street_address && (
                  <div>
                    <div className="flex items-start text-gray-700 mb-2">
                      <MapPin className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <div>{business.street_address}</div>
                        <div>{business.city}, {business.state} {business.zip_code}</div>
                      </div>
                    </div>
                    <button
                      onClick={handleDirections}
                      className="ml-8 text-[#355E3B] hover:text-[#2a4a2f] text-sm font-medium"
                    >
                      Get Directions
                    </button>
                  </div>
                )}

                {/* Phone */}
                {business.phone && (
                  <div>
                    <div className="flex items-center text-gray-700 mb-2">
                      <Phone className="w-5 h-5 mr-3" />
                      <span>{business.phone}</span>
                    </div>
                    <button
                      onClick={handlePhoneCall}
                      className="ml-8 text-[#355E3B] hover:text-[#2a4a2f] text-sm font-medium"
                    >
                      Call Now
                    </button>
                  </div>
                )}

                {/* Website */}
                {business.website && (
                  <div>
                    <div className="flex items-center text-gray-700 mb-2">
                      <Globe className="w-5 h-5 mr-3" />
                      <span className="truncate">{business.website}</span>
                    </div>
                    <button
                      onClick={handleWebsiteVisit}
                      className="ml-8 text-[#355E3B] hover:text-[#2a4a2f] text-sm font-medium flex items-center"
                    >
                      Visit Website <ExternalLink className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <BusinessHoursDisplay 
                businessId={business.id} 
                compact={false}
                showTitle={true}
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-serif font-semibold text-black mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                {business.phone && (
                  <button
                    onClick={handlePhoneCall}
                    className="w-full bg-[#355E3B] text-white py-3 px-4 rounded-xl hover:bg-[#2a4a2f] transition-colors font-medium"
                  >
                    Call Business
                  </button>
                )}
                
                {business.street_address && (
                  <button
                    onClick={handleDirections}
                    className="w-full border border-[#355E3B] text-[#355E3B] py-3 px-4 rounded-xl hover:bg-[#355E3B] hover:text-white transition-colors font-medium"
                  >
                    Get Directions
                  </button>
                )}
                
                {business.website && (
                  <button
                    onClick={handleWebsiteVisit}
                    className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center justify-center"
                  >
                    Visit Website <ExternalLink className="w-4 h-4 ml-2" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
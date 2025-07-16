'use client'

import { useState, useEffect } from "react";
import { 
  MapPin, 
  Phone, 
  Globe, 
  Star, 
  Clock, 
  DollarSign, 
  Share2, 
  Heart,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from "lucide-react";

export default function BusinessPage() {
  const [business, setBusiness] = useState(null);
  const [businessImages, setBusinessImages] = useState([]);
  const [businessHours, setBusinessHours] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // Get business ID from URL (you'd get this from router params in Next.js)
  const businessId = "sample-business-id"; // This would come from useParams() or router

  useEffect(() => {
    fetchBusinessData();
  }, [businessId]);

  const fetchBusinessData = async () => {
    try {
      // Fetch business details
      const businessResponse = await fetch(`/api/businesses/${businessId}`);
      const businessData = await businessResponse.json();
      setBusiness(businessData);

      // Fetch business images
      const imagesResponse = await fetch(`/api/businesses/${businessId}/images`);
      const imagesData = await imagesResponse.json();
      setBusinessImages(Array.isArray(imagesData) ? imagesData : []);

      // Fetch business hours
      const hoursResponse = await fetch(`/api/businesses/${businessId}/hours`);
      const hoursData = await hoursResponse.json();
      setBusinessHours(Array.isArray(hoursData) ? hoursData : []);

      // Fetch reviews
      const reviewsResponse = await fetch(`/api/businesses/${businessId}/reviews`);
      const reviewsData = await reviewsResponse.json();
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);

    } catch (error) {
      console.error('Error fetching business data:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === businessImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? businessImages.length - 1 : prev - 1
    );
  };

  const getDayName = (dayIndex) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    // Convert 24-hour to 12-hour format
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 animate-pulse">
        <div className="h-96 bg-gray-200"></div>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">Business Not Found</h1>
          <p className="text-gray-500">The business you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image Section */}
      <div className="relative h-96 bg-gray-200 overflow-hidden">
        {businessImages.length > 0 ? (
          <>
            <img
              src={businessImages[currentImageIndex]?.url || business.image}
              alt={business.name}
              className="w-full h-full object-cover"
            />
            
            {/* Image Navigation */}
            {businessImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                
                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {businessImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-500 text-lg">No Image Available</span>
          </div>
        )}

        {/* Back Button */}
        <button className="absolute top-4 left-4 bg-white/90 text-gray-900 p-2 rounded-full hover:bg-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`p-2 rounded-full transition-colors ${
              isLiked ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-900 hover:bg-white'
            }`}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button className="bg-white/90 text-gray-900 p-2 rounded-full hover:bg-white transition-colors">
            <Share2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2">
            {/* Business Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="font-serif text-3xl font-bold text-black mb-2">
                    {business.name}
                  </h1>
                  {business.rating && (
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(business.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-gray-600">
                        {business.rating} ({business.review_count || 0} reviews)
                      </span>
                    </div>
                  )}
                </div>
                
                {business.price_level && (
                  <div className="flex items-center bg-[#355E3B] text-white px-4 py-2 rounded-lg">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span className="font-semibold">
                      {'$'.repeat(business.price_level)}
                    </span>
                  </div>
                )}
              </div>

              {business.description && (
                <p className="text-gray-700 leading-relaxed">
                  {business.description}
                </p>
              )}
            </div>

            {/* Business Hours */}
            {businessHours.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="font-serif text-2xl font-semibold text-black mb-4 flex items-center">
                  <Clock className="w-6 h-6 mr-2 text-[#355E3B]" />
                  Hours
                </h2>
                <div className="space-y-2">
                  {businessHours.map((hours) => (
                    <div key={hours.day_of_week} className="flex justify-between py-1">
                      <span className="font-medium text-gray-900">
                        {getDayName(hours.day_of_week)}
                      </span>
                      <span className="text-gray-600">
                        {hours.is_closed 
                          ? 'Closed'
                          : hours.is_24_hours
                            ? '24 Hours'
                            : `${formatTime(hours.open_time)} - ${formatTime(hours.close_time)}`
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-serif text-2xl font-semibold text-black mb-6">
                Reviews ({reviews.length})
              </h2>
              
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-[#355E3B] rounded-full flex items-center justify-center text-white font-semibold">
                            {review.author_name?.charAt(0) || 'A'}
                          </div>
                          <div className="ml-3">
                            <h4 className="font-semibold text-gray-900">
                              {review.author_name || 'Anonymous'}
                            </h4>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {review.content}
                      </p>
                    </div>
                  ))}
                  
                  {reviews.length > 3 && (
                    <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors">
                      View All Reviews
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No reviews yet. Be the first to review!
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Contact & Map */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-serif text-xl font-semibold text-black mb-4">
                Contact Information
              </h2>
              
              <div className="space-y-4">
                {business.street_address && (
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-[#355E3B] mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-900 font-medium">Address</p>
                      <p className="text-gray-600">
                        {business.street_address}<br />
                        {business.city}, {business.state} {business.zip_code}
                      </p>
                    </div>
                  </div>
                )}

                {business.phone && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-[#355E3B] mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-gray-900 font-medium">Phone</p>
                      <a href={`tel:${business.phone}`} className="text-[#355E3B] hover:underline">
                        {business.phone}
                      </a>
                    </div>
                  </div>
                )}

                {business.website && (
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 text-[#355E3B] mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-gray-900 font-medium">Website</p>
                      <a 
                        href={business.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#355E3B] hover:underline flex items-center"
                      >
                        Visit Website
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <button className="w-full bg-[#355E3B] text-white py-3 rounded-lg font-semibold hover:bg-[#2a4a2f] transition-colors">
                  Get Directions
                </button>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-serif text-xl font-semibold text-black mb-4">Location</h2>
              <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="w-8 h-8 mx-auto mb-2" />
                  <p>Interactive Map</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
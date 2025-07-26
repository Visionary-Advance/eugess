'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Phone, Globe, Star, ChevronDown, Search, Filter, X } from "lucide-react";
import Link from "next/link";

export default function DirectoryPage() {
  const params = useParams();
  const router = useRouter();
  const categorySlug = params.slug;

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [businessesLoading, setBusinessesLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    priceLevel: [],
    features: [],
    cuisines: []
  });

  // Image component with fallback
  const BusinessImage = ({ business, className = "" }) => {
    const [imageError, setImageError] = useState(false);
    
    const handleImageError = () => {
      setImageError(true);
    };

    if (imageError || !business.image_url) {
      return (
        <div className={`bg-gradient-to-br from-[#355E3B] to-[#8A9A5B] flex items-center justify-center ${className}`}>
          <div className="text-center text-white p-4">
            <div className="text-3xl mb-2">🍽️</div>
            <p className="text-sm font-serif line-clamp-2">{business.name}</p>
          </div>
        </div>
      );
    }

    return (
      <img
        src={business.image_url}
        alt={business.name}
        className={className}
        onError={handleImageError}
        loading="lazy"
      />
    );
  };

  // Filter options
  const filterOptions = {
    priceLevel: [
      { id: 'budget', label: 'Budget-Friendly ($)', value: 1, tooltip: 'Meals typically range from $5-$15' },
      { id: 'midrange', label: 'Mid-Range ($$)', value: 2, tooltip: 'Meals typically range from $15-$30' },
      { id: 'upscale', label: 'Upscale ($$$)', value: 3, tooltip: 'Meals typically range from $30-$60' },
      { id: 'finedining', label: 'Fine Dining ($$$$)', value: 4, tooltip: 'Meals typically range from $60+' }
    ],
    features: [
      { id: 'takeout', label: 'Takeout Available', field: 'has_takeout' },
      { id: 'delivery', label: 'Delivery Available', field: 'has_delivery' },
      { id: 'outdoor_seating', label: 'Outdoor Seating', field: 'has_outdoor_seating' },
      { id: 'wheelchair_accessible', label: 'Wheelchair Accessible', field: 'is_wheelchair_accessible' },
      { id: 'free_wifi', label: 'Free WiFi', field: 'has_wifi' },
      { id: 'pet_friendly', label: 'Pet-Friendly', field: 'is_pet_friendly' },
      { id: 'parking_available', label: 'Parking Available', field: 'has_parking' },
      { id: 'highly_rated', label: 'Highly Rated (4+ stars)', field: 'rating' }
    ],
    cuisines: [
      // Asian Cuisines
      { id: 'japanese', label: 'Japanese', field: 'cuisine_type' },
      { id: 'chinese', label: 'Chinese', field: 'cuisine_type' },
      { id: 'thai', label: 'Thai', field: 'cuisine_type' },
      { id: 'vietnamese', label: 'Vietnamese', field: 'cuisine_type' },
      { id: 'korean', label: 'Korean', field: 'cuisine_type' },
      { id: 'indian', label: 'Indian', field: 'cuisine_type' },
      { id: 'asian_fusion', label: 'Asian Fusion', field: 'cuisine_type' },
      
      // Mexican
      { id: 'mexican', label: 'Mexican', field: 'cuisine_type' },
      
      // European
      { id: 'italian', label: 'Italian', field: 'cuisine_type' },
      { id: 'french', label: 'French', field: 'cuisine_type' },
      { id: 'german', label: 'German', field: 'cuisine_type' },
      { id: 'mediterranean', label: 'Mediterranean', field: 'cuisine_type' },
      { id: 'greek', label: 'Greek', field: 'cuisine_type' },
      { id: 'spanish', label: 'Spanish', field: 'cuisine_type' },
      
      // American
      { id: 'american_classic', label: 'American Classic', field: 'cuisine_type' },
      { id: 'southern_bbq', label: 'Southern/BBQ', field: 'cuisine_type' },
      { id: 'burgers', label: 'Burgers & Fries', field: 'cuisine_type' },
      { id: 'sandwiches', label: 'Sandwiches & Delis', field: 'cuisine_type' },
      { id: 'steakhouse', label: 'Steakhouse', field: 'cuisine_type' },
      
      // Dietary/Style
      { id: 'vegetarian_vegan', label: 'Vegetarian/Vegan', field: 'cuisine_type' },
      { id: 'healthy_fresh', label: 'Healthy/Fresh', field: 'cuisine_type' },
      { id: 'farm_to_table', label: 'Farm-to-Table', field: 'cuisine_type' },
      { id: 'seafood', label: 'Seafood', field: 'cuisine_type' },
      { id: 'pizza', label: 'Pizza', field: 'cuisine_type' },
      { id: 'breakfast_brunch', label: 'Breakfast/Brunch', field: 'cuisine_type' },
      { id: 'desserts', label: 'Desserts/Sweets', field: 'cuisine_type' },
      
      // Beverages
      { id: 'coffee_espresso', label: 'Coffee/Espresso', field: 'cuisine_type' },
      { id: 'bubble_tea', label: 'Bubble Tea', field: 'cuisine_type' },
      { id: 'breweries_beer', label: 'Breweries/Beer', field: 'cuisine_type' },
      { id: 'wine_bars', label: 'Wine Bars', field: 'cuisine_type' },
      { id: 'cocktails_bars', label: 'Cocktails/Bars', field: 'cuisine_type' }
    ]
  };

  // Fetch categories on component mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        const categoriesData = Array.isArray(data) ? data : [];
        setCategories(categoriesData);
        
        // Handle different URL scenarios
        if (categorySlug === 'all') {
          const allCategory = { 
            id: 'all', 
            name: 'All Categories', 
            slug: 'all', 
            businessCount: 0
          };
          setSelectedCategory(allCategory);
          fetchAllBusinesses();
        } else if (categorySlug && categoriesData.length > 0) {
          const selectedCat = categoriesData.find(cat => cat.slug === categorySlug);
          if (selectedCat) {
            setSelectedCategory(selectedCat);
          } else {
            if (categoriesData[0]) {
              router.replace(`/directory/${categoriesData[0].slug}`);
            }
          }
        } else if (categoriesData.length > 0) {
          router.replace(`/directory/${categoriesData[0].slug}`);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, [categorySlug, router]);

  // Fetch businesses when category changes (but not for "All Categories")
  useEffect(() => {
    if (selectedCategory && selectedCategory.id !== 'all') {
      fetchBusinesses(selectedCategory.id);
    }
  }, [selectedCategory]);

  const fetchBusinesses = async (categoryId) => {
    setBusinessesLoading(true);
    try {
      const response = await fetch(`/api/businesses/category/${categoryId}`);
      const data = await response.json();
      setBusinesses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      setBusinesses([]);
    } finally {
      setBusinessesLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setDropdownOpen(false);
    setSearchTerm("");
    setActiveFilters({ priceLevel: [], features: [], cuisines: [] });
    
    if (category.id === 'all') {
      router.push('/directory/all');
      fetchAllBusinesses();
    } else {
      router.push(`/directory/${category.slug}`);
    }
  };

  const fetchAllBusinesses = async () => {
    setBusinessesLoading(true);
    try {
      const response = await fetch('/api/businesses/all');
      const data = await response.json();
      setBusinesses(Array.isArray(data) ? data : []);
      
      if (selectedCategory?.id === 'all') {
        setSelectedCategory(prev => ({
          ...prev,
          businessCount: Array.isArray(data) ? data.length : 0
        }));
      }
    } catch (error) {
      console.error('Error fetching all businesses:', error);
      setBusinesses([]);
    } finally {
      setBusinessesLoading(false);
    }
  };

  const handleFilterChange = (filterType, filterId, checked) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: checked 
        ? [...prev[filterType], filterId]
        : prev[filterType].filter(id => id !== filterId)
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters({ priceLevel: [], features: [], cuisines: [] });
  };

  const getActiveFilterCount = () => {
    return activeFilters.priceLevel.length + activeFilters.features.length + activeFilters.cuisines.length;
  };

  // Filter businesses based on search term and active filters
  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriceLevel = activeFilters.priceLevel.length === 0 || 
      activeFilters.priceLevel.some(priceId => {
        const priceOption = filterOptions.priceLevel.find(p => p.id === priceId);
        return business.price_level === priceOption?.value;
      });
    
    const matchesFeatures = activeFilters.features.length === 0 || 
      activeFilters.features.every(featureId => {
        const featureOption = filterOptions.features.find(f => f.id === featureId);
        
        if (!featureOption) return true;
        
        if (featureId === 'highly_rated') {
          return business.rating && business.rating >= 4;
        }
        
        const fieldValue = business[featureOption.field];
        
        if (typeof fieldValue === 'boolean') {
          return fieldValue === true;
        }
        
        if (typeof fieldValue === 'number') {
          return fieldValue > 0;
        }
        
        return Boolean(fieldValue);
      });
    
    const matchesCuisines = activeFilters.cuisines.length === 0 || 
      activeFilters.cuisines.some(cuisineId => {
        return business.cuisine_type === cuisineId;
      });
    
    return matchesSearch && matchesPriceLevel && matchesFeatures && matchesCuisines;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded-lg w-1/3 mb-8"></div>
            <div className="h-16 bg-gray-200 rounded-lg w-1/2 mb-12"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-3xl"></div>
              ))}
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
          <h1 className="font-serif text-4xl lg:text-5xl font-semibold text-black mb-6">
            Business Directory
          </h1>
          
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
            {/* Category Selector */}
            <div className="relative w-52">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-between w-full max-w-md bg-white border border-gray-300 rounded-2xl px-6 py-4 text-left hover:border-[#355E3B] transition-colors"
              >
                <div>
                  <span className="font-serif text-xl text-black">
                    {selectedCategory ? selectedCategory.name : 'Select Category'}
                  </span>
                  {selectedCategory && (
                    <span className="block text-sm text-gray-500 mt-1">
                      {selectedCategory.businessCount} {selectedCategory.businessCount === 1 ? 'business' : 'businesses'}
                    </span>
                  )}
                </div>
                <ChevronDown 
                  className={`w-5 h-5 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 max-w-md bg-white border border-gray-300 rounded-2xl shadow-lg mt-2 z-10">
                  {/* All Categories Option */}
                  <button
                    onClick={() => handleCategoryChange({ id: 'all', name: 'All Categories', slug: 'all', businessCount: 0 })}
                    className={`w-full text-left px-6 py-4 hover:bg-gray-50 first:rounded-t-2xl transition-colors border-b border-gray-100 ${
                      selectedCategory?.id === 'all' ? 'bg-[#355E3B]/10' : ''
                    }`}
                  >
                    <div className="font-serif text-lg text-black">All Categories</div>
                    <div className="text-sm text-gray-500">
                      View all businesses
                    </div>
                  </button>
                  
                  {/* Individual Categories */}
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category)}
                      className={`w-full text-left px-6 py-4 hover:bg-gray-50 last:rounded-b-2xl transition-colors ${
                        selectedCategory?.id === category.id ? 'bg-[#355E3B]/10' : ''
                      }`}
                    >
                      <div className="font-serif text-lg text-black">{category.name}</div>
                      <div className="text-sm text-gray-500">
                        {category.businessCount} {category.businessCount === 1 ? 'business' : 'businesses'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl bg-white focus:ring-2 focus:ring-[#355E3B] focus:border-transparent font-serif text-lg"
              />
            </div>

            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-6 py-4 border rounded-2xl transition-colors ${
                  showFilters || getActiveFilterCount() > 0
                    ? 'border-[#355E3B] bg-[#355E3B] text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-[#355E3B]'
                }`}
              >
                <Filter className="w-5 h-5" />
                <span className="font-serif text-lg">Filters</span>
                {getActiveFilterCount() > 0 && (
                  <span className="bg-white text-[#355E3B] text-sm font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif text-xl font-semibold text-black">Filter Options</h3>
                <div className="flex items-center gap-4">
                  {getActiveFilterCount() > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-[#355E3B] hover:underline text-sm font-medium"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Price Level Filters */}
                <div>
                  <h4 className="font-serif text-lg font-semibold text-black mb-4">Price Level</h4>
                  <div className="space-y-3">
                    {filterOptions.priceLevel.map((option) => (
                      <label key={option.id} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeFilters.priceLevel.includes(option.id)}
                          onChange={(e) => handleFilterChange('priceLevel', option.id, e.target.checked)}
                          className="w-4 h-4 text-[#355E3B] border-gray-300 rounded focus:ring-[#355E3B]"
                        />
                        <span className="ml-3 text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Feature Filters */}
                <div>
                  <h4 className="font-serif text-lg font-semibold text-black mb-4">Features & Amenities</h4>
                  <div className="space-y-3">
                    {filterOptions.features.map((option) => (
                      <label key={option.id} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeFilters.features.includes(option.id)}
                          onChange={(e) => handleFilterChange('features', option.id, e.target.checked)}
                          className="w-4 h-4 text-[#355E3B] border-gray-300 rounded focus:ring-[#355E3B]"
                        />
                        <span className="ml-3 text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Cuisine Filters */}
                <div>
                  <h4 className="font-serif text-lg font-semibold text-black mb-4">Cuisine Type</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {filterOptions.cuisines.map((option) => (
                      <label key={option.id} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeFilters.cuisines.includes(option.id)}
                          onChange={(e) => handleFilterChange('cuisines', option.id, e.target.checked)}
                          className="w-4 h-4 text-[#355E3B] border-gray-300 rounded focus:ring-[#355E3B]"
                        />
                        <span className="ml-3 text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {getActiveFilterCount() > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {activeFilters.priceLevel.map(priceId => {
                const option = filterOptions.priceLevel.find(p => p.id === priceId);
                return (
                  <span
                    key={priceId}
                    className="inline-flex items-center gap-2 bg-[#355E3B] text-white px-3 py-1 rounded-full text-sm"
                  >
                    {option?.label}
                    <button
                      onClick={() => handleFilterChange('priceLevel', priceId, false)}
                      className="hover:bg-white/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
              {activeFilters.features.map(featureId => {
                const option = filterOptions.features.find(f => f.id === featureId);
                return (
                  <span
                    key={featureId}
                    className="inline-flex items-center gap-2 bg-[#355E3B] text-white px-3 py-1 rounded-full text-sm"
                  >
                    {option?.label}
                    <button
                      onClick={() => handleFilterChange('features', featureId, false)}
                      className="hover:bg-white/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
              {activeFilters.cuisines.map(cuisineId => {
                const option = filterOptions.cuisines.find(c => c.id === cuisineId);
                return (
                  <span
                    key={cuisineId}
                    className="inline-flex items-center gap-2 bg-[#355E3B] text-white px-3 py-1 rounded-full text-sm"
                  >
                    {option?.label}
                    <button
                      onClick={() => handleFilterChange('cuisines', cuisineId, false)}
                      className="hover:bg-white/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Category Title */}
        {selectedCategory && (
          <div className="mb-8">
            <h2 className="font-serif text-3xl font-semibold text-black mb-2">
              {selectedCategory.name}
              {searchTerm && (
                <span className="text-gray-500 text-xl ml-2">
                  - Results for "{searchTerm}"
                </span>
              )}
            </h2>
            <p className="text-gray-600 text-lg">
              {filteredBusinesses.length} of {businesses.length} businesses
              {searchTerm ? ` matching your search` : ''}
              {getActiveFilterCount() > 0 ? ` with selected filters` : ''}
            </p>
          </div>
        )}

        {/* Businesses Grid */}
        {businessesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredBusinesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBusinesses.map((business) => (
              <div
                key={business.id}
                className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Business Image */}
                <div className="h-48 overflow-hidden">
                  <BusinessImage
                    business={business}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Business Info */}
                <div className="p-6">
                  {/* Business Name */}
                  <h3 className="font-serif text-xl font-semibold text-black mb-2 line-clamp-2">
                    {business.name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {business.short_description || business.description || "No description available"}
                  </p>

                  {/* Rating (if available) */}
                  {business.rating && (
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(business.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        ({business.rating}) • {business.review_count || 0} reviews
                      </span>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    {business.street_address && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {business.street_address}, {business.city}, {business.state}
                        </span>
                      </div>
                    )}
                    
                    {business.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{business.phone}</span>
                      </div>
                    )}
                    
                    {business.website && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Globe className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="line-clamp-1">{business.website}</span>
                      </div>
                    )}
                  </div>

                  {/* Price Level */}
                  {business.price_level && (
                    <div className="flex items-center mb-4">
                      <span className="text-sm text-gray-600 mr-2">Price:</span>
                      <div className="relative group">
                        <span className="text-sm font-semibold text-[#355E3B] cursor-help">
                          {Array(business.price_level).fill('$').join('')}
                        </span>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                          {business.price_level === 1 && 'Meals typically range from $5-$15'}
                          {business.price_level === 2 && 'Meals typically range from $15-$30'}
                          {business.price_level === 3 && 'Meals typically range from $30-$60'}
                          {business.price_level === 4 && 'Meals typically range from $60+'}
                          <div className="absolute top-full left-3 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* View Details Button */}
                  <Link href={`/business/${business.slug || business.id}`}>
                    <button className="w-full bg-[#355E3B] cursor-pointer text-white font-serif text-lg py-3 rounded-xl hover:bg-[#2a4a2f] transition-colors">
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">
              {searchTerm ? '🔍' : '🏪'}
            </div>
            <h3 className="font-serif text-2xl text-gray-600 mb-2">
              {searchTerm ? 'No search results' : 'No businesses found'}
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? `No businesses match "${searchTerm}" in ${selectedCategory?.name || 'this category'}.`
                : selectedCategory 
                  ? `No businesses match your current filters in ${selectedCategory.name}.`
                  : 'Please select a category to view businesses.'
              }
            </p>
            {(searchTerm || getActiveFilterCount() > 0) && (
              <div className="flex gap-4 mt-4 justify-center">
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-[#355E3B] hover:underline"
                  >
                    Clear search
                  </button>
                )}
                {getActiveFilterCount() > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-[#355E3B] hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
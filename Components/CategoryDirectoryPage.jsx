'use client'

import { useState, useEffect } from "react";
import { MapPin, Phone, Globe, Star, ChevronDown, Search } from "lucide-react";

export default function CombinedDirectoryPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [businessesLoading, setBusinessesLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch categories on component mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        const categoriesData = Array.isArray(data) ? data : [];
        setCategories(categoriesData);
        
        // Auto-select first category
        if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // Fetch businesses when category changes
  useEffect(() => {
    if (selectedCategory) {
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
    setSearchTerm(""); // Clear search when changing categories
  };

  // Filter businesses based on search term (name only)
  const filteredBusinesses = businesses.filter(business =>
    business.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <div className="relative">
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
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category)}
                      className={`w-full text-left px-6 py-4 hover:bg-gray-50 first:rounded-t-2xl last:rounded-b-2xl transition-colors ${
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
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl bg-white focus:ring-2 focus:ring-[#355E3B] focus:border-transparent font-serif text-lg text-black"
              />
            </div>
          </div>
        </div>

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
                className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                {/* Business Image */}
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={business.image || "https://via.placeholder.com/400x200?text=No+Image"}
                    alt={business.name}
                    className="w-full h-full object-cover"
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
                      <span className="text-sm font-semibold text-[#355E3B]">
                        {'$'.repeat(business.price_level)}
                      </span>
                    </div>
                  )}

                  {/* View Details Button */}
                  <button className="w-full bg-[#355E3B] text-white font-serif text-lg py-3 rounded-xl hover:bg-[#2a4a2f] transition-colors">
                    View Details
                  </button>
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
                  ? `No businesses are currently listed in the ${selectedCategory.name} category.`
                  : 'Please select a category to view businesses.'
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 text-[#355E3B] hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
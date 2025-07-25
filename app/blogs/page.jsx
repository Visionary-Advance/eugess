// app/blogs/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Search, Filter, X } from 'lucide-react';
import Link from 'next/link';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'Community Vote',
    'Restaurant Review', 
    'Food Guide',
    'Local Events',
    'Tips',
    'Behind the Scenes',
    'Chef Interviews',
    'Seasonal',
    'News',
    'Trends',
    'Top 10'
  ];

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch('/api/blogs');
      const data = await response.json();
      setBlogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Community Vote': '#355E3B',
      'Restaurant Review': '#8A9A5B',
      'Food Guide': '#276B00',
      'Local Events': '#FFA500',
      'Tips': '#2E8B57',
      'Behind the Scenes': '#8B4513',
      'Chef Interviews': '#4B0082',
      'Seasonal': '#FF6347',
      'News': '#1E90FF',
      'Trends': '#9B59B6',
      'Top 10': '#E74C3C',
      'default': '#355E3B'
    };
    return colors[category] || colors.default;
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredBlogs = filteredBlogs.filter(blog => blog.is_featured);
  const regularBlogs = filteredBlogs.filter(blog => !blog.is_featured);

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
            Eugene Food Blog
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover stories, tips, and insights about Eugene's incredible local food scene
          </p>
          
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search blog posts..."
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
                  showFilters || selectedCategory
                    ? 'border-[#355E3B] bg-[#355E3B] text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-[#355E3B]'
                }`}
              >
                <Filter className="w-5 h-5" />
                <span className="font-serif text-lg">Categories</span>
                {selectedCategory && (
                  <span className="bg-white text-[#355E3B] text-sm font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
                    1
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-xl font-semibold text-black">Categories</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-4 py-2 rounded-full font-serif transition-colors ${
                    !selectedCategory
                      ? 'bg-[#355E3B] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full font-serif transition-colors ${
                      selectedCategory === category
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={{
                      backgroundColor: selectedCategory === category ? getCategoryColor(category) : undefined
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Filters */}
          {selectedCategory && (
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">Active filter:</span>
                <span
                  className="inline-flex items-center gap-2 text-white px-3 py-1 rounded-full text-sm font-medium"
                  style={{ backgroundColor: getCategoryColor(selectedCategory) }}
                >
                  {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="hover:bg-white/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-8">
          <h2 className="font-serif text-2xl font-semibold text-black mb-2">
            {searchTerm || selectedCategory ? 'Search Results' : 'All Blog Posts'}
          </h2>
          <p className="text-gray-600">
            {filteredBlogs.length} post{filteredBlogs.length !== 1 ? 's' : ''} found
            {searchTerm && ` for "${searchTerm}"`}
            {selectedCategory && ` in ${selectedCategory}`}
          </p>
        </div>

        {/* Featured Posts */}
        {featuredBlogs.length > 0 && !searchTerm && !selectedCategory && (
          <div className="mb-16">
            <h3 className="font-serif text-2xl font-semibold text-black mb-8">Featured Posts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredBlogs.map((blog) => (
                <Link key={blog.id} href={`/blogs/${blog.slug}`} className="group">
                  <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow h-full flex flex-col">
                    <div className="h-64 bg-gray-200 overflow-hidden flex-shrink-0">
                      {blog.featured_image ? (
                        <img
                          src={blog.featured_image}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <div 
                        className="text-white font-serif text-sm font-semibold px-3 py-1 rounded-lg inline-block mb-3 w-fit"
                        style={{ backgroundColor: getCategoryColor(blog.category) }}
                      >
                        {blog.category}
                      </div>
                      <h3 className="font-serif text-2xl font-semibold text-black leading-tight mb-3 group-hover:text-[#355E3B] transition-colors">
                        {blog.title}
                      </h3>
                      {blog.excerpt && (
                        <p className="text-gray-600 mb-4 flex-grow">
                          {blog.excerpt.length > 150 ? `${blog.excerpt.substring(0, 150)}...` : blog.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-gray-500 text-sm mt-auto">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          <span>{blog.author_name}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{blog.read_time_minutes} min</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{formatDate(blog.publish_date || blog.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Posts */}
        {regularBlogs.length > 0 ? (
          <div>
            {!searchTerm && !selectedCategory && featuredBlogs.length > 0 && (
              <h3 className="font-serif text-2xl font-semibold text-black mb-8">All Posts</h3>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularBlogs.map((blog) => (
                <Link key={blog.id} href={`/blogs/${blog.slug}`} className="group">
                  <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow h-full flex flex-col">
                    <div className="h-48 bg-gray-200 overflow-hidden flex-shrink-0">
                      {blog.featured_image ? (
                        <img
                          src={blog.featured_image}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <div 
                        className="text-white font-serif text-sm font-semibold px-3 py-1 rounded-lg inline-block mb-3 w-fit"
                        style={{ backgroundColor: getCategoryColor(blog.category) }}
                      >
                        {blog.category}
                      </div>
                      <h3 className="font-serif text-xl font-semibold text-black leading-tight mb-2 group-hover:text-[#355E3B] transition-colors">
                        {blog.title}
                      </h3>
                      {blog.excerpt && (
                        <p className="text-gray-600 text-sm mb-4 flex-grow">
                          {blog.excerpt.length > 120 ? `${blog.excerpt.substring(0, 120)}...` : blog.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-gray-500 text-xs mt-auto">
                        <div className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          <span>{blog.author_name}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{blog.read_time_minutes} min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="font-serif text-2xl text-gray-600 mb-2">
              {searchTerm || selectedCategory ? 'No posts found' : 'No blog posts yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedCategory 
                ? `No posts match your current filters.`
                : 'Check back soon for exciting content about Eugene\'s food scene!'
              }
            </p>
            {(searchTerm || selectedCategory) && (
              <div className="flex gap-4 justify-center">
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-[#355E3B] hover:underline"
                  >
                    Clear search
                  </button>
                )}
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="text-[#355E3B] hover:underline"
                  >
                    Clear category filter
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
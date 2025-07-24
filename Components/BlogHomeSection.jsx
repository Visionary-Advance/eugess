// Components/BlogHomeSection.jsx
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Clock, User, ChevronRight } from "lucide-react";

export default function BlogHomeSection() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const response = await fetch('/api/blogs?featured=true&limit=4');
        const data = await response.json();
        setBlogs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBlogs();
  }, []);

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
      'Tips & Guides': '#2E8B57',
      'default': '#355E3B'
    };
    return colors[category] || colors.default;
  };

  if (loading) {
    return (
      <section className="py-5 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 lg:mb-16">
            <h2 className="font-serif text-[40px] font-semibold text-black text-left mb-4 lg:mb-0">
              Browse Blogs
            </h2>
            <div className="w-32 h-12 bg-gray-200 rounded-[20px] animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            <div className="lg:col-span-7">
              <div className="bg-gray-200 rounded-[40px] h-[500px] animate-pulse"></div>
            </div>
            <div className="lg:col-span-5 space-y-6 lg:space-y-8">
              {[1, 2, 3].map((index) => (
                <div key={index} className="flex gap-4 lg:gap-6">
                  <div className="bg-gray-200 w-24 h-24 lg:w-[175px] lg:h-[175px] rounded-xl lg:rounded-[20px] flex-shrink-0 animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (blogs.length === 0) {
    return (
      <section className="py-5 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 lg:mb-16">
            <h2 className="font-serif text-[40px] font-semibold text-black text-left mb-4 lg:mb-0">
              Browse Blogs
            </h2>
            <Link href="/blogs">
              <button className="block border border-primary active:scale-95 text-[#355E3B] hover:bg-[#355E3B] cursor-pointer font-serif text-[24px] md:text-[30px] px-6 py-2 rounded-[20px] hover:bg-primary hover:text-white transition-colors">
                Browse All
              </button>
            </Link>
          </div>
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="font-serif text-2xl text-gray-600 mb-2">No Blog Posts Yet</h3>
            <p className="text-gray-500">Check back soon for exciting content about Eugene's food scene!</p>
          </div>
        </div>
      </section>
    );
  }

  const featuredBlog = blogs[0];
  const sideBlogs = blogs.slice(1, 4);

  return (
    <section className="py-5 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 lg:mb-16">
          <h2 className="font-serif text-[40px] font-semibold text-black text-left mb-4 lg:mb-0">
            Browse Blogs
          </h2>
          <Link href="/blogs">
            <button className="block border border-primary active:scale-95 text-[#355E3B] hover:bg-[#355E3B] cursor-pointer font-serif text-[24px] md:text-[30px] px-6 py-2 rounded-[20px] hover:bg-primary hover:text-white transition-colors">
              Browse All
            </button>
          </Link>
        </div>

        {/* Blog Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Featured Blog Post */}
          {featuredBlog && (
            <div className="lg:col-span-7">
              <Link href={`/blogs/${featuredBlog.slug}`}>
                <div className="bg-white rounded-[40px] overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
                  {/* Featured Image */}
                  <div className="bg-[#D9D9D9] h-64 lg:h-[400px] rounded-t-[40px] overflow-hidden">
                    {featuredBlog.featured_image ? (
                      <img
                        src={featuredBlog.featured_image}
                        alt={featuredBlog.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-lg">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Featured Content */}
                  <div className="p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center mb-4">
                      <div 
                        className="text-white font-serif text-lg lg:text-xl font-semibold px-4 py-2 rounded-lg mb-2 sm:mb-0 w-fit"
                        style={{ backgroundColor: getCategoryColor(featuredBlog.category) }}
                      >
                        {featuredBlog.category}
                      </div>
                      <div className="text-[#868686] sm:ms-4 font-serif text-lg lg:text-xl font-semibold flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(featuredBlog.publish_date || featuredBlog.created_at)}
                      </div>
                    </div>
                    <h2 className="font-serif text-2xl lg:text-[35px] font-semibold text-black leading-tight mb-3">
                      {featuredBlog.title}
                    </h2>
                    {featuredBlog.excerpt && (
                      <p className="text-gray-600 text-lg leading-relaxed mb-4">
                        {featuredBlog.excerpt}
                      </p>
                    )}
                    <div className="flex items-center text-gray-500 text-sm">
                      <User className="w-4 h-4 mr-2" />
                      <span className="mr-4">{featuredBlog.author_name}</span>
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{featuredBlog.read_time_minutes} min read</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Side Blog Posts */}
          <div className="lg:col-span-5 space-y-6 lg:space-y-8">
            {sideBlogs.map((blog) => (
              <Link href={`/blogs/${blog.slug}`} key={blog.id} className="flex gap-4 lg:gap-6 hover:opacity-80 transition-opacity">
                {/* Side Image */}
                <div className="bg-[#D9D9D9] w-24 h-24 lg:w-[175px] lg:h-[175px] rounded-xl lg:rounded-[20px] flex-shrink-0 overflow-hidden">
                  {blog.featured_image ? (
                    <img
                      src={blog.featured_image}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                </div>

                {/* Side Content */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center mb-2 lg:mb-4">
                    <div 
                      className="text-white font-serif text-sm lg:text-xl font-semibold px-3 py-1 lg:px-4 lg:py-2 rounded-lg inline-block mb-2 sm:mb-0 w-fit"
                      style={{ backgroundColor: getCategoryColor(blog.category) }}
                    >
                      {blog.category}
                    </div>
                    <div className="text-[#868686] sm:ms-2 font-serif text-sm lg:text-xl font-semibold">
                      {formatDate(blog.publish_date || blog.created_at)}
                    </div>
                  </div>
                  <h3 className="font-serif text-lg lg:text-[26px] font-semibold text-black leading-tight mb-2">
                    {blog.title}
                  </h3>
                  <div className="flex items-center text-gray-500 text-xs lg:text-sm">
                    <User className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                    <span className="mr-3">{blog.author_name}</span>
                    <Clock className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                    <span>{blog.read_time_minutes} min</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
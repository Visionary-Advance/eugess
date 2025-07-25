// Components/BlogHomeSection.jsx
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";

export default function BlogHomeSection() {
  const [featuredBlog, setFeaturedBlog] = useState(null);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        // Fetch featured blog (first featured post)
        const featuredResponse = await fetch('/api/blogs?featured=true&limit=1');
        const featuredData = await featuredResponse.json();
        const featured = Array.isArray(featuredData) && featuredData.length > 0 ? featuredData[0] : null;
        
        // Fetch 3 most recent "Tips" blogs for the sidebar
        const tipsResponse = await fetch('/api/blogs?category=Tips&limit=3');
        const tipsData = await tipsResponse.json();
        let tips = Array.isArray(tipsData) ? tipsData : [];
        
        // If the featured blog is also a "Tips" blog, remove it from tips and get one more
        if (featured && featured.category === 'Tips') {
          tips = tips.filter(blog => blog.id !== featured.id);
          // If we need more tips blogs after filtering, fetch one more
          if (tips.length < 3) {
            const extraTipsResponse = await fetch('/api/blogs?category=Tips&limit=4');
            const extraTipsData = await extraTipsResponse.json();
            const allTips = Array.isArray(extraTipsData) ? extraTipsData : [];
            tips = allTips.filter(blog => blog.id !== featured.id).slice(0, 3);
          }
        }
        
        setFeaturedBlog(featured);
        setRecentBlogs(tips);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setFeaturedBlog(null);
        setRecentBlogs([]);
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
      'Tips': '#2E8B57',
      'Trends': '#9B59B6',
      'Top 10': '#E74C3C',
      'default': '#355E3B'
    };
    return colors[category] || colors.default;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-16">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 lg:mb-16">
          <h1 className="font-serif text-[40px] font-semibold text-black text-left mb-4 lg:mb-0">
            Browse Blogs
          </h1>
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
    );
  }

  if (!featuredBlog && recentBlogs.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-16">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 lg:mb-16">
          <h1 className="font-serif text-[40px] font-semibold text-black text-left mb-4 lg:mb-0">
            Browse Blogs
          </h1>
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
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:py-16">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 lg:mb-16">
        <h1 className="font-serif text-[40px] font-semibold text-black text-left mb-4 lg:mb-0">
          Browse Blogs
        </h1>
        <Link href="/blogs">
          <button className="block border border-primary active:scale-95 text-[#355E3B] hover:bg-[#355E3B] cursor-pointer font-serif text-[24px] md:text-[30px] px-6 py-2 rounded-[20px] hover:bg-primary hover:text-white transition-colors">
            Browse All
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
        {featuredBlog ? (
          <div className="lg:col-span-7">
            <Link href={`/blogs/${featuredBlog.slug}`}>
              <div className="bg-white rounded-[40px] overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
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

                <div className="p-6 lg:p-8">
                  <div className="flex sm:flex-row sm:items-center mb-4">
                    <div 
                      className="text-white font-serif text-lg lg:text-xl font-semibold px-4 py-2 rounded-lg mb-2 sm:mb-0"
                      style={{ backgroundColor: getCategoryColor(featuredBlog.category) }}
                    >
                      {featuredBlog.category}
                    </div>
                    <div className="text-[#868686] ms-2 font-serif text-lg lg:text-xl font-semibold">
                      {formatDate(featuredBlog.publish_date || featuredBlog.created_at)}
                    </div>
                  </div>
                  <h2 className="font-serif text-2xl lg:text-[35px] font-semibold text-black leading-tight">
                    {featuredBlog.title}
                  </h2>
                </div>
              </div>
            </Link>
          </div>
        ) : (
          recentBlogs.length > 0 && (
            <div className="lg:col-span-7">
              <Link href={`/blogs/${recentBlogs[0].slug}`}>
                <div className="bg-white rounded-[40px] overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="bg-[#D9D9D9] h-64 lg:h-[400px] rounded-t-[40px] overflow-hidden">
                    {recentBlogs[0].featured_image ? (
                      <img
                        src={recentBlogs[0].featured_image}
                        alt={recentBlogs[0].title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-lg">No Image</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 lg:p-8">
                    <div className="flex sm:flex-row sm:items-center mb-4">
                      <div 
                        className="text-white font-serif text-lg lg:text-xl font-semibold px-4 py-2 rounded-lg mb-2 sm:mb-0"
                        style={{ backgroundColor: getCategoryColor(recentBlogs[0].category) }}
                      >
                        {recentBlogs[0].category}
                      </div>
                      <div className="text-[#868686] ms-2 font-serif text-lg lg:text-xl font-semibold">
                        {formatDate(recentBlogs[0].publish_date || recentBlogs[0].created_at)}
                      </div>
                    </div>
                    <h2 className="font-serif text-2xl lg:text-[35px] font-semibold text-black leading-tight">
                      {recentBlogs[0].title}
                    </h2>
                  </div>
                </div>
              </Link>
            </div>
          )
        )}

        <div className="lg:col-span-5 space-y-6 lg:space-y-8">
          {recentBlogs.map((blog) => (
            <Link href={`/blogs/${blog.slug}`} key={blog.id} className="flex gap-4 lg:gap-6 transition-opacity">
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

              <div className="flex-1">
                <div className="flex sm:flex-row sm:items-center mb-2 lg:mb-4">
                  <div 
                    className="text-white font-serif text-sm lg:text-xl font-semibold px-3 py-1 lg:px-4 lg:py-2 rounded-lg inline-block mb-2 sm:mb-0 w-fit"
                    style={{ backgroundColor: getCategoryColor(blog.category) }}
                  >
                    {blog.category}
                  </div>
                  <div className="text-[#868686] ms-2 font-serif text-sm lg:text-lg font-semibold">
                    {formatDate(blog.publish_date || blog.created_at)}
                  </div>
                </div>
                <h3 className="font-serif text-lg lg:text-[26px] font-semibold text-black leading-tight">
                  {blog.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
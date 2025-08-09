// app/blogs/[slug]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, Clock, User, ArrowLeft, Share2, Eye } from 'lucide-react';
import Link from 'next/link';

export default function BlogPage() {
  const params = useParams();
  const router = useRouter();
  const blogSlug = params.slug;

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  useEffect(() => {
    if (blogSlug) {
      fetchBlogData();
    }
  }, [blogSlug]);

  const fetchBlogData = async () => {
    try {
      const response = await fetch(`/api/blogs/${blogSlug}`);
      
      if (!response.ok) {
        throw new Error(`Blog not found: ${response.status}`);
      }
      
      const blogData = await response.json();
      setBlog(blogData);

      // Fetch related blogs (same category, excluding current)
      if (blogData.category) {
        const relatedResponse = await fetch(`/api/blogs?category=${encodeURIComponent(blogData.category)}&limit=3`);
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          const filtered = relatedData.filter(b => b.id !== blogData.id).slice(0, 3);
          setRelatedBlogs(filtered);
        }
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      setBlog(null);
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
      'Tips & Guides': '#2E8B57',
      'default': '#355E3B'
    };
    return colors[category] || colors.default;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 animate-pulse">
        <div className="h-96 bg-gray-200"></div>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded w-3/4 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">Blog Post Not Found</h1>
          <p className="text-gray-500 mb-4">The blog post with slug "{blogSlug}" doesn't exist.</p>
          <Link href="/blogs">
            <button className="bg-[#355E3B] text-white px-6 py-2 rounded-lg hover:bg-[#2a4a2f] transition-colors">
              Browse All Blogs
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image Section */}
      <div className="relative h-96 bg-gray-200 overflow-hidden">
        {blog.featured_image ? (
          <img
            src={blog.featured_image}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-500 text-lg">No Featured Image</span>
          </div>
        )}

        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="absolute top-4 left-4 bg-white/90 text-gray-900 p-2 rounded-full hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="absolute top-4 right-4 bg-white/90 text-gray-900 p-2 rounded-full hover:bg-white transition-colors"
        >
          <Share2 className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Blog Header */}
        <div className="mb-8">
          {/* Category Badge */}
          <div 
            className="text-white font-serif text-lg font-semibold px-4 py-2 rounded-lg inline-block mb-4"
            style={{ backgroundColor: getCategoryColor(blog.category) }}
          >
            {blog.category}
          </div>

          {/* Title */}
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-black leading-tight mb-6">
            {blog.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
            
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              <span>{formatDate(blog.publish_date || blog.created_at)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              <span>{blog.read_time_minutes} min read</span>
            </div>
            <div className="flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              <span>{blog.view_count || 0} views</span>
            </div>
          </div>

          {/* Excerpt */}
          {blog.excerpt && (
            <p className="text-xl text-gray-700 leading-relaxed mb-8 font-serif">
              {blog.excerpt}
            </p>
          )}
        </div>

        {/* Blog Content */}
        <div className="prose prose-lg max-w-none mb-12">
          <div 
            className="text-gray-800 leading-relaxed"
            style={{ 
              fontSize: '18px', 
              lineHeight: '1.8',
              fontFamily: 'serif'
            }}
            dangerouslySetInnerHTML={{ 
              __html: blog.content.replace(/\n/g, '<br />') 
            }} 
          />
        </div>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="mb-12">
            <h3 className="font-serif text-xl font-semibold text-black mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related Blogs */}
        {relatedBlogs.length > 0 && (
          <div className="border-t border-gray-200 pt-12">
            <h3 className="font-serif text-2xl font-semibold text-black mb-8">
              Related Posts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map((relatedBlog) => (
                <Link 
                  key={relatedBlog.id} 
                  href={`/blogs/${relatedBlog.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                    <div className="h-48 bg-gray-200 overflow-hidden">
                      {relatedBlog.featured_image ? (
                        <img
                          src={relatedBlog.featured_image}
                          alt={relatedBlog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div 
                        className="text-white font-serif text-sm font-semibold px-3 py-1 rounded-lg inline-block mb-3"
                        style={{ backgroundColor: getCategoryColor(relatedBlog.category) }}
                      >
                        {relatedBlog.category}
                      </div>
                      <h4 className="font-serif text-lg font-semibold text-black leading-tight mb-2 group-hover:text-[#355E3B] transition-colors">
                        {relatedBlog.title}
                      </h4>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{relatedBlog.read_time_minutes} min read</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to Blogs */}
        <div className="text-center mt-12">
          <Link href="/blogs">
            <button className="bg-[#355E3B] text-white font-serif text-lg px-8 py-3 rounded-[20px] hover:bg-[#2a4a2f] transition-colors">
              Browse More Blogs
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
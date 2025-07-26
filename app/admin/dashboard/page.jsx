'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Building, 
  Tags, 
  Settings, 
  LogOut, 
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  BarChart3,
  FileText,
  Eye,
  Calendar,
  Clock,
  Mail,
  UserCheck,
  TrendingUp,
  UserPlus
} from 'lucide-react';
import BusinessFormModal from '@/Components/BusinessFormModal';
import CategoryFormModal from '@/Components/CategoryFormModal';
import BlogFormModal from '@/Components/BlogFormModal';
import Link from 'next/link';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingBlog, setEditingBlog] = useState(null);
  
  const router = useRouter();

  // Check admin authentication
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      router.push('/admin/login');
      return;
    }
    
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const [businessesRes, categoriesRes, blogsRes, statsRes] = await Promise.all([
        fetch('/api/admin/businesses'),
        fetch('/api/admin/categories'),
        fetch('/api/admin/blogs'),
        fetch('/api/admin/stats')
      ]);

      const [businessesData, categoriesData, blogsData, statsData] = await Promise.all([
        businessesRes.json(),
        categoriesRes.json(),
        blogsRes.json(),
        statsRes.json()
      ]);

      setBusinesses(businessesData || []);
      setCategories(categoriesData || []);
      setBlogs(blogsData || []);
      setStats(statsData || {});
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  const deleteBusiness = async (id) => {
    if (!confirm('Are you sure you want to delete this business?')) return;
    
    try {
      const response = await fetch(`/api/admin/businesses/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setBusinesses(prev => prev.filter(b => b.id !== id));
        fetchDashboardData(); // Refresh stats
      }
    } catch (error) {
      console.error('Error deleting business:', error);
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setCategories(prev => prev.filter(c => c.id !== id));
        fetchDashboardData(); // Refresh stats
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const deleteBlog = async (id) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    
    try {
      const response = await fetch(`/api/admin/blogs/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setBlogs(prev => prev.filter(b => b.id !== id));
        fetchDashboardData(); // Refresh stats
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

  const handleBusinessSave = (savedBusiness) => {
    if (editingBusiness) {
      setBusinesses(prev => prev.map(b => b.id === savedBusiness.id ? savedBusiness : b));
    } else {
      setBusinesses(prev => [savedBusiness, ...prev]);
    }
    setEditingBusiness(null);
    fetchDashboardData(); // Refresh stats
  };

  const handleCategorySave = (savedCategory) => {
    if (editingCategory) {
      setCategories(prev => prev.map(c => c.id === savedCategory.id ? savedCategory : c));
    } else {
      setCategories(prev => [savedCategory, ...prev]);
    }
    setEditingCategory(null);
    fetchDashboardData(); // Refresh stats
  };

  const handleBlogSave = (savedBlog) => {
    if (editingBlog) {
      setBlogs(prev => prev.map(b => b.id === savedBlog.id ? savedBlog : b));
    } else {
      setBlogs(prev => [savedBlog, ...prev]);
    }
    setEditingBlog(null);
    fetchDashboardData(); // Refresh stats
  };

  const openBusinessModal = (business = null) => {
    setEditingBusiness(business);
    setShowBusinessModal(true);
  };

  const openCategoryModal = (category = null) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

 

  const filteredBusinesses = businesses.filter(business =>
    business.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBlogs = blogs.filter(blog =>
    blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.author_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#355E3B]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-serif font-bold text-gray-900">
                Admin Dashboard
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 bg-white rounded-lg shadow-sm p-6">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'overview' ? 'bg-[#355E3B] text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('businesses')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'businesses' ? 'bg-[#355E3B] text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Building className="w-4 h-4" />
                Businesses
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'categories' ? 'bg-[#355E3B] text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Tags className="w-4 h-4" />
                Categories
              </button>
              <button
                onClick={() => setActiveTab('blogs')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'blogs' ? 'bg-[#355E3B] text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                Blog Posts
              </button>
              {/* Subscribers link */}
              <Link href="/admin/subscribers">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-100">
                  <Mail className="w-4 h-4" />
                  Subscribers
                </button>
              </Link>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif font-semibold text-gray-900">Dashboard Overview</h2>
                
                {/* Main Stats Cards - Updated with subscribers */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <Building className="w-8 h-8 text-[#355E3B]" />
                      <div className="ml-4">
                        <h3 className="text-2xl font-bold text-gray-900">{stats.totalBusinesses || businesses.length}</h3>
                        <p className="text-gray-600">Total Businesses</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <Tags className="w-8 h-8 text-[#355E3B]" />
                      <div className="ml-4">
                        <h3 className="text-2xl font-bold text-gray-900">{stats.totalCategories || categories.length}</h3>
                        <p className="text-gray-600">Categories</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <FileText className="w-8 h-8 text-[#355E3B]" />
                      <div className="ml-4">
                        <h3 className="text-2xl font-bold text-gray-900">{stats.totalBlogs || blogs.length}</h3>
                        <p className="text-gray-600">Blog Posts</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Email Subscribers Card */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <Mail className="w-8 h-8 text-[#355E3B]" />
                      <div className="ml-4">
                        <h3 className="text-2xl font-bold text-gray-900">{stats.totalSubscribers || 0}</h3>
                        <p className="text-gray-600">Email Subscribers</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subscriber Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <UserCheck className="w-8 h-8 text-green-600" />
                      <div className="ml-4">
                        <h3 className="text-2xl font-bold text-gray-900">{stats.activeSubscribers || 0}</h3>
                        <p className="text-gray-600">Active Subscribers</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <UserPlus className="w-8 h-8 text-blue-600" />
                      <div className="ml-4">
                        <h3 className="text-2xl font-bold text-gray-900">{stats.recentSubscribers || 0}</h3>
                        <p className="text-gray-600">New This Month</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <TrendingUp className="w-8 h-8 text-purple-600" />
                      <div className="ml-4">
                        <h3 className="text-2xl font-bold text-gray-900">{stats.subscriberGrowthRate || 0}%</h3>
                        <p className="text-gray-600">Growth Rate</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Businesses</h3>
                      <button onClick={() => setActiveTab('businesses')}>
                        <span className="text-[#355E3B] hover:underline text-sm">View all</span>
                      </button>
                    </div>
                    <div className="space-y-3">
                      {businesses.slice(0, 5).map((business) => (
                        <div key={business.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                          <div>
                            <p className="font-medium text-gray-900">{business.name}</p>
                            <p className="text-sm text-gray-600">{business.city}, {business.state}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            business.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {business.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Blog Posts</h3>
                      <button onClick={() => setActiveTab('blogs')}>
                        <span className="text-[#355E3B] hover:underline text-sm">View all</span>
                      </button>
                    </div>
                    <div className="space-y-3">
                      {blogs.slice(0, 5).map((blog) => (
                        <div key={blog.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">{blog.title}</p>
                            <p className="text-sm text-gray-600">{blog.author_name} • {formatDate(blog.created_at)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {blog.is_featured && (
                              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                Featured
                              </span>
                            )}
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              blog.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {blog.is_published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Subscriber Sources */}
                {stats.subscribersBySource && stats.subscribersBySource.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Subscriber Sources</h3>
                      <Link href="/admin/subscribers">
                        <span className="text-[#355E3B] hover:underline text-sm">Manage subscribers</span>
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {stats.subscribersBySource.slice(0, 3).map((source) => (
                        <div key={source.source} className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-[#355E3B]">{source.count}</div>
                          <div className="text-sm text-gray-600">{source.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Businesses Tab */}
            {activeTab === 'businesses' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-serif font-semibold text-gray-900">Manage Businesses</h2>
                  <button 
                    onClick={() => openBusinessModal()}
                    className="flex items-center gap-2 bg-[#355E3B] text-white px-4 py-2 rounded-lg hover:bg-[#2a4a2f] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Business
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search businesses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355E3B] focus:border-transparent"
                  />
                </div>

                {/* Businesses Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Business
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBusinesses.map((business) => (
                        <tr key={business.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{business.name}</div>
                              <div className="text-sm text-gray-500">{business.phone}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{business.city}, {business.state}</div>
                            <div className="text-sm text-gray-500">{business.zip_code}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              business.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {business.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              {business.is_active && (
                                <a 
                                  href={`/business/${business.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Preview business page"
                                >
                                  <Eye className="w-4 h-4" />
                                </a>
                              )}
                              <button 
                                onClick={() => openBusinessModal(business)}
                                className="text-[#355E3B] hover:text-[#2a4a2f]"
                                title="Edit business"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => deleteBusiness(business.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete business"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-serif font-semibold text-gray-900">Manage Categories</h2>
                  <button 
                    onClick={() => openCategoryModal()}
                    className="flex items-center gap-2 bg-[#355E3B] text-white px-4 py-2 rounded-lg hover:bg-[#2a4a2f] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Category
                  </button>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category) => (
                    <div key={category.id} className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                          <p className="text-sm text-gray-600">/{category.slug}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openCategoryModal(category)}
                            className="text-[#355E3B] hover:text-[#2a4a2f]"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteCategory(category.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                      <div className="text-sm text-gray-500">
                        {category.businessCount || 0} businesses
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Blogs Tab */}
            {activeTab === 'blogs' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-serif font-semibold text-gray-900">Manage Blog Posts</h2>
                  <button 
                    onClick={() => openBlogModal()}
                    className="flex items-center gap-2 bg-[#355E3B] text-white px-4 py-2 rounded-lg hover:bg-[#2a4a2f] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Blog Post
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search blog posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355E3B] focus:border-transparent"
                  />
                </div>

                {/* Blogs Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Author
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stats
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBlogs.map((blog) => (
                        <tr key={blog.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="max-w-xs">
                              <div className="text-sm font-medium text-gray-900 line-clamp-2">{blog.title}</div>
                              <div className="text-sm text-gray-500">{formatDate(blog.created_at)}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{blog.author_name || 'Anonymous'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{blog.category || 'Uncategorized'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                blog.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {blog.is_published ? 'Published' : 'Draft'}
                              </span>
                              {blog.is_featured && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                  Featured
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {blog.view_count || 0}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {blog.read_time_minutes || 5}min
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              {blog.is_published && (
                                <a 
                                  href={`/blogs/${blog.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-900"
                                  title="View blog post"
                                >
                                  <Eye className="w-4 h-4" />
                                </a>
                              )}
                              <button 
                                onClick={() => openBlogModal(blog)}
                                className="text-[#355E3B] hover:text-[#2a4a2f]"
                                title="Edit blog post"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => deleteBlog(blog.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete blog post"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {filteredBlogs.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts found</h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm ? `No posts match "${searchTerm}"` : 'Get started by creating your first blog post.'}
                      </p>
                      <button 
                        onClick={() => openBlogModal()}
                        className="inline-flex items-center gap-2 bg-[#355E3B] text-white px-4 py-2 rounded-lg hover:bg-[#2a4a2f] transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Create Blog Post
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <BusinessFormModal
        isOpen={showBusinessModal}
        onClose={() => {
          setShowBusinessModal(false);
          setEditingBusiness(null);
        }}
        business={editingBusiness}
        onSave={handleBusinessSave}
        categories={categories}
      />

      <CategoryFormModal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        onSave={handleCategorySave}
      />

      <BlogFormModal
        isOpen={showBlogModal}
        onClose={() => {
          setShowBlogModal(false);
          setEditingBlog(null);
        }}
        blog={editingBlog}
        onSave={handleBlogSave}
      />

      
    </div>
  );
}
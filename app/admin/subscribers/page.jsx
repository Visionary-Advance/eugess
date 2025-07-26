'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Building, 
  Tags, 
  LogOut, 
  Plus,
  Edit,
  Trash2,
  Search,
  BarChart3,
  FileText,
  Eye,
  Clock,
  Mail,
  UserCheck,
  TrendingUp,
  UserPlus,
  Download,
  RefreshCw,
  UserX
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
  const [subscribers, setSubscribers] = useState([]);
  const [subscriberStats, setSubscriberStats] = useState({});
  const [subscriberPagination, setSubscriberPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });
  const [subscriberFilters, setSubscriberFilters] = useState({ search: '', status: 'all' });
  const [actionLoading, setActionLoading] = useState({});
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

  const fetchSubscribers = async () => {
    try {
      const params = new URLSearchParams({
        page: subscriberPagination.page.toString(),
        limit: subscriberPagination.limit.toString(),
        ...(subscriberFilters.status !== 'all' && { status: subscriberFilters.status }),
        ...(subscriberFilters.search && { search: subscriberFilters.search })
      });

      const response = await fetch(`/api/subscribe?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setSubscribers(data.subscribers || []);
        setSubscriberPagination(data.pagination || { page: 1, limit: 50, total: 0, pages: 0 });
        setSubscriberStats(data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    }
  };

  // Fetch subscribers when switching to subscribers tab
  useEffect(() => {
    if (activeTab === 'subscribers') {
      fetchSubscribers();
    }
  }, [activeTab, subscriberPagination.page, subscriberFilters]);

  const updateSubscriberStatus = async (id, newStatus) => {
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      const response = await fetch(`/api/admin/subscribers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await fetchSubscribers();
        await fetchDashboardData(); // Refresh overall stats
      }
    } catch (error) {
      console.error('Error updating subscriber:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const deleteSubscriber = async (id) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) return;
    
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      const response = await fetch(`/api/admin/subscribers/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchSubscribers();
        await fetchDashboardData(); // Refresh overall stats
      }
    } catch (error) {
      console.error('Error deleting subscriber:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleSubscriberSearch = (e) => {
    e.preventDefault();
    setSubscriberPagination(prev => ({ ...prev, page: 1 }));
    fetchSubscribers();
  };

  const exportSubscribers = async () => {
    try {
      const response = await fetch('/api/admin/subscribers/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting subscribers:', error);
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

  const openBlogModal = (blog = null) => {
    setEditingBlog(blog);
    setShowBlogModal(true);
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800 border-green-300',
      unsubscribed: 'bg-red-100 text-red-800 border-red-300'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
        {status}
      </span>
    );
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
              <button
                onClick={() => setActiveTab('subscribers')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === 'subscribers' ? 'bg-[#355E3B] text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Mail className="w-4 h-4" />
                Subscribers
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif font-semibold text-gray-900">Dashboard Overview</h2>
                
                {/* Main Stats Cards */}
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
                            <button 
                              onClick={() => openBusinessModal(business)}
                              className="text-[#355E3B] hover:text-[#2a4a2f] mr-4"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => deleteBusiness(business.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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

            {/* Subscribers Tab */}
            {activeTab === 'subscribers' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-serif font-semibold text-gray-900">Email Subscribers</h2>
                  <button 
                    onClick={exportSubscribers}
                    className="flex items-center gap-2 bg-[#355E3B] text-white px-4 py-2 rounded-lg hover:bg-[#2a4a2f] transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>

                {/* Subscriber Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Subscribers</p>
                        <p className="text-2xl font-bold text-gray-900">{subscriberStats.total || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <UserCheck className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Active</p>
                        <p className="text-2xl font-bold text-gray-900">{subscriberStats.active || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <UserX className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Unsubscribed</p>
                        <p className="text-2xl font-bold text-gray-900">{subscriberStats.unsubscribed || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <form onSubmit={handleSubscriberSearch} className="flex flex-col sm:flex-row gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search by email..."
                          value={subscriberFilters.search}
                          onChange={(e) => setSubscriberFilters(prev => ({ ...prev, search: e.target.value }))}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355E3B] focus:border-transparent"
                        />
                      </div>
                      
                      <select
                        value={subscriberFilters.status}
                        onChange={(e) => setSubscriberFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355E3B] focus:border-transparent"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="unsubscribed">Unsubscribed</option>
                      </select>
                      
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#355E3B] text-white rounded-lg hover:bg-[#2a4a2f] transition-colors"
                      >
                        Filter
                      </button>
                    </form>

                    <button
                      onClick={fetchSubscribers}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                  </div>
                </div>

                {/* Subscribers Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Source
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Subscribed Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {subscribers.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                              <Mail className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                              <p className="text-lg font-medium">No subscribers found</p>
                              <p>Try adjusting your search filters</p>
                            </td>
                          </tr>
                        ) : (
                          subscribers.map((subscriber) => (
                            <tr key={subscriber.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{subscriber.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-500 capitalize">
                                  {subscriber.source?.replace('_', ' ') || 'Unknown'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(subscriber.status)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(subscriber.subscribed_at || subscriber.created_at)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center gap-2">
                                  {subscriber.status === 'active' ? (
                                    <button
                                      onClick={() => updateSubscriberStatus(subscriber.id, 'unsubscribed')}
                                      disabled={actionLoading[subscriber.id]}
                                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                      title="Unsubscribe"
                                    >
                                      <UserX className="w-4 h-4" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => updateSubscriberStatus(subscriber.id, 'active')}
                                      disabled={actionLoading[subscriber.id]}
                                      className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                      title="Reactivate"
                                    >
                                      <UserCheck className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deleteSubscriber(subscriber.id)}
                                    disabled={actionLoading[subscriber.id]}
                                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {subscriberPagination.pages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          Showing {((subscriberPagination.page - 1) * subscriberPagination.limit) + 1} to {Math.min(subscriberPagination.page * subscriberPagination.limit, subscriberPagination.total)} of {subscriberPagination.total} results
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSubscriberPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            disabled={subscriberPagination.page === 1}
                            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          
                          {/* Page numbers */}
                          {[...Array(Math.min(5, subscriberPagination.pages))].map((_, i) => {
                            const pageNum = Math.max(1, subscriberPagination.page - 2) + i;
                            if (pageNum > subscriberPagination.pages) return null;
                            
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setSubscriberPagination(prev => ({ ...prev, page: pageNum }))}
                                className={`px-3 py-2 border rounded-lg ${
                                  pageNum === subscriberPagination.page
                                    ? 'bg-[#355E3B] text-white border-[#355E3B]'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                          
                          <button
                            onClick={() => setSubscriberPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            disabled={subscriberPagination.page === subscriberPagination.pages}
                            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      </div>
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
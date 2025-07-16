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
  BarChart3
} from 'lucide-react';
import BusinessFormModal from '@/Components/BusinessFormModal';
import CategoryFormModal from '@/Components/CategoryFormModal';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  
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
      const [businessesRes, categoriesRes, statsRes] = await Promise.all([
        fetch('/api/admin/businesses'),
        fetch('/api/admin/categories'),
        fetch('/api/admin/stats')
      ]);

      const [businessesData, categoriesData, statsData] = await Promise.all([
        businessesRes.json(),
        categoriesRes.json(),
        statsRes.json()
      ]);

      setBusinesses(businessesData || []);
      setCategories(categoriesData || []);
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

  const handleBusinessSave = (savedBusiness) => {
    if (editingBusiness) {
      // Update existing business
      setBusinesses(prev => prev.map(b => b.id === savedBusiness.id ? savedBusiness : b));
    } else {
      // Add new business
      setBusinesses(prev => [savedBusiness, ...prev]);
    }
    setEditingBusiness(null);
    fetchDashboardData(); // Refresh stats
  };

  const handleCategorySave = (savedCategory) => {
    if (editingCategory) {
      // Update existing category
      setCategories(prev => prev.map(c => c.id === savedCategory.id ? savedCategory : c));
    } else {
      // Add new category
      setCategories(prev => [savedCategory, ...prev]);
    }
    setEditingCategory(null);
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
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif font-semibold text-gray-900">Dashboard Overview</h2>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      <Users className="w-8 h-8 text-[#355E3B]" />
                      <div className="ml-4">
                        <h3 className="text-2xl font-bold text-gray-900">{stats.activeBusinesses || businesses.filter(b => b.is_active).length}</h3>
                        <p className="text-gray-600">Active Businesses</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Businesses</h3>
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
    </div>
  );
}
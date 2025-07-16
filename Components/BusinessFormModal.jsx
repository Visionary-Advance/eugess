import { useState, useEffect } from 'react';
import { X, Save, Loader } from 'lucide-react';

export default function BusinessFormModal({ 
  isOpen, 
  onClose, 
  business = null, 
  onSave,
  categories = [] 
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    phone: '',
    email: '',
    website: '',
    street_address: '',
    city: 'Eugene',
    state: 'Oregon',
    zip_code: '',
    price_level: 1,
    is_active: true,
    is_featured: false,
    is_verified: false,
    has_takeout: false,
    has_delivery: false,
    has_outdoor_seating: false,
    is_wheelchair_accessible: false,
    has_wifi: false,
    is_pet_friendly: false,
    has_parking: false,
    cuisine_type: '',
    categories: []
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (business) {
        // Edit mode - populate with existing business data
        setFormData({
          name: business.name || '',
          description: business.description || '',
          short_description: business.short_description || '',
          phone: business.phone || '',
          email: business.email || '',
          website: business.website || '',
          street_address: business.street_address || '',
          city: business.city || 'Eugene',
          state: business.state || 'Oregon',
          zip_code: business.zip_code || '',
          price_level: business.price_level || 1,
          is_active: business.is_active !== false,
          is_featured: business.is_featured === true,
          is_verified: business.is_verified === true,
          has_takeout: business.has_takeout === true,
          has_delivery: business.has_delivery === true,
          has_outdoor_seating: business.has_outdoor_seating === true,
          is_wheelchair_accessible: business.is_wheelchair_accessible === true,
          has_wifi: business.has_wifi === true,
          is_pet_friendly: business.is_pet_friendly === true,
          has_parking: business.has_parking === true,
          categories: business.categories || []
        });
      } else {
        // Add mode - reset to defaults
        setFormData({
          name: '',
          description: '',
          short_description: '',
          phone: '',
          email: '',
          website: '',
          street_address: '',
          city: 'Eugene',
          state: 'Oregon',
          zip_code: '',
          price_level: 1,
          is_active: true,
          is_featured: false,
          is_verified: false,
          has_takeout: false,
          has_delivery: false,
          has_outdoor_seating: false,
          is_wheelchair_accessible: false,
          has_wifi: false,
          is_pet_friendly: false,
          has_parking: false,
          cuisine_type: '',
          categories: []
        });
      }
      setErrors({});
    }
  }, [isOpen, business]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let processedValue = value;
    
    // Convert numeric fields to numbers
    if (name === 'price_level') {
      processedValue = parseInt(value, 10);
    } else if (type === 'checkbox') {
      processedValue = checked;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCategoryChange = (categoryId, checked) => {
    setFormData(prev => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, categoryId]
        : prev.categories.filter(id => id !== categoryId)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Business name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.street_address.trim()) newErrors.street_address = 'Address is required';
    if (!formData.zip_code.trim()) newErrors.zip_code = 'ZIP code is required';
    
    if (formData.email && !formData.email.includes('@')) {
      newErrors.email = 'Valid email is required';
    }
    
    if (formData.website && !formData.website.startsWith('http')) {
      newErrors.website = 'Website must start with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const method = business ? 'PUT' : 'POST';
      const url = business 
        ? `/api/admin/businesses/${business.id}` 
        : '/api/admin/businesses';
      
      // Ensure numeric fields are numbers
      const submitData = {
        ...formData,
        price_level: parseInt(formData.price_level, 10)
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const savedBusiness = await response.json();
        onSave(savedBusiness);
        onClose();
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.error || 'Failed to save business' });
      }
    } catch (error) {
      console.error('Error saving business:', error);
      setErrors({ submit: 'An error occurred while saving' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-serif font-semibold text-gray-900">
            {business ? 'Edit Business' : 'Add New Business'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#355E3B] focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter business name"
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description
                </label>
                <textarea
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355E3B] focus:border-transparent"
                  placeholder="Brief description (150 characters)"
                  maxLength={150}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355E3B] focus:border-transparent"
                  placeholder="Detailed description of the business"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Level
                </label>
                <select
                  name="price_level"
                  value={formData.price_level}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355E3B] focus:border-transparent"
                >
                  <option value={1}>$ - Budget Friendly</option>
                  <option value={2}>$$ - Mid Range</option>
                  <option value={3}>$$$ - Upscale</option>
                  <option value={4}>$$$$ - Fine Dining</option>
                </select>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#355E3B] focus:border-transparent ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="(555) 123-4567"
                />
                {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#355E3B] focus:border-transparent ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="business@example.com"
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#355E3B] focus:border-transparent ${
                    errors.website ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="https://www.example.com"
                />
                {errors.website && <p className="text-red-600 text-sm mt-1">{errors.website}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="street_address"
                  value={formData.street_address}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#355E3B] focus:border-transparent ${
                    errors.street_address ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="123 Main Street"
                />
                {errors.street_address && <p className="text-red-600 text-sm mt-1">{errors.street_address}</p>}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355E3B] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355E3B] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#355E3B] focus:border-transparent ${
                      errors.zip_code ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.zip_code && <p className="text-red-600 text-sm mt-1">{errors.zip_code}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cuisine Type
                </label>
                <select
                  name="cuisine_type"
                  value={formData.cuisine_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355E3B] focus:border-transparent"
                >
                  {cuisineOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Features & Amenities */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Features & Amenities</h3>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'has_takeout', label: 'Takeout Available' },
                  { key: 'has_delivery', label: 'Delivery Available' },
                  { key: 'has_outdoor_seating', label: 'Outdoor Seating' },
                  { key: 'is_wheelchair_accessible', label: 'Wheelchair Accessible' },
                  { key: 'has_wifi', label: 'Free WiFi' },
                  { key: 'is_pet_friendly', label: 'Pet Friendly' },
                  { key: 'has_parking', label: 'Parking Available' }
                ].map((feature) => (
                  <label key={feature.key} className="flex items-center">
                    <input
                      type="checkbox"
                      name={feature.key}
                      checked={Boolean(formData[feature.key])}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#355E3B] border-gray-300 rounded focus:ring-[#355E3B]"
                    />
                    <span className="ml-2 text-sm text-gray-700">{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Categories & Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Categories & Status</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(category.id)}
                        onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                        className="w-4 h-4 text-[#355E3B] border-gray-300 rounded focus:ring-[#355E3B]"
                      />
                      <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={Boolean(formData.is_active)}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#355E3B] border-gray-300 rounded focus:ring-[#355E3B]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active (visible to users)</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={Boolean(formData.is_featured)}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#355E3B] border-gray-300 rounded focus:ring-[#355E3B]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_verified"
                    checked={Boolean(formData.is_verified)}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#355E3B] border-gray-300 rounded focus:ring-[#355E3B]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Verified</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                loading
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-[#355E3B] text-white hover:bg-[#2a4a2f]'
              }`}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {business ? 'Update Business' : 'Add Business'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
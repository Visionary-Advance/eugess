import { useState, useEffect } from 'react';
import { X, Save, Loader, Clock } from 'lucide-react';

// Define cuisine options array
const cuisineOptions = [
  { value: '', label: 'Select Cuisine Type...' },
  // Asian Cuisines
  { value: 'japanese', label: 'Japanese' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'thai', label: 'Thai' },
  { value: 'vietnamese', label: 'Vietnamese' },
  { value: 'korean', label: 'Korean' },
  { value: 'indian', label: 'Indian' },
  { value: 'asian_fusion', label: 'Asian Fusion' },
  
  // Mexican
  { value: 'mexican', label: 'Mexican' },
  
  // European
  { value: 'italian', label: 'Italian' },
  { value: 'french', label: 'French' },
  { value: 'german', label: 'German' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'greek', label: 'Greek' },
  { value: 'spanish', label: 'Spanish' },
  
  // American
  { value: 'american_classic', label: 'American Classic' },
  { value: 'southern_bbq', label: 'Southern/BBQ' },
  { value: 'burgers', label: 'Burgers & Fries' },
  { value: 'sandwiches', label: 'Sandwiches & Delis' },
  { value: 'steakhouse', label: 'Steakhouse' },
  
  // Dietary/Style
  { value: 'vegetarian_vegan', label: 'Vegetarian/Vegan' },
  { value: 'healthy_fresh', label: 'Healthy/Fresh' },
  { value: 'farm_to_table', label: 'Farm-to-Table' },
  { value: 'seafood', label: 'Seafood' },
  { value: 'pizza', label: 'Pizza' },
  { value: 'breakfast_brunch', label: 'Breakfast/Brunch' },
  { value: 'desserts', label: 'Desserts/Sweets' },
  
  // Beverages
  { value: 'coffee_espresso', label: 'Coffee/Espresso' },
  { value: 'bubble_tea', label: 'Bubble Tea' },
  { value: 'breweries_beer', label: 'Breweries/Beer' },
  { value: 'wine_bars', label: 'Wine Bars' },
  { value: 'cocktails_bars', label: 'Cocktails/Bars' }
];

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const defaultHours = dayNames.map((day, index) => ({
  day_of_week: index,
  day_name: day,
  is_closed: false,
  is_24_hours: false,
  open_time: '09:00',
  close_time: '17:00'
}));

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
    neighborhood_id: '',
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
  
  const [businessHours, setBusinessHours] = useState(defaultHours);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' or 'hours'

  // Fetch neighborhoods when component mounts
  useEffect(() => {
    async function fetchNeighborhoods() {
      try {
        const response = await fetch('/api/admin/neighborhoods');
        const data = await response.json();
        setNeighborhoods(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching neighborhoods:', error);
        setNeighborhoods([]);
      }
    }

    if (isOpen) {
      fetchNeighborhoods();
    }
  }, [isOpen]);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (business) {
        // Edit mode - populate with existing business data
        const loadBusinessData = async () => {
          let businessCategories = business.categories || [];
          let existingHours = defaultHours;
          
          // If categories aren't provided, fetch them from the API
          if (!business.categories && business.id) {
            try {
              const response = await fetch(`/api/admin/businesses/${business.id}`);
              if (response.ok) {
                const businessData = await response.json();
                businessCategories = businessData.categories || [];
              }
            } catch (error) {
              console.error('Error fetching business categories:', error);
            }
          }

          // Fetch existing business hours
          if (business.id) {
            try {
              const hoursResponse = await fetch(`/api/businesses/${business.id}/hours`);
              if (hoursResponse.ok) {
                const hoursData = await hoursResponse.json();
                if (hoursData && hoursData.length > 0) {
                  existingHours = dayNames.map((day, index) => {
                    const existingHour = hoursData.find(h => h.day_of_week === index);
                    if (existingHour) {
                      return {
                        day_of_week: index,
                        day_name: day,
                        is_closed: existingHour.is_closed || false,
                        is_24_hours: existingHour.is_24_hours || false,
                        open_time: existingHour.open_time || '09:00',
                        close_time: existingHour.close_time || '17:00'
                      };
                    }
                    return {
                      day_of_week: index,
                      day_name: day,
                      is_closed: false,
                      is_24_hours: false,
                      open_time: '09:00',
                      close_time: '17:00'
                    };
                  });
                }
              }
            } catch (error) {
              console.error('Error fetching business hours:', error);
            }
          }

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
            neighborhood_id: business.neighborhood_id || '',
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
            cuisine_type: business.cuisine_type || '',
            categories: businessCategories
          });

          setBusinessHours(existingHours);
        };

        loadBusinessData();
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
          neighborhood_id: '',
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
        setBusinessHours(defaultHours);
      }
      setErrors({});
      setActiveTab('basic');
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

  const handleHoursChange = (dayIndex, field, value) => {
    setBusinessHours(prev => prev.map(hour => {
      if (hour.day_of_week === dayIndex) {
        const updatedHour = { ...hour, [field]: value };
        
        // If setting to 24 hours, clear open/close times
        if (field === 'is_24_hours' && value) {
          updatedHour.open_time = null;
          updatedHour.close_time = null;
          updatedHour.is_closed = false;
        }
        
        // If setting to closed, clear other options
        if (field === 'is_closed' && value) {
          updatedHour.is_24_hours = false;
        }
        
        return updatedHour;
      }
      return hour;
    }));
  };

  const copyHoursToAll = (dayIndex) => {
    const sourceHours = businessHours[dayIndex];
    setBusinessHours(prev => prev.map(hour => ({
      ...hour,
      is_closed: sourceHours.is_closed,
      is_24_hours: sourceHours.is_24_hours,
      open_time: sourceHours.open_time,
      close_time: sourceHours.close_time
    })));
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

    // Validate hours
    businessHours.forEach((hour, index) => {
      if (!hour.is_closed && !hour.is_24_hours) {
        if (!hour.open_time) {
          newErrors[`hour_${index}_open`] = 'Open time is required';
        }
        if (!hour.close_time) {
          newErrors[`hour_${index}_close`] = 'Close time is required';
        }
      }
    });

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
        
        // Save business hours
        try {
          const hoursResponse = await fetch(`/api/admin/businesses/${savedBusiness.id}/hours`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ hours: businessHours }),
          });

          if (!hoursResponse.ok) {
            const hoursErrorData = await hoursResponse.json().catch(() => ({}));
            console.error('Error saving business hours:', {
              status: hoursResponse.status,
              statusText: hoursResponse.statusText,
              error: hoursErrorData,
              businessId: savedBusiness.id,
              hours: businessHours
            });
            // Don't fail the entire operation, just log the error
            setErrors(prev => ({ 
              ...prev, 
              hoursWarning: `Business saved successfully, but hours could not be saved: ${hoursErrorData.error || 'Unknown error'}` 
            }));
          } else {
            const hoursResult = await hoursResponse.json();
            console.log('Business hours saved successfully:', hoursResult);
          }
        } catch (hoursError) {
          console.error('Exception while saving business hours:', hoursError);
          setErrors(prev => ({ 
            ...prev, 
            hoursWarning: `Business saved successfully, but hours could not be saved: ${hoursError.message}` 
          }));
        }

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
      <div className="bg-white rounded-lg text-black shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
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

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('basic')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'basic'
                  ? 'border-[#355E3B] text-[#355E3B]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Basic Information
            </button>
            <button
              onClick={() => setActiveTab('hours')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'hours'
                  ? 'border-[#355E3B] text-[#355E3B]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Clock className="w-4 h-4" />
              Business Hours
            </button>
          </nav>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {activeTab === 'basic' && (
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
                    className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-[#355E3B] focus:border-transparent ${
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-[#355E3B] focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-[#355E3B] focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-[#355E3B] focus:border-transparent"
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
                    className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-[#355E3B] focus:border-transparent ${
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
                    className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-[#355E3B] focus:border-transparent ${
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
                    className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-[#355E3B] focus:border-transparent ${
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
                    className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-[#355E3B] focus:border-transparent ${
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-[#355E3B] focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-[#355E3B] focus:border-transparent"
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
                      className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-[#355E3B] focus:border-transparent ${
                        errors.zip_code ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.zip_code && <p className="text-red-600 text-sm mt-1">{errors.zip_code}</p>}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Neighborhood
                  </label>
                  <select
                    name="neighborhood_id"
                    value={formData.neighborhood_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-[#355E3B] focus:border-transparent"
                  >
                    <option value="">Select Neighborhood...</option>
                    {neighborhoods.map((neighborhood) => (
                      <option key={neighborhood.id} value={neighborhood.id}>
                        {neighborhood.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cuisine Type
                  </label>
                  <select
                    name="cuisine_type"
                    value={formData.cuisine_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-[#355E3B] focus:border-transparent"
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
                  <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg text-black p-3">
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
          )}

          {activeTab === 'hours' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Business Hours</h3>
                <p className="text-sm text-gray-600">Set your operating hours for each day of the week</p>
              </div>

              <div className="space-y-4">
                {businessHours.map((hour, index) => (
                  <div key={hour.day_of_week} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 w-24">{hour.day_name}</h4>
                      <button
                        type="button"
                        onClick={() => copyHoursToAll(index)}
                        className="text-xs text-[#355E3B] hover:underline"
                      >
                        Copy to all days
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      {/* Closed Checkbox */}
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={hour.is_closed}
                          onChange={(e) => handleHoursChange(index, 'is_closed', e.target.checked)}
                          className="w-4 h-4 text-[#355E3B] border-gray-300 rounded focus:ring-[#355E3B]"
                        />
                        <span className="ml-2 text-sm text-gray-700">Closed</span>
                      </label>

                      {/* 24 Hours Checkbox */}
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={hour.is_24_hours}
                          disabled={hour.is_closed}
                          onChange={(e) => handleHoursChange(index, 'is_24_hours', e.target.checked)}
                          className="w-4 h-4 text-[#355E3B] border-gray-300 rounded focus:ring-[#355E3B] disabled:opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">24 Hours</span>
                      </label>

                      {/* Open Time */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Open Time</label>
                        <input
                          type="time"
                          value={hour.open_time || ''}
                          disabled={hour.is_closed || hour.is_24_hours}
                          onChange={(e) => handleHoursChange(index, 'open_time', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-[#355E3B] focus:border-transparent disabled:opacity-50 disabled:bg-gray-100 ${
                            errors[`hour_${index}_open`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors[`hour_${index}_open`] && (
                          <p className="text-red-600 text-xs mt-1">{errors[`hour_${index}_open`]}</p>
                        )}
                      </div>

                      {/* Close Time */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Close Time</label>
                        <input
                          type="time"
                          value={hour.close_time || ''}
                          disabled={hour.is_closed || hour.is_24_hours}
                          onChange={(e) => handleHoursChange(index, 'close_time', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-[#355E3B] focus:border-transparent disabled:opacity-50 disabled:bg-gray-100 ${
                            errors[`hour_${index}_close`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors[`hour_${index}_close`] && (
                          <p className="text-red-600 text-xs mt-1">{errors[`hour_${index}_close`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBusinessHours(prev => prev.map(hour => ({
                        ...hour,
                        is_closed: false,
                        is_24_hours: false,
                        open_time: '09:00',
                        close_time: '17:00'
                      })));
                    }}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Set All 9 AM - 5 PM
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBusinessHours(prev => prev.map(hour => ({
                        ...hour,
                        is_closed: false,
                        is_24_hours: false,
                        open_time: '08:00',
                        close_time: '22:00'
                      })));
                    }}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Set All 8 AM - 10 PM
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBusinessHours(prev => prev.map((hour, index) => ({
                        ...hour,
                        is_closed: index === 0, // Close on Sunday
                        is_24_hours: false,
                        open_time: index === 0 ? null : '09:00',
                        close_time: index === 0 ? null : '17:00'
                      })));
                    }}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Mon-Sat 9-5, Closed Sunday
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBusinessHours(prev => prev.map(hour => ({
                        ...hour,
                        is_closed: true,
                        is_24_hours: false,
                        open_time: null,
                        close_time: null
                      })));
                    }}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Close All Days
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          {/* Hours Warning */}
          {errors.hoursWarning && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  {errors.hoursWarning}
                </div>
              </div>
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
              className={`px-6 py-2 rounded-lg text-black transition-colors flex items-center gap-2 ${
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
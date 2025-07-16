import { useState, useEffect } from 'react';
import { X, Save, Loader } from 'lucide-react';

export default function CategoryFormModal({ 
  isOpen, 
  onClose, 
  category = null, 
  onSave 
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    color: '#355E3B',
    sort_order: 0,
    is_active: true
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Available icons for selection
  const iconOptions = [
    { value: 'ChefHat', label: '👨‍🍳 Chef Hat (Restaurants)' },
    { value: 'Coffee', label: '☕ Coffee (Coffee Shops)' },
    { value: 'Truck', label: '🚚 Truck (Food Trucks)' },
    { value: 'ShoppingCart', label: '🛒 Shopping Cart (Grocery)' },
    { value: 'Beer', label: '🍺 Beer (Breweries/Bars)' },
    { value: 'UtensilsCrossed', label: '🍽️ Utensils (Fast Food)' },
    { value: 'Store', label: '🏪 Store (Retail)' },
    { value: 'Cake', label: '🍰 Cake (Bakeries)' }
  ];

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (category) {
        // Edit mode - populate with existing category data
        setFormData({
          name: category.name || '',
          description: category.description || '',
          icon: category.icon || '',
          color: category.color || '#355E3B',
          sort_order: category.sort_order || 0,
          is_active: category.is_active !== false
        });
      } else {
        // Add mode - reset to defaults
        setFormData({
          name: '',
          description: '',
          icon: '',
          color: '#355E3B',
          sort_order: 0,
          is_active: true
        });
      }
      setErrors({});
    }
  }, [isOpen, category]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }
    
    // Check if name already exists (you'd need to pass existing categories)
    // if (existingCategories.some(cat => cat.name.toLowerCase() === formData.name.toLowerCase() && cat.id !== category?.id)) {
    //   newErrors.name = 'Category name already exists';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const method = category ? 'PUT' : 'POST';
      const url = category 
        ? `/api/admin/categories/${category.id}` 
        : '/api/admin/categories';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const savedCategory = await response.json();
        onSave(savedCategory);
        onClose();
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.error || 'Failed to save category' });
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setErrors({ submit: 'An error occurred while saving' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-serif font-semibold text-gray-900">
            {category ? 'Edit Category' : 'Add New Category'}
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
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#355E3B] focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter category name (e.g., Restaurants, Coffee Shops)"
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                <p className="text-gray-500 text-sm mt-1">
                  The URL slug will be automatically generated from this name
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355E3B] focus:border-transparent"
                  placeholder="Brief description of this category"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon
                  </label>
                  <select
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355E3B] focus:border-transparent"
                  >
                    <option value="">Select an icon...</option>
                    {iconOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-gray-500 text-sm mt-1">
                    This icon will be displayed on category cards
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355E3B] focus:border-transparent"
                      placeholder="#355E3B"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355E3B] focus:border-transparent"
                  placeholder="0"
                />
                <p className="text-gray-500 text-sm mt-1">
                  Lower numbers appear first in category lists
                </p>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#355E3B] border-gray-300 rounded focus:ring-[#355E3B]"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Active (visible to users)
                  </span>
                </label>
              </div>
            </div>

            {/* Preview */}
            {(formData.name || formData.icon) && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-16 h-16 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: formData.color || '#355E3B' }}
                    >
                      {formData.icon ? (
                        <span className="text-white text-2xl">
                          {formData.icon === 'ChefHat' && '👨‍🍳'}
                          {formData.icon === 'Coffee' && '☕'}
                          {formData.icon === 'Truck' && '🚚'}
                          {formData.icon === 'ShoppingCart' && '🛒'}
                          {formData.icon === 'Beer' && '🍺'}
                          {formData.icon === 'UtensilsCrossed' && '🍽️'}
                          {formData.icon === 'Store' && '🏪'}
                          {formData.icon === 'Cake' && '🍰'}
                        </span>
                      ) : (
                        <span className="text-white text-sm">Icon</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {formData.name || 'Category Name'}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {formData.description || 'Category description will appear here'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                  {category ? 'Update Category' : 'Add Category'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
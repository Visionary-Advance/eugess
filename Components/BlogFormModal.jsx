// Components/BlogFormModal.jsx
import { useState, useEffect } from 'react';
import { X, Save, Loader, Upload, Image as ImageIcon } from 'lucide-react';

export default function BlogFormModal({ 
  isOpen, 
  onClose, 
  blog = null, 
  onSave 
}) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    featured_image: '',
    author_name: '',
    category: '',
    tags: [],
    read_time_minutes: 5,
    is_published: false,
    is_featured: false,
    meta_title: '',
    meta_description: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  // Category options
  const categoryOptions = [
    { value: '', label: 'Select Category...' },
    { value: 'Community Vote', label: 'Community Vote' },
    { value: 'Restaurant Review', label: 'Restaurant Review' },
    { value: 'Food Guide', label: 'Food Guide' },
    { value: 'Local Events', label: 'Local Events' },
    { value: 'Tips & Guides', label: 'Tips & Guides' },
    { value: 'Behind the Scenes', label: 'Behind the Scenes' },
    { value: 'Chef Interviews', label: 'Chef Interviews' },
    { value: 'Seasonal', label: 'Seasonal' },
    { value: 'News', label: 'News' }
  ];

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (blog) {
        setFormData({
          title: blog.title || '',
          content: blog.content || '',
          excerpt: blog.excerpt || '',
          featured_image: blog.featured_image || '',
          author_name: blog.author_name || '',
          category: blog.category || '',
          tags: Array.isArray(blog.tags) ? blog.tags : [],
          read_time_minutes: blog.read_time_minutes || 5,
          is_published: blog.is_published !== false,
          is_featured: blog.is_featured === true,
          meta_title: blog.meta_title || '',
          meta_description: blog.meta_description || ''
        });
        setImagePreview(blog.featured_image || '');
      } else {
        setFormData({
          title: '',
          content: '',
          excerpt: '',
          featured_image: '',
          author_name: '',
          category: '',
          tags: [],
          read_time_minutes: 5,
          is_published: false,
          is_featured: false,
          meta_title: '',
          meta_description: ''
        });
        setImagePreview('');
      }
      setErrors({});
    }
  }, [isOpen, blog]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTagsChange = (e) => {
    const tagString = e.target.value;
    const tags = tagString.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Please select an image file' }));
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image must be smaller than 5MB' }));
      return;
    }

    setImageUploading(true);
    setErrors(prev => ({ ...prev, image: '' }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'your_upload_preset');
      formData.append('folder', 'eugene-essentials/blogs');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      
      setFormData(prev => ({ ...prev, featured_image: data.secure_url }));
      setImagePreview(data.secure_url);
    } catch (error) {
      console.error('Error uploading image:', error);
      setErrors(prev => ({ ...prev, image: 'Failed to upload image. Please try again.' }));
    } finally {
      setImageUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (!formData.excerpt.trim()) newErrors.excerpt = 'Excerpt is required';
    if (!formData.author_name.trim()) newErrors.author_name = 'Author name is required';
    if (!formData.category) newErrors.category = 'Category is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const method = blog ? 'PUT' : 'POST';
      const url = blog 
        ? `/api/admin/blogs/${blog.id}` 
        : '/api/blogs';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const savedBlog = await response.json();
        onSave(savedBlog);
        onClose();
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.error || 'Failed to save blog' });
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      setErrors({ submit: 'An error occurred while saving' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg text-black shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-serif font-semibold text-gray-900">
            {blog ? 'Edit Blog Post' : 'Create New Blog Post'}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-[#355E3B] focus:border-transparent ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter blog title"
                />
                {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Excerpt *
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-[#355E3B] focus:border-transparent ${
                    errors.excerpt ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Brief description of the blog post"
                  maxLength={500}
                />
                {errors.excerpt && <p className="text-red-600 text-sm mt-1">{errors.excerpt}</p>}
                <p className="text-gray-500 text-sm mt-1">{formData.excerpt.length}/500 characters</p>
              </div>

              {/* Category and Author */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-[#355E3B] focus:border-transparent ${
                      errors.category ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Author Name *
                  </label>
                  <input
                    type="text"
                    name="author_name"
                    value={formData.author_name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-[#355E3B] focus:border-transparent ${
                      errors.author_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Author name"
                  />
                  {errors.author_name && <p className="text-red-600 text-sm mt-1">{errors.author_name}</p>}
                </div>
              </div>

              {/* Tags and Read Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={formData.tags.join(', ')}
                    onChange={handleTagsChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-[#355E3B] focus:border-transparent"
                    placeholder="Tag1, Tag2, Tag3"
                  />
                  <p className="text-gray-500 text-sm mt-1">Separate tags with commas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Read Time (minutes)
                  </label>
                  <input
                    type="number"
                    name="read_time_minutes"
                    value={formData.read_time_minutes}
                    onChange={handleInputChange}
                    min="1"
                    max="60"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-[#355E3B] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Publishing Options */}
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_published"
                    checked={formData.is_published}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#355E3B] border-gray-300 rounded focus:ring-[#355E3B]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Publish immediately</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#355E3B] border-gray-300 rounded focus:ring-[#355E3B]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured post</span>
                </label>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Featured Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setFormData(prev => ({ ...prev, featured_image: '' }));
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <div>
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            {imageUploading ? 'Uploading...' : 'Upload an image'}
                          </span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={imageUploading}
                          />
                        </label>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  )}
                </div>
                {errors.image && <p className="text-red-600 text-sm mt-1">{errors.image}</p>}
              </div>

              {/* SEO Fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">SEO Settings</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-[#355E3B] focus:border-transparent"
                    placeholder="SEO title (optional)"
                    maxLength={60}
                  />
                  <p className="text-gray-500 text-sm mt-1">{formData.meta_title.length}/60 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-[#355E3B] focus:border-transparent"
                    placeholder="SEO description (optional)"
                    maxLength={160}
                  />
                  <p className="text-gray-500 text-sm mt-1">{formData.meta_description.length}/160 characters</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={12}
              className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-[#355E3B] focus:border-transparent ${
                errors.content ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Write your blog content here..."
            />
            {errors.content && <p className="text-red-600 text-sm mt-1">{errors.content}</p>}
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
              disabled={loading || imageUploading}
              className={`px-6 py-2 rounded-lg text-black transition-colors flex items-center gap-2 ${
                loading || imageUploading
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
                  {blog ? 'Update Blog' : 'Create Blog'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
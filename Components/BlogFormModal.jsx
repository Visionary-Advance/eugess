// Updated Components/BlogFormModal.jsx - Fixed Tags Issue
import { useState, useEffect } from 'react';
import { X, Save, Loader, Upload, Image as ImageIcon } from 'lucide-react';
import RichTextEditor from './RichTextEditor';

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
  const [contentLoading, setContentLoading] = useState(false);
  const [tagsInput, setTagsInput] = useState(''); // Separate state for tags input
  const [categoryOptions, setCategoryOptions] = useState([
    { value: '', label: 'Select Category...' }
  ]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      // Fetch categories when modal opens
      fetchCategories();
      
      if (blog) {
        console.log('Loading existing blog data:', blog);
        
        // If we have a blog ID but no content, fetch the full blog data
        if (blog.id && !blog.content) {
          setContentLoading(true);
          fetchFullBlogData(blog.id);
        } else {
          // We have full blog data, populate the form
          populateFormData(blog);
        }
      } else {
        // Add mode - reset to defaults
        resetFormData();
      }
      setErrors({});
    }
  }, [isOpen, blog]);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await fetch('/api/blog-categories');
      if (response.ok) {
        const categories = await response.json();
        const categoryOptions = [
          { value: '', label: 'Select Category...' },
          ...categories.map(cat => ({
            value: cat.name,
            label: cat.name,
            color: cat.color // Could be useful for styling later
          }))
        ];
        setCategoryOptions(categoryOptions);
        console.log('Loaded categories:', categoryOptions);
      } else {
        console.error('Failed to fetch categories');
        // Keep default option if fetch fails
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Keep default option if fetch fails
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchFullBlogData = async (blogId) => {
    try {
      const response = await fetch(`/api/admin/blogs/${blogId}`);
      if (response.ok) {
        const fullBlogData = await response.json();
        console.log('Fetched full blog data:', fullBlogData);
        populateFormData(fullBlogData);
      } else {
        console.error('Failed to fetch full blog data');
        populateFormData(blog);
      }
    } catch (error) {
      console.error('Error fetching full blog data:', error);
      populateFormData(blog);
    } finally {
      setContentLoading(false);
    }
  };

  const populateFormData = (blogData) => {
    const tags = Array.isArray(blogData.tags) ? blogData.tags : [];
    setFormData({
      title: blogData.title || '',
      content: blogData.content || '',
      excerpt: blogData.excerpt || '',
      featured_image: blogData.featured_image || '',
      category: blogData.category || '',
      tags: tags,
      read_time_minutes: blogData.read_time_minutes || 5,
      is_published: blogData.is_published !== false,
      is_featured: blogData.is_featured === true,
      meta_title: blogData.meta_title || '',
      meta_description: blogData.meta_description || ''
    });
    setImagePreview(blogData.featured_image || '');
    setTagsInput(tags.join(', ')); // Set the tags input field
  };

  const resetFormData = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      featured_image: '',
      category: '',
      tags: [],
      read_time_minutes: 5,
      is_published: false,
      is_featured: false,
      meta_title: '',
      meta_description: ''
    });
    setImagePreview('');
    setTagsInput(''); // Reset tags input
  };

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

  // Handle content change from rich text editor
  const handleContentChange = (content) => {
    setFormData(prev => ({ ...prev, content }));
    
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: '' }));
    }

    // Auto-calculate reading time based on content
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200)); // Average 200 words per minute
    setFormData(prev => ({ ...prev, read_time_minutes: readingTime }));
  };

  const handleTagsChange = (e) => {
    const tagString = e.target.value;
    setTagsInput(tagString); // Update the input display
    
    // Parse tags: split by comma, trim whitespace, filter empty
    const tags = tagString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    setFormData(prev => ({ ...prev, tags }));
    
    console.log('Tags updated:', tags); // Debug log
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
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'your_upload_preset');
      formDataUpload.append('folder', 'eugene-essentials/blogs');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formDataUpload,
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
      <div className="bg-white rounded-lg text-black shadow-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto">
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

        {/* Content Loading Indicator */}
        {contentLoading && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-center">
              <Loader className="w-5 h-5 animate-spin mr-2" />
              <span className="text-gray-600">Loading blog content...</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Info */}
            <div className="lg:col-span-1 space-y-6">
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
                  disabled={contentLoading}
                  className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-[#355E3B] focus:border-transparent ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  } ${contentLoading ? 'bg-gray-100' : ''}`}
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
                  disabled={contentLoading}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-[#355E3B] focus:border-transparent ${
                    errors.excerpt ? 'border-red-300' : 'border-gray-300'
                  } ${contentLoading ? 'bg-gray-100' : ''}`}
                  placeholder="Brief description of the blog post"
                  maxLength={500}
                />
                {errors.excerpt && <p className="text-red-600 text-sm mt-1">{errors.excerpt}</p>}
                <p className="text-gray-500 text-sm mt-1">{formData.excerpt.length}/500 characters</p>
              </div>

              {/* Category */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    disabled={contentLoading || categoriesLoading}
                    className={`w-full px-3 py-2 border rounded-lg text-black focus:ring-2 focus:ring-[#355E3B] focus:border-transparent ${
                      errors.category ? 'border-red-300' : 'border-gray-300'
                    } ${contentLoading || categoriesLoading ? 'bg-gray-100' : ''}`}
                  >
                    {categoriesLoading ? (
                      <option value="">Loading categories...</option>
                    ) : (
                      categoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))
                    )}
                  </select>
                  {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
                  {categoriesLoading && (
                    <p className="text-gray-500 text-sm mt-1">Loading categories from database...</p>
                  )}
                </div>
              </div>

              {/* Tags and Read Time */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={handleTagsChange}
                    disabled={contentLoading}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-[#355E3B] focus:border-transparent ${
                      contentLoading ? 'bg-gray-100' : ''
                    }`}
                    placeholder="Tag1, Tag2, Tag3"
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    Separate tags with commas. Current tags: {formData.tags.length > 0 ? formData.tags.join(', ') : 'None'}
                  </p>
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
                    disabled={contentLoading}
                    min="1"
                    max="60"
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-[#355E3B] focus:border-transparent ${
                      contentLoading ? 'bg-gray-100' : ''
                    }`}
                  />
                  <p className="text-gray-500 text-sm mt-1">Auto-calculated based on content</p>
                </div>
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Featured Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {imagePreview ? (
                    <div className="space-y-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-32 mx-auto rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setFormData(prev => ({ ...prev, featured_image: '' }));
                        }}
                        disabled={contentLoading}
                        className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <div>
                      <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                      <div className="mt-2">
                        <label className={`cursor-pointer ${contentLoading ? 'cursor-not-allowed' : ''}`}>
                          <span className="text-sm font-medium text-gray-900">
                            {imageUploading ? 'Uploading...' : 'Upload an image'}
                          </span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={imageUploading || contentLoading}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  )}
                </div>
                {errors.image && <p className="text-red-600 text-sm mt-1">{errors.image}</p>}
              </div>

              {/* Publishing Options */}
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_published"
                    checked={formData.is_published}
                    onChange={handleInputChange}
                    disabled={contentLoading}
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
                    disabled={contentLoading}
                    className="w-4 h-4 text-[#355E3B] border-gray-300 rounded focus:ring-[#355E3B]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured post</span>
                </label>
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
                    disabled={contentLoading}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-[#355E3B] focus:border-transparent ${
                      contentLoading ? 'bg-gray-100' : ''
                    }`}
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
                    disabled={contentLoading}
                    rows={2}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-[#355E3B] focus:border-transparent ${
                      contentLoading ? 'bg-gray-100' : ''
                    }`}
                    placeholder="SEO description (optional)"
                    maxLength={160}
                  />
                  <p className="text-gray-500 text-sm mt-1">{formData.meta_description.length}/160 characters</p>
                </div>
              </div>
            </div>

            {/* Right Column - Rich Text Editor */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content *
                    {blog && (
                      <span className="text-gray-500 text-xs ml-2">
                        {contentLoading ? '(Loading...)' : '(Loaded from database)'}
                      </span>
                    )}
                  </label>
                  {errors.content && <p className="text-red-600 text-sm mb-2">{errors.content}</p>}
                  
                  <RichTextEditor
                    value={formData.content}
                    onChange={handleContentChange}
                    disabled={contentLoading}
                    placeholder={contentLoading ? 'Loading content...' : 'Start writing your blog post...'}
                  />
                  
                  {formData.content && (
                    <div className="mt-2 flex justify-between text-sm text-gray-500">
                      <span>{formData.content.replace(/<[^>]*>/g, '').length} characters</span>
                      <span>~{formData.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length} words</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
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
              disabled={loading || imageUploading || contentLoading}
              className={`px-6 py-2 rounded-lg text-black transition-colors flex items-center gap-2 ${
                loading || imageUploading || contentLoading
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
};
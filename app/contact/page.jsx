// app/contact/page.jsx
'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Plus, Lightbulb, AlertCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'restaurant_submission',
    message: '',
    restaurantName: '',
    restaurantAddress: '',
    restaurantPhone: '',
    restaurantWebsite: '',
    ownershipConfirmation: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    try {
      // Here you would normally send the data to your API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitMessage('Thank you! We\'ve received your submission and will review it soon.');
      setFormData({
        name: '',
        email: '',
        subject: 'restaurant_submission',
        message: '',
        restaurantName: '',
        restaurantAddress: '',
        restaurantPhone: '',
        restaurantWebsite: '',
        ownershipConfirmation: false
      });
    } catch (error) {
      setSubmitMessage('Sorry, there was an error submitting your form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRestaurantSubmission = formData.subject === 'restaurant_submission';

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1559329007-40df8d5bb73f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Contact Us"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="font-serif text-white text-4xl md:text-5xl lg:text-[55px] font-semibold leading-tight mb-6">
            Get In Touch
          </h1>
          <p className="font-serif text-white text-lg md:text-xl lg:text-[24px] max-w-[700px] leading-relaxed">
            Help us showcase Eugene's amazing local food scene or share your suggestions
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[30px] p-8 lg:p-12 shadow-lg">
              <h2 className="font-serif text-[32px] font-semibold text-black mb-8">
                Send Us a Message
              </h2>

              {submitMessage && (
                <div className={`mb-6 p-4 rounded-lg ${
                  submitMessage.includes('error') 
                    ? 'bg-red-50 text-red-700 border border-red-200' 
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  {submitMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-[15px] focus:ring-2 text-black focus:ring-[#355E3B] focus:border-transparent font-serif text-lg"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-[15px] focus:ring-2 text-black focus:ring-[#355E3B] focus:border-transparent font-serif text-lg"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                {/* Subject Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What can we help you with? *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-[15px] focus:ring-2 text-black focus:ring-[#355E3B] focus:border-transparent font-serif text-lg"
                  >
                    <option value="restaurant_submission">🍽️ Submit a Local Restaurant</option>
                    <option value="website_feedback">💡 Website Feedback/Suggestions</option>
                    <option value="business_inquiry">🏪 Business Partnership Inquiry</option>
                    <option value="general">💬 General Question</option>
                    <option value="issue_report">⚠️ Report an Issue</option>
                  </select>
                </div>

                {/* Restaurant Submission Fields */}
                {isRestaurantSubmission && (
                  <div className="bg-[#355E3B]/5 border border-[#355E3B]/20 rounded-[20px] p-6">
                    <h3 className="font-serif text-xl font-semibold text-[#355E3B] mb-4 flex items-center">
                      <Plus className="w-5 h-5 mr-2" />
                      Restaurant Details
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Restaurant Name *
                        </label>
                        <input
                          type="text"
                          name="restaurantName"
                          value={formData.restaurantName}
                          onChange={handleInputChange}
                          required={isRestaurantSubmission}
                          className="w-full px-4 py-3 border border-gray-300 rounded-[15px] focus:ring-2 text-black focus:ring-[#355E3B] focus:border-transparent font-serif text-lg"
                          placeholder="Amazing Local Bistro"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address
                        </label>
                        <input
                          type="text"
                          name="restaurantAddress"
                          value={formData.restaurantAddress}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-[15px] focus:ring-2 text-black focus:ring-[#355E3B] focus:border-transparent font-serif text-lg"
                          placeholder="123 Main St, Eugene, OR"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="restaurantPhone"
                            value={formData.restaurantPhone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-[15px] focus:ring-2 text-black focus:ring-[#355E3B] focus:border-transparent font-serif text-lg"
                            placeholder="(541) 555-0123"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Website (if any)
                          </label>
                          <input
                            type="url"
                            name="restaurantWebsite"
                            value={formData.restaurantWebsite}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-[15px] focus:ring-2 text-black focus:ring-[#355E3B] focus:border-transparent font-serif text-lg"
                            placeholder="https://..."
                          />
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-yellow-800 mb-2">Local Business Verification</h4>
                            <label className="flex items-start">
                              <input
                                type="checkbox"
                                name="ownershipConfirmation"
                                checked={formData.ownershipConfirmation}
                                onChange={handleInputChange}
                                required={isRestaurantSubmission}
                                className="w-4 h-4 text-[#355E3B] border-gray-300 rounded focus:ring-[#355E3B] mt-1 mr-3"
                              />
                              <span className="text-sm text-yellow-700">
                                I confirm this is a locally-owned business (not a chain or franchise) and is located in the Eugene area. *
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isRestaurantSubmission ? 'Additional Information' : 'Message *'}
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required={!isRestaurantSubmission}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-[15px] focus:ring-2 text-black focus:ring-[#355E3B] focus:border-transparent font-serif text-lg resize-none"
                    placeholder={
                      isRestaurantSubmission 
                        ? "Tell us why this restaurant should be featured, what makes it special, or any other details..."
                        : "Tell us how we can help you..."
                    }
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 rounded-[20px] font-serif text-xl font-semibold transition-colors flex items-center justify-center ${
                    isSubmitting
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-[#355E3B] text-white hover:bg-[#2a4a2f]'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-3" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Information & Quick Actions */}
          <div className="space-y-8">
            {/* Contact Info */}
          
            {/* Quick Actions */}
            <div className="bg-[#8A9A5B] rounded-[30px] p-8 text-white">
              <h3 className="font-serif text-2xl font-semibold mb-6">
                Quick Actions
              </h3>
              
              <div className="space-y-4">
                <button className="flex cursor-pointer text-left items-center p-4 bg-white/10 rounded-[15px]">
                  <MessageCircle className="w-8 h-8 mr-4" />
                  <div>
                    <h4 className="font-semibold">Suggest a Restaurant</h4>
                    <p className="text-sm opacity-90">Know a great local spot we're missing?</p>
                  </div>
                </button>
                
                <button className="flex cursor-pointer items-center w-full text-left p-4 bg-white/10 rounded-[15px]">
                  <Lightbulb className="w-8 h-8 mr-4" />
                  <div>
                    <h4 className="font-semibold">Share Feedback</h4>
                    <p className="text-sm opacity-90">Help us improve the platform</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Response Time */}
            {/* <div className="bg-green-50 border border-green-200 rounded-[20px] p-6">
              <h4 className="font-serif text-lg font-semibold text-green-800 mb-3">
                📬 Response Times
              </h4>
              <div className="space-y-2 text-sm text-green-700">
                <p>• Restaurant submissions: 2-3 business days</p>
                <p>• General inquiries: Within 24 hours</p>
                <p>• Website issues: Same day</p>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
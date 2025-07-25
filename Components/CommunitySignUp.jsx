// Updated Community Signup Section with Database integration
'use client';

import { useState } from 'react';

export default function CommunitySignup() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null
  const [message, setMessage] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) return;
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    setMessage('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          source: 'community_signup'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setMessage(data.message || 'Successfully subscribed!');
        setEmail(''); // Clear the form
      } else {
        setSubmitStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting email:', error);
      setSubmitStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="relative bg-[#8A9A5B] rounded-[30px] lg:p-16 pt-56 px-5 pb-3 overflow-visible">
          {/* Background Image */}
          <div className="absolute left-1/2 -translate-x-1/2 lg:left-8 lg:translate-x-0 -top-20 block">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/368f0253ba9aa3f28d3f09cb749966ca7d4c5b59?width=922"
              alt="Community"
              className="w-[300px] h-[300px] scale-150 lg:scale-100 xl:w-[461px] xl:h-[461px] object-contain"
            />
          </div>

          {/* Content */}
          <div className="lg:ml-[400px] xl:ml-[500px] max-w-[500px]">
            <h2 className="font-serif text-[40px] font-semibold text-white lg:text-left">
              Join Our Community
            </h2>
            <p className="font-serif text-[20px] font-semibold text-white mb-8 leading-relaxed">
              Get updates about updates, community votes and events
            </p>

            {/* Email Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full h-[55px] rounded-[20px] border border-black bg-[#F5F5F5] px-6 font-serif text-[20px] text-black placeholder-[#858585] focus:outline-none focus:ring-2 focus:ring-white"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting || !email}
                className={`w-full h-[40px] cursor-pointer rounded-[20px] font-serif text-[20px] transition-colors ${
                  isSubmitting || !email
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-[#FFA500] text-white hover:bg-[#FF9500]'
                }`}
              >
                {isSubmitting ? 'Joining...' : 'Join Now'}
              </button>

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg text-center">
                  {message}
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg text-center">
                  {message}
                </div>
              )}
            </form>

            <p className="font-serif text-[12px] text-white text-center mt-4 leading-relaxed">
              *We will not sell your information, we will only send you updates or community related events
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
// app/about/page.jsx
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Users, MapPin, Award, Star, Coffee, Utensils } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Local Eugene Restaurant"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="font-serif text-white text-4xl md:text-5xl lg:text-[64px] font-bold leading-tight max-w-[900px] mb-6">
            Supporting Eugene's Local Food Scene
          </h1>
          <p className="font-serif text-white text-lg md:text-xl lg:text-[24px] max-w-[800px] leading-relaxed">
            We're passionate about showcasing the incredible local restaurants, cafes, and food businesses that make Eugene special
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Our Mission Section */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-[40px] font-semibold text-black mb-6">
                Our Mission
              </h2>
              <div className="space-y-6 text-lg text-black leading-relaxed">
                <p>
                  Eugene Essentials was created with a simple belief: local businesses are the heart and soul of our community. While big chains dominate the landscape, we're here to shine a spotlight on the unique, family-owned, and locally-operated establishments that give Eugene its character.
                </p>
                <p>
                  We don't feature corporate chains or big companies. Instead, we focus exclusively on the mom-and-pop restaurants, neighborhood cafes, food trucks, and local gems that need your support to thrive.
                </p>
                <p>
                  Every business on our platform is locally owned and operated, contributing to Eugene's unique culture and keeping money in our community.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-[30px] p-8 shadow-lg">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="bg-[#355E3B] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-black mb-2">Local Love</h3>
                    <p className="text-gray-600 text-sm">Supporting businesses that call Eugene home</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-[#355E3B] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-black mb-2">Community First</h3>
                    <p className="text-gray-600 text-sm">Building connections between locals and businesses</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-[#355E3B] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-black mb-2">Quality Focus</h3>
                    <p className="text-gray-600 text-sm">Curating the best local dining experiences</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-[#355E3B] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-black mb-2">Hidden Gems</h3>
                    <p className="text-gray-600 text-sm">Discovering places you might never find otherwise</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What We Don't Do Section */}
        <section className="mb-20">
          <div className="bg-white rounded-[30px] p-8 lg:p-12 shadow-lg">
            <h2 className="font-serif text-[32px] font-semibold text-black mb-8 text-center">
              What Makes Us Different
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
                <h3 className="font-serif text-xl font-semibold text-red-800 mb-4 flex items-center">
                  <span className="text-2xl mr-3">❌</span>
                  What We DON'T Feature
                </h3>
                <ul className="space-y-2 text-red-700">
                  <li>• National chain restaurants</li>
                  <li>• Corporate-owned establishments</li>
                  <li>• Franchise operations</li>
                  <li>• Big box retailers with food courts</li>
                  <li>• Businesses with 50+ locations</li>
                </ul>
              </div>
              
              <div className="bg-green-50 border-l-4 border-[#355E3B] p-6 rounded-lg">
                <h3 className="font-serif text-xl font-semibold text-[#355E3B] mb-4 flex items-center">
                  <span className="text-2xl mr-3">✅</span>
                  What We DO Feature
                </h3>
                <ul className="space-y-2 text-[#355E3B]">
                  <li>• Family-owned restaurants</li>
                  <li>• Local cafes and bakeries</li>
                  <li>• Independent food trucks</li>
                  <li>• Neighborhood pubs and bars</li>
                  <li>• Eugene-born food businesses</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="font-serif text-[40px] font-semibold text-black mb-6">
              Our Story
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-black leading-relaxed mb-6">
                Eugene Essentials started when we realized how hard it was to discover truly local restaurants in our own city. Search engines were dominated by chain restaurants, and the amazing family-owned spots were getting lost in the noise.
              </p>
              <p className="text-lg text-black leading-relaxed mb-6">
                As longtime Eugene residents, we've watched incredible local businesses struggle while chains with big marketing budgets dominate online visibility. We decided to create a platform that levels the playing field and puts local businesses first.
              </p>
              <p className="text-lg text-black leading-relaxed">
                Every listing on our site is carefully curated to ensure it represents a truly local business. We verify ownership, check local connections, and prioritize establishments that contribute to Eugene's unique character.
              </p>
            </div>
          </div>
        </section>

        {/* Community Impact Section */}
        <section className="mb-20">
          <div className="bg-[#8A9A5B] rounded-[30px] p-8 lg:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <Coffee className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <h2 className="font-serif text-[32px] font-semibold mb-8">
                Why Local Matters
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="font-serif text-xl font-semibold mb-4">Economic Impact</h3>
                  <p className="leading-relaxed">
                    Every dollar spent at a local business generates 3x more economic activity in our community compared to chain stores.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-serif text-xl font-semibold mb-4">Unique Character</h3>
                  <p className="leading-relaxed">
                    Local businesses create the distinctive culture and atmosphere that make Eugene special and different from anywhere else.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-serif text-xl font-semibold mb-4">Community Connection</h3>
                  <p className="leading-relaxed">
                    Local owners live here, care about our community, and build lasting relationships with their neighbors.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="text-center">
          <div className="bg-white rounded-[30px] p-12 shadow-lg">
            <h2 className="font-serif text-[32px] font-semibold text-black mb-6">
              Join Our Community
            </h2>
            <p className="text-lg text-black mb-8 max-w-2xl mx-auto leading-relaxed">
              Help us showcase Eugene's incredible local food scene. Know a great local restaurant we're missing? Have suggestions for making our platform better?
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <button className="bg-[#355E3B] text-white font-serif text-xl px-8 py-4 rounded-[20px] hover:bg-[#2a4a2f] transition-colors cursor-pointer">
                  Submit a Restaurant
                </button>
              </Link>
              <Link href="/directory">
                <button className="border border-[#355E3B] text-[#355E3B] font-serif text-xl px-8 py-4 rounded-[20px] hover:bg-[#355E3B] hover:text-white transition-colors cursor-pointer">
                  Explore Local Spots
                </button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
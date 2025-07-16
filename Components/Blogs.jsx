import Link from "next/link";


const Blogs = () => {
  return (
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-16">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 lg:mb-16">
          <h1 className="font-serif text-[40px] font-semibold text-black text-left mb-4 lg:mb-0">
            Browse Blogs
          </h1>
          <button className="block border border-primary active:scale-95 text-[#355E3B] hover:bg-[#355E3B] cursor-pointer font-serif text-[24px] md:text-[30px] px-6 py-2 rounded-[20px] hover:bg-primary hover:text-white transition-colors">
              Browse All
            </button>
        </div>

        {/* Blog Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Featured Blog Post */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[40px] overflow-hidden shadow-sm">
              {/* Featured Image */}
              <div className="bg-[#D9D9D9] h-64 lg:h-[400px] rounded-t-[40px]"></div>

              {/* Featured Content */}
              <div className="p-6 lg:p-8">
                <div className="flex  sm:flex-row sm:items-center  mb-4">
                  <div className="bg-[#355E3B] text-white font-serif text-lg lg:text-xl font-semibold px-4 py-2 rounded-lg  mb-2 sm:mb-0">
                    Community Vote
                  </div>
                  <div className="text-[#868686] ms-2 font-serif text-lg lg:text-xl font-semibold">
                    August 03, 2025
                  </div>
                </div>
                <h2 className="font-serif text-2xl lg:text-[35px] font-semibold text-black leading-tight">
                  Top 10 Underrated Restaurants in Eugene
                </h2>
              </div>
            </div>
          </div>

          {/* Side Blog Posts */}
          <div className="lg:col-span-5 space-y-6 lg:space-y-8">
            {[1, 2, 3].map((index) => (
              <Link href={"#"} key={index} className="flex gap-4 lg:gap-6">
                {/* Side Image */}
                <div className="bg-[#D9D9D9] w-24 h-24 lg:w-[175px] lg:h-[175px] rounded-xl lg:rounded-[20px] flex-shrink-0"></div>

                {/* Side Content */}
                
                <div className="flex-1">
                  <div className="flex  sm:flex-row sm:items-center  mb-2 lg:mb-4">
                    <div className="bg-[#355E3B] text-white font-serif text-sm lg:text-xl font-semibold px-3 py-1 lg:px-4 lg:py-2 rounded-lg inline-block mb-2 sm:mb-0 w-fit">
                      Tips
                    </div>
                    <div className="text-[#868686] ms-2 font-serif text-sm lg:text-xl font-semibold">
                      August 03, 2025
                    </div>
                  </div>
                  <h3 className="font-serif text-lg lg:text-[26px] font-semibold text-black leading-tight">
                    Where to eat during football season
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
  );
};

export default Blogs;

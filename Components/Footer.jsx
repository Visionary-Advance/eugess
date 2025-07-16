import Link from "next/link";


export default function Footer(){



    return(


<div className="bg-[#276B00] pt-12 pb-5 ">
        <div className="w-11/12 mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 ">
            {/* Footer Links Columns */}
            {[1, 2, 3].map((column) => (
              <div key={column} className="text-center md:text-left">
                <h3 className="font-serif text-xl lg:text-[30px] font-semibold text-white mb-4 lg:mb-6">
                  Explore Eugene
                </h3>
                <div className="space-y-2 lg:space-y-4">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div
                      key={item}
                      className="font-serif text-lg lg:text-xl text-white hover:text-gray-200 cursor-pointer transition-colors"
                    >
                      Explore Eugene
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Community Signup */}
            <div className="text-center md:text-left">
              <h3 className="font-serif text-xl lg:text-[30px] font-semibold text-white mb-4 lg:mb-6">
                Join Our Community
              </h3>
              <p className="font-serif text-sm lg:text-[15px] font-semibold text-white mb-6 lg:mb-8 leading-relaxed">
                Get updates about newly added restaurants, community votes and
                events
              </p>

              {/* Email Form */}
              <div className="space-y-4">
                <div className="bg-[#F5F5F5] border border-black rounded-[20px] px-4 lg:px-6 py-3 lg:py-4">
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full bg-transparent font-serif text-lg lg:text-xl text-[#858585] outline-none placeholder-[#858585]"
                  />
                </div>
                <button className="w-full bg-[#FFA500] text-white font-serif text-lg lg:text-xl py-3 lg:py-4 rounded-[20px] hover:bg-[#e6940a] transition-colors">
                  Join Now
                </button>
                <p className="font-serif text-xs text-white text-center leading-relaxed">
                  *We will not sell your information, we will only send you
                  updates or community related events
                </p>
              </div>
            </div>
          </div>
        </div>
        <p className="text-center">Powered By <Link className="text-[#008070] font-black" href={"https://visionaryadvance.com"} rel="nofollow" target="_blank">Visionary Advance</Link></p>
      </div>

        )
}




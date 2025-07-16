'use client'

import { Menu, X } from "lucide-react";
import { useState } from "react";

const Header = ({ currentPage = "home" }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home", key: "home" },
    { href: "/about", label: "About", key: "about" },
    { href: "/directory", label: "Directory", key: "directory" },
    { href: "/blogs", label: "Blogs", key: "blogs" },
    { href: "/contact", label: "Contact", key: "contact" },
  ];

  return (
    <header className="bg-[#F5F5F5] py-4 px-4 md:px-8 lg:px-18 relative">
      <div className="max-w-8xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0 hover:scale-105 duration-150">
          <a href="/">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/b240f1bf83e72a508d94b564014e42f5ade02295?width=558"
              alt="Eugene Eats Logo"
              className="h-[48px] w-[186px]  md:w-[200px] object-contain"
            />
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-4">
          {navItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className={`font-serif text-[22px] font-medium transition-colors ${
                currentPage === item.key
                  ? "text-primary font-semibold"
                  : "text-black hover:text-primary"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-black" />
          ) : (
            <Menu className="w-6 h-6 text-black" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-[#F5F5F5] border-t border-black/20 z-50">
          <nav className="py-4">
            {navItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className={`block px-6 py-3 font-serif text-[24px] transition-colors ${
                  currentPage === item.key
                    ? "text-primary font-semibold"
                    : "text-black hover:text-primary"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
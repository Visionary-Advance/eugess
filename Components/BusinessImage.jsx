import { useState } from 'react';

export default function BusinessImage({ 
  business, 
  className = "",
  size = "default",
  showFallback = true,
  alt = null 
}) {
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = () => {
    setImageError(true);
  };

  // Different fallback styles based on size
  const getFallbackContent = () => {
    const baseClasses = "flex items-center justify-center text-white";
    const gradientBg = "bg-gradient-to-br from-[#355E3B] to-[#8A9A5B]";
    
    switch (size) {
      case 'small':
        return (
          <div className={`${baseClasses} ${gradientBg} ${className}`}>
            <div className="text-center p-2">
              <div className="text-lg mb-1">🍽️</div>
              <p className="text-xs font-serif line-clamp-1">{business.name}</p>
            </div>
          </div>
        );
      
      case 'large':
        return (
          <div className={`${baseClasses} ${gradientBg} ${className}`}>
            <div className="text-center p-8">
              <div className="text-6xl mb-4">🍽️</div>
              <h2 className="text-2xl font-serif font-bold line-clamp-2">{business.name}</h2>
              <p className="text-lg opacity-90 mt-2">No Image Available</p>
            </div>
          </div>
        );
      
      case 'hero':
        return (
          <div className={`${baseClasses} ${gradientBg} ${className}`}>
            <div className="text-center">
              <div className="text-8xl mb-6">🍽️</div>
              <h1 className="text-4xl font-serif font-bold mb-4">{business.name}</h1>
              <p className="text-xl opacity-90">Welcome to our restaurant</p>
            </div>
          </div>
        );
      
      case 'card':
      default:
        return (
          <div className={`${baseClasses} ${gradientBg} ${className}`}>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🍽️</div>
              <p className="text-sm font-serif line-clamp-2">{business.name}</p>
            </div>
          </div>
        );
    }
  };

  // If no image URL or error occurred, show fallback
  if (imageError || !business.image_url) {
    return showFallback ? getFallbackContent() : null;
  }

  return (
    <img
      src={business.image_url}
      alt={alt || business.name}
      className={className}
      onError={handleImageError}
      loading="lazy"
    />
  );
}
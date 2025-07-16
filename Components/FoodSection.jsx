import {
  ChefHat,
  Coffee,
  Truck,
  ShoppingCart,
  Beer,
  UtensilsCrossed,
  Store,
  Cake
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function FoodSection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Icon mapping based on category name or icon field
  const getIconComponent = (iconName, categoryName) => {
    const iconMap = {
      // By icon name (if stored in database)
      'ChefHat': ChefHat,
      'Coffee': Coffee,
      'Truck': Truck,
      'ShoppingCart': ShoppingCart,
      'Beer': Beer,
      'UtensilsCrossed': UtensilsCrossed,
      'Store': Store,
      'Cake': Cake,
      
      // By category name (fallback)
      'Restaurants': ChefHat,
      'Restaurant': ChefHat,
      'Coffee Shops': Coffee,
      'Coffee': Coffee,
      'Food Trucks': Truck,
      'Food Truck': Truck,
      'Grocery': ShoppingCart,
      'Groceries': ShoppingCart,
      'Breweries': Beer,
      'Brewery': Beer,
      'Bars': Beer,
      'Bar': Beer,
      'Bakery': Cake,
      'Bakeries': Cake,
      'Fast Food': UtensilsCrossed,
      'Retail': Store,
    };

    // Try icon name first, then category name, then default
    return iconMap[iconName] || iconMap[categoryName] || UtensilsCrossed;
  };

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="-translate-y-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 justify-items-center">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col w-full group items-center">
                <div className="w-10/12 h-[150px] lg:w-[200px] rounded-[20px] bg-gray-200 animate-pulse mb-4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="-translate-y-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 justify-items-center">
          {categories.map((category) => {
            const IconComponent = getIconComponent(category.icon, category.name);
            
            return (
              <div key={category.id} className="flex flex-col w-full group items-center">
                {/* Category Card with Link */}
                <Link href={`/directory/${category.slug}`} className="w-full flex justify-center">
                  <div className="w-10/12 h-[170px] lg:w-[200px] rounded-[20px] border border-black/50 bg-[#F5F5F5] flex flex-col items-center justify-center mb-4 hover:shadow-lg transition-shadow cursor-pointer group-hover:border-[#355E3B]">
                    <IconComponent
                      className="w-[80px] h-[80px] group-hover:text-[#355E3B] transition duration-200 ease-in-out text-black mb-2"
                      strokeWidth={1.4}
                    />
                    {/* Category Label */}
                    <h3 className="font-serif text-[20px] md:text-[22px] text-black text-center mb-1 group-hover:text-[#355E3B] transition duration-200 ease-in-out">
                      {category.name}
                    </h3>
                    {/* Business Count */}
                    <p className="font-sans text-[14px] text-gray-600 text-center">
                      {category.businessCount} {category.businessCount === 1 ? 'business' : 'businesses'}
                    </p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DirectoryIndexPage() {
  const router = useRouter();

  useEffect(() => {
    // Fetch categories and redirect to first one
    async function redirectToFirstCategory() {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        const categories = Array.isArray(data) ? data : [];
        
        if (categories.length > 0) {
          // Redirect to the first category
          router.replace(`/directory/${categories[0].slug}`);
        } else {
          // If no categories, stay on this page with error message
          console.error('No categories found');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }

    redirectToFirstCategory();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#355E3B] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading categories...</p>
      </div>
    </div>
  );
}
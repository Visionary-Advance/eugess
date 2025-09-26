// next.config.mjs - Simplified version
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Experimental features for Prisma
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  
  // Webpack configuration to handle Prisma properly
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client');
    }
    return config;
  },

  // Image domains (if you're using Next.js Image component)
  images: {
    domains: [
      'api.builder.io',
      'cdn.builder.io', 
      'images.unsplash.com',
      'via.placeholder.com',
      'picsum.photos',
      'res.cloudinary.com'
    ],
  },

  // Simple redirect for admin
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/login', 
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
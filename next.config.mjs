// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Experimental features
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client');
    }
    return config;
  },

  // Environment variables that should be available at build time
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },

  // API routes configuration
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },

  // Image domains (if you're using Next.js Image component)
  images: {
    domains: [
      'api.builder.io',
      'cdn.builder.io',
      'images.unsplash.com',
      'via.placeholder.com',
      'picsum.photos',
      'res.cloudinary.com' // If you're using Cloudinary
    ],
  },

  // Headers for CORS if needed
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },

  // Redirects if needed
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/login',
        permanent: false,
      },
    ];
  },

  // Build output configuration
  output: 'standalone',
  
  // Disable static optimization for dynamic routes
  generateStaticParams: false,
};

module.exports = nextConfig;
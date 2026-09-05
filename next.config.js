/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  compress: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.exspeeds.com' },
      { protocol: 'https', hostname: 'secure.gravatar.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/assets/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/shop',
        destination: '/',
        permanent: true,
      },
      {
        source: '/shop/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/product/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/products/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/product-category/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/store',
        destination: '/',
        permanent: true,
      },
      {
        source: '/store/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/cart',
        destination: '/',
        permanent: true,
      },
      {
        source: '/cart/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/checkout',
        destination: '/',
        permanent: true,
      },
      {
        source: '/checkout/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/my-account',
        destination: '/',
        permanent: true,
      },
      {
        source: '/my-account/:path*',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  compress: true,
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
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
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
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
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/home/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/shop',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/shop/:path*',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/store',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/store/:path*',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/product/:path*',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/products/:path*',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/product-category/:path*',
        destination: '/blog',
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

import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Control referrer information sent to third parties
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Restrict browser features/APIs
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), payment=()',
  },
  // Force HTTPS for 1 year (enable once you're fully on HTTPS/Vercel)
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'http', hostname: 'localhost' },
      // Backend uploads served from Render
      { protocol: 'https', hostname: '*.onrender.com' },
      // Allow any https image host as a fallback for restaurant/food images
      // TODO: Narrow this to your CDN/storage domain once S3 is configured
      { protocol: 'https', hostname: '**' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: false,
      },
      {
        source: '/restaurant',
        destination: '/restaurant/dashboard',
        permanent: false,
      },
      {
        source: '/driver',
        destination: '/driver/dashboard',
        permanent: false,
      },
      {
        source: '/delivery',
        destination: '/driver/dashboard',
        permanent: false,
      },
      {
        source: '/deliveries',
        destination: '/driver/deliveries',
        permanent: false,
      },
      {
        source: '/delivery/login',
        destination: '/driver/login',
        permanent: false,
      },
      {
        source: '/delivery/register',
        destination: '/driver/register',
        permanent: false,
      },
      {
        source: '/delivery/dashboard',
        destination: '/driver/dashboard',
        permanent: false,
      },
      {
        source: '/delivery/deliveries',
        destination: '/driver/deliveries',
        permanent: false,
      },
      {
        source: '/delivery/earnings',
        destination: '/driver/earnings',
        permanent: false,
      },
      {
        source: '/delivery/history',
        destination: '/driver/history',
        permanent: false,
      },
      {
        source: '/delivery/:path*',
        destination: '/driver/:path*',
        permanent: false,
      },
      {
        source: '/deliveries/:path*',
        destination: '/driver/deliveries/:path*',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;


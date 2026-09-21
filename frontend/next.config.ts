import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

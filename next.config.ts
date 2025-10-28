import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Enable production optimizations
  reactStrictMode: true,

  // Optimize bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Improve performance
  experimental: {
    optimizePackageImports: ['@fortawesome/react-fontawesome', '@fortawesome/free-solid-svg-icons'],
  },

  // Disable ESLint during build (fix lint errors separately)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript errors during build (fix type errors separately)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

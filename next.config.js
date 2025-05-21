/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.pexels.com'],
    unoptimized: true
  },
  // Remove output: 'export' to use middleware
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Add transpilePackages for Ant Design
  transpilePackages: ['antd'],
};

module.exports = nextConfig;

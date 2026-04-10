/** @type {import('next').NextConfig} */
const nextConfig = {
  // Move turbopack to the top level for Next.js 16
  turbopack: {},

  experimental: {
    // Keep this empty to stop the 'Unrecognized key' error
  },

  reactStrictMode: true,
};

export default nextConfig;

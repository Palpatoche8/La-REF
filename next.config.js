/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverBodySizeLimit: '200mb',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
}

module.exports = nextConfig

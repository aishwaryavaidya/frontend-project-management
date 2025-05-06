/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "media.licdn.com",
          pathname: "/dms/image/**", // Matches LinkedIn image paths
        },
      ],
    },
  };
  
  module.exports = nextConfig;
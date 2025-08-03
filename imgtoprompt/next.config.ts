import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@huggingface/transformers'],
  },
  webpack: (config, { isServer }) => {
    // Handle @huggingface/transformers
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    
    // Add externals for server-side
    if (isServer) {
      config.externals.push('@huggingface/transformers');
    }
    
    return config;
  },
};

export default nextConfig;

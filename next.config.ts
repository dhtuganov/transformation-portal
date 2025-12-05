import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone for serverless deployment
  output: 'standalone',

  // Experimental features for better Netlify compatibility
  experimental: {
    // Include content directory in serverless bundle
    outputFileTracingIncludes: {
      '/**': ['./content/**/*'],
    },
  },
};

export default nextConfig;

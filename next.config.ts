import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone for serverless deployment
  output: 'standalone',

  // Include content directory in serverless bundle (moved from experimental in Next.js 16)
  outputFileTracingIncludes: {
    '/**': ['./content/**/*'],
  },
};

export default nextConfig;

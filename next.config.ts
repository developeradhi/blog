import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";

// @next/env loads .env, .env.local, .env.production etc.
// Must be called BEFORE reading process.env so vars are available in this config
loadEnvConfig(process.cwd());

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Pass env vars explicitly to all Turbopack worker processes during static export
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  },
};

export default nextConfig;

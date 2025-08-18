import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_DB_HOST: process.env.DB_HOST,
    NEXT_PUBLIC_DB_PORT: process.env.DB_PORT,
    NEXT_PUBLIC_DB_USER: process.env.DB_USER,
    NEXT_PUBLIC_DB_PASSWORD: process.env.DB_PASSWORD,
    NEXT_PUBLIC_DB_NAME: process.env.DB_NAME,
  }
};

export default nextConfig;

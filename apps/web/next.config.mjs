/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@hetcho/shared',
    '@hetcho/domain',
    '@hetcho/application',
    '@hetcho/infrastructure',
    '@hetcho/db',
  ],
  experimental: { serverActions: { bodySizeLimit: '2mb' } },
};

export default nextConfig;

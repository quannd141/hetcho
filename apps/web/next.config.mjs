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
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      '.js': ['.ts', '.tsx', '.js'],
      '.mjs': ['.mts', '.mjs'],
    };
    return config;
  },
};

export default nextConfig;

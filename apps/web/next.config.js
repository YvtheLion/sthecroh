/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.sthecroh.com' }],
        destination: 'https://sthecroh.com/:path*',
        permanent: true,
      },
    ];
  },
};
module.exports = nextConfig;

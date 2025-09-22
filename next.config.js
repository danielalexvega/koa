/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://app.kontent.ai https://preview.kontent.ai",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

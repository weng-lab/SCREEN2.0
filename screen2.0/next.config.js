/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  devIndicators: {
    buildActivityPosition: "bottom-right",
  },
  generateEtags: false,
  trailingSlash: false,
}

module.exports = nextConfig

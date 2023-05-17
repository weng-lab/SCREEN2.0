/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: {
    buildActivityPosition: "bottom-right",
  },
  generateEtags: false,
  trailingSlash: false,
}

module.exports = nextConfig

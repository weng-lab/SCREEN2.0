/** @type {import('next').NextConfig} */

let assetPrefix = ''
let basePath = ''

const nextConfig = {
  // output: "export",
  //Image optimization incompatible with static exports
  images: { unoptimized: true },
  devIndicators: {
    buildActivityPosition: "bottom-right",
  },
  generateEtags: false,
  trailingSlash: false,
  assetPrefix: assetPrefix,
  basePath: basePath,
  experimental: {
    serverActions: true,
  },
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
        // don't resolve 'fs' module on the client to prevent this error on build --> Error: Can't resolve 'fs'
        config.resolve.fallback = {
            fs: false
        }
    }

    return config;
  }
}

module.exports = nextConfig

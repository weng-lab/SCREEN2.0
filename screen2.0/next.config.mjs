// @ts-check
 
/**
 * @type {import('next').NextConfig}
 */

const nextConfig = {
  // output: "export",
  //Image optimization incompatible with static exports
  images: { unoptimized: true },
  devIndicators: {
    position: "bottom-right",
  },
  generateEtags: false,
  trailingSlash: false,
  assetPrefix: '',
  basePath: '',
  logging: {
    fetches: {
      fullUrl: true,
    },
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

export default nextConfig
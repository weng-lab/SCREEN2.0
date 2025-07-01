// @ts-check
 
/**
 * @type {import('next').NextConfig}
 */

const nextConfig = {
  // output: "export",
  //Image optimization incompatible with static exports
  images: { unoptimized: true },
  devIndicators: {
    buildActivityPosition: "bottom-right",
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

  async redirects() {
    return [
      // SCREEN Redirects (Legacy link handling)
      {
        source: '/geApp',
        destination: '/applets/gene-expression',
        permanent: true,
      },
      {
        source: '/index/about',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/index/cversions',
        destination: '/about',
        permanent: true,
      },
    ]
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
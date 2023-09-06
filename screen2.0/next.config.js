/** @type {import('next').NextConfig} */



/**
 * Configure the Next.js next/image, next/link, and next/router to expect the github pages URL
 * Note: High probability this may have implications for the real deployment, I'm not completely sure.
 * The check to see if it's running in github Actions needs to be checked more thoroughly to see if its
 * being run in the workflow to push to github pages specifically.
 * https://nextjs.org/docs/pages/api-reference/next-config-js/assetPrefix
 * https://nextjs.org/docs/pages/api-reference/next-config-js/basePath
 * 
 *  https://github.com/vercel/next.js/issues/48996
 *  There is a bug in current release of Next.js that messes with links that are href="" or href="/"
 *  Currently, they're broken if you click directly (but not if you open in new tab????) Weird stuff
 * 
 * */ 

// const isGithubActions = process.env.GITHUB_ACTIONS || false

// let assetPrefix = ''
// let basePath = ''

// if (isGithubActions) {
//   assetPrefix = '/SCREEN2.0/'
//   basePath = '/SCREEN2.0'
// }


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

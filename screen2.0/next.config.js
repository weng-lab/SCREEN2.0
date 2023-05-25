/** @type {import('next').NextConfig} */

// Configure the Next.js next/image, next/link, and next/router to expect the github pages URL
// Note: High probability this may have implications for the real deployment, I'm not completely sure
// https://nextjs.org/docs/pages/api-reference/next-config-js/assetPrefix
// https://nextjs.org/docs/pages/api-reference/next-config-js/basePath

// May need to mess with images 

const isGithubActions = process.env.GITHUB_ACTIONS || false

let assetPrefix = ''
let basePath = ''

if (isGithubActions) {
  // trim off `<owner>/`
  // const repo = process.env.GITHUB_REPOSITORY.replace(/.*?\//, '')

  assetPrefix = '/SCREEN2.0'
  basePath = '/SCREEN2.0'
}

const nextConfig = {
  reactStrictMode: true,
  devIndicators: {
    buildActivityPosition: "bottom-right",
  },
  generateEtags: false,
  trailingSlash: false,
  assetPrefix: assetPrefix,
  basePath: basePath,
}

module.exports = nextConfig

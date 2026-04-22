// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // В браузере полностью игнорируем pdf-parse
      config.resolve.alias = {
        ...config.resolve.alias,
        'pdf-parse': false,
        'pdfjs-dist': false,
        'canvas': false,
      }
    }
    return config
  },
  
  experimental: {
    serverComponentsExternalPackages: [
      'pdf-parse',
      'pdfjs-dist',
      'canvas'
    ],
  },
  
  serverActions: {
    bodySizeLimit: '100mb',
  },
}

export default nextConfig

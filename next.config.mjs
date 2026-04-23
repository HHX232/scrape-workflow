/** @type {import('next').NextConfig} */
const nextConfig = {
  // ВАЖНО: Включаем standalone output для Docker
  output: 'standalone',
  
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
    
    // ВАЖНО: Добавляем поддержку .node файлов (бинарники Prisma)
    config.module.rules.push({
      test: /\.node$/,
      use: 'raw-loader',
    });
    
    // ВАЖНО: Для серверной части - external для Prisma
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('_prisma_client_');
      
      // Копируем Prisma engine в standalone сборку
      config.resolve.alias = {
        ...config.resolve.alias,
        '.prisma/client': false,
      };
    }
    
    return config
  },
  
  experimental: {
    serverComponentsExternalPackages: [
      'pdf-parse',
      'pdfjs-dist',
      'canvas',
      '@prisma/client',  // ВАЖНО: Добавляем Prisma
      'prisma',          // ВАЖНО: Добавляем Prisma
    ],
  },
  
  serverActions: {
    bodySizeLimit: '100mb',
  },
  
  // ВАЖНО: Игнорируем ошибки TypeScript при сборке
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ВАЖНО: Игнорируем ошибки линтера при сборке
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
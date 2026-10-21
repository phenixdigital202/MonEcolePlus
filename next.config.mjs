process.env.NEXT_EXPERIMENTAL_WORKER_THREADS = 'false'

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
}

export default nextConfig
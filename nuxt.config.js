module.exports = {
  ssr: false,
  app: {
    baseURL: '/twrpg/'
  },
  vite: {
    define: {
      'process.env': {}
    },
    resolve: {
      alias: {
        stream: 'stream-browserify',
        zlib: 'browserify-zlib'
      },
      'process.env.NODE_DEBUG': {}
    }
  }
}

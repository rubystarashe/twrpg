module.exports = {
  ssr: false,
  target: 'static',
  router: {
    base: '/twrpg/'
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

module.exports = {
  ssr: false,
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

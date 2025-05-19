import esbuild from 'esbuild'
import { stylusLoader } from 'esbuild-stylus-loader'

console.log('--------------------------')
console.log('Building and serving assets')

// esbuild.serve watches for file changes and rebuilds
esbuild.context({
  entryPoints: ['src/Index.js'],
  outfile: 'dist/okapi.js',
  bundle: true,
  sourcemap: false,
  minify: false,
  format: 'esm',
  loader: {
    '.png': 'dataurl'
  },
  plugins: [
    stylusLoader()
  ]
}).then(server => {
  server.serve({
    servedir: './',
  }).then(({ host, port }) => {
    console.log('Serving at localhost:' + port)
  })
})

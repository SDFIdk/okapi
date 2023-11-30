import esbuild from 'esbuild'
import { stylusLoader } from 'esbuild-stylus-loader'

console.log('--------------------------')
console.log('Building and serving assets')

// esbuild.serve watches for file changes and rebuilds
esbuild.serve({
  servedir: './',
}, {
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
  console.log(server)
  // Call "stop" on the web server to stop serving
  //server.stop()
})

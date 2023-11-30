import esbuild from 'esbuild'
import { stylusLoader } from 'esbuild-stylus-loader'
import pkg from '../package.json' assert {type: 'json'}

const filename = `${ pkg.name }-${ pkg.version }.min`

const entry_points = {
  [filename]: 'src/Index.js'
}

console.log('--------------------------')
console.log('Building JS and CSS assets')

if (process.env.NODE_ENV === 'development') {
  // Development mode watches for file changes and rebuilds

  esbuild.serve({
    servedir: './',
  }, {
    entryPoints: entry_points,
    outdir: 'lib',
    bundle: true,
    format: 'iife',
    globalName: 'okapi',
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

} else {
  // Production build
  esbuild.build({
    entryPoints: entry_points,
    outdir: 'lib',
    bundle: true,
    minify: true,
    sourcemap: true,
    format: 'iife',
    globalName: 'okapi',
    loader: { 
      '.png': 'dataurl'
    },
    plugins: [
      stylusLoader()
    ]
  })
  .then((response) => {
    console.log('Build finished 👍')
  })
  .catch(() => process.exit(1))
}

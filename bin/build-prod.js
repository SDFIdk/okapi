import esbuild from 'esbuild'
import { stylusLoader } from 'esbuild-stylus-loader'
import pkg from '../package.json' with {type: 'json'}

console.log('--------------------------')
console.log('Building ES modules and CSS')

const shared = {
  entryPoints: ['src/Index.js'],
  bundle: true,
  sourcemap: true,
  format: 'esm',
  loader: { 
    '.png': 'dataurl'
  },
  plugins: [
    stylusLoader()
  ]
}

// Production build dist JS/CSS
esbuild.build({
  ...shared,
  outfile: 'dist/okapi.js',
  minify: false
})
.then((response) => {
  console.log('Build finished. `dist` updated 👍')
})
.catch(() => process.exit(1))

// Production build dist JS/CSS minified
esbuild.build({
  ...shared,
  outfile: 'dist/okapi.min.js',
  minify: true
})
.then((response) => {
  console.log('Build finished. `dist` minified updated 👍')
})
.catch(() => process.exit(1))

// Production build lib JS/CSS
const filename = `okapi-${ pkg.version }.min`
const entry_points = {[filename]: 'src/Index.js'}
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
  console.log('Build finished. `lib` minified versioned files created 👍')
})
.catch(() => process.exit(1))
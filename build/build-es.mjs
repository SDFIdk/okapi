import esbuild from 'esbuild'
import { stylusLoader } from 'esbuild-stylus-loader'

console.log('--------------------------')
console.log('Building ES modules and CSS')

// Production build dist
esbuild.build({
  entryPoints: ['src/Index.js'],
  outfile: 'dist/okapi.js',
  bundle: true,
  minify: false,
  format: 'esm',
  sourcemap: true,
  loader: { 
    '.png': 'dataurl'
  },
  plugins: [
    stylusLoader()
  ]
})
.then((response) => {
  console.log('Build finished. `dist` updated 👍')
})
.catch(() => process.exit(1))

// Production build dist minified
esbuild.build({
  entryPoints: ['src/Index.js'],
  outfile: 'dist/okapi.min.js',
  bundle: true,
  minify: true,
  format: 'esm',
  sourcemap: true,
  loader: { 
    '.png': 'dataurl'
  },
  plugins: [
    stylusLoader()
  ]
})
.then((response) => {
  console.log('Build finished. `dist` minified updated 👍')
})
.catch(() => process.exit(1))

// Build for docs
esbuild.build({
  entryPoints: ['src/Index.js'],
  outfile: 'docs/okapi.min.js',
  bundle: true,
  minify: true,
  format: 'esm',
  sourcemap: true,
  loader: { 
    '.png': 'dataurl'
  },
  plugins: [
    stylusLoader()
  ]
})
.then((response) => {
  console.log('Build finished. `docs` minified updated 👍')
})
.catch(() => process.exit(1))

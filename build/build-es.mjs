import esbuild from 'esbuild'
import { stylusLoader } from 'esbuild-stylus-loader'

const entry_points = {
  index: 'src/Index.js'
}

console.log('--------------------------')
console.log('Building ES module')

// Production build

esbuild.build({
  entryPoints: ['src/Index.js'],
  outfile: 'dist/index.js',
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
  console.log('Build finished. `dist` updated 👍')
})
.catch(() => process.exit(1))


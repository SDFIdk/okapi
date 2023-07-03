import esbuild from 'esbuild'
import { stylusLoader } from 'esbuild-stylus-loader'

const entry_points = {
  index: 'src/Index.js'
}

console.log('--------------------------')
console.log('Building ES module')

// Production build
esbuild.build({
  entryPoints: entry_points,
  outdir: 'dist',
  bundle: true,
  minify: true,
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


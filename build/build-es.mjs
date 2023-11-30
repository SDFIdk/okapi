import esbuild from 'esbuild'
import { stylusLoader } from 'esbuild-stylus-loader'

console.log('--------------------------')
console.log('Building ES module')

const destinations = ['dist', 'docs']

// Production build

destinations.forEach((destination) => {

  esbuild.build({
    entryPoints: ['src/Index.js'],
    outfile: `${ destination }/okapi.js`,
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

})

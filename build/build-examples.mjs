// Imports
import { open, readdir } from 'node:fs/promises'
import pkg from '../package.json' assert {type: 'json'}
import getSRI from 'get-sri'
import dotenv from 'dotenv'

dotenv.config()

// Helper functions
async function readHTML(path) {
  let filehandle
  let html = ''
  try {
    filehandle = await open(path, 'r+')
    filehandle.readFile('utf8').then(function(contents) {
      html += contents
    })
  } catch (error) {
    console.error('there was an error:', error.message)
  } finally {
    await filehandle?.close()
    return html
  }
}

async function writeHTML(file, html) {
  let filehandle
  try {
    filehandle = await open(file, 'w')
    filehandle.writeFile(html, 'utf8').then(function() {
      // File was written
    })
  } catch (error) {
    console.error('there was an error:', error.message)
  } finally {
    await filehandle?.close()
  }
}

// Variables
const src_dir = 'src/examples'
const template_html = await readHTML(`${src_dir}/templates/template.html`)
const template_code_html = await readHTML(`${src_dir}/templates/template-code.html`)
const js_file_str = await readHTML(`lib/${ pkg.name }-${ pkg.version }.min.js`)
const code_sri_str = getSRI(js_file_str, getSRI.SHA384, true)

const token = process.env.TOKEN
const username = process.env.DFUSERNAME
const password = process.env.DFPASSWORD

// Start building
console.log('---------------------')
console.log('Building example HTML')
try {

  const files = await readdir(`${src_dir}/html`)
  for (const file of files) {
    let title = String(file)
    title = title.replace('.html', '').replace('-', ' ').replace(/^./g, title[0].toUpperCase())

    const markup = await readHTML(`${ src_dir }/html/${ file }`)
    
    const css_str = `../lib/${ pkg.name }-${ pkg.version }.min.css`
    const js_str = `../lib/${ pkg.name }-${ pkg.version }.min.js`

    let temp = template_html.replace('InsertContentHere', markup).replace('InsertYourTitleHere', title)
    temp = temp.replace('InsertCSSHere', css_str)
    temp = temp.replace('InsertJSHere', js_str)
    temp = temp.replaceAll('InsertYourTokenHere', token)
    temp = temp.replaceAll('InsertYourUsernameHere', username)
    temp = temp.replaceAll('InsertYourPasswordHere', password)

    const code_css_str = `https://cdn.jsdelivr.net/gh/SDFIdk/okapi@latest/lib/${ pkg.name }-${ pkg.version }.min.css`
    const code_js_str = `https://cdn.jsdelivr.net/gh/SDFIdk/okapi@latest/lib/${ pkg.name }-${ pkg.version }.min.js`
    

    let code = template_code_html.replace('InsertContentHere', markup).replaceAll('<', '&lt;')
    code = code.replace('InsertCodeCSSHere', code_css_str)
    code = code.replace('InsertCodeJSHere', code_js_str)
    code = code.replace('InsertCodeSRIHere', code_sri_str)
    temp = temp.replace('InsertCodeExampleHere', code)
    
    await writeHTML(`examples/${ file }`, temp)

  }

} catch (err) {
  console.error(err)
} 

console.log('---------------------')
console.log('Updating README')
try {

  let readme = await readHTML('README.md')
  readme = readme.replaceAll(/\d\.\d\.\d/g, pkg.version)
  readme = readme.replaceAll(/"sha384-.+"/g, `"${ code_sri_str }"`)
  await writeHTML('README.md', readme)

} catch (err) {
  console.error(err)
}

console.log('---------------------')
console.log('Done 👍')

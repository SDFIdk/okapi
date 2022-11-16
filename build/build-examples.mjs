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

const token = process.env.TOKEN
const username = process.env.DFUSERNAME
const password = process.env.DFPASSWORD
const version = pkg.version

let min

// Start building
console.log('---------------------')
console.log('Building example HTML')
try {

  const files = await readdir(`${src_dir}/html`)
  for (const file of files) {

    const filename = file + '.test.html'
    const markup = await readHTML(`${ src_dir }/html/${ file }`)
    
    const data = {
      
      username: username,
      password: password,
      version: version,
      sri: min ? getSRI(min, getSRI.SHA384, true) : ''
    }

    let temp = template_html.replace('InsertContentHere', markup).replace('InsertYourTitleHere', file)
    let code = template_code_html.replace('InsertContentHere', markup).replaceAll('<', '&lt;')
    temp = temp.replace('InsertCodeExampleHere', code)
    temp = temp.replace('InsertYourTokenHere', token)
    await writeHTML(`examples/${ file }`, temp)

  }

} catch (err) {
  console.error(err)
} 

console.log('Done 👍')

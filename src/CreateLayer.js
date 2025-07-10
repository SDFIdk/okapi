import TileLayer from 'ol/layer/Tile'
import WMTS from 'ol/source/WMTS'
import TileWMS from 'ol/source/TileWMS'
import { retryOptions, fetchWithRetry } from '@dataforsyningen/retry/index.js'
import { Size } from './constants'

// Set the default retry timeout for webservices.
retryOptions.timeout = 200

const ccbyText = '(CC BY)'
const ccbyLink = 'https://creativecommons.org/licenses/by/4.0/deed.da'

const createAttribution = function (link, text) {
  return '<a target="_blank" href="' + ccbyLink + '">' + ccbyText + 
    '</a> <a target="_blank" href="' + link + '">' + text + '</a>'
}

const createUrl = function (service, auth) {
  if (auth.source === 'kf') {
    const baseUrl = 'https://api.dataforsyningen.dk/'
    return baseUrl + service
  } else if (auth.source === 'df') {
    const baseUrl = 'https://services.datafordeler.dk/'
    return baseUrl + service + '?username=' + auth.username + '&password=' + auth.password
  }
  console.error('Unknown source: "' + auth.source + '"')
  return null
}

// Custom setTileLoadFunction to add a header with a token
const getTileLoadFunction = (auth) => {
  return (tile, src) => {
    const options = {}
    if (auth.source === 'kf') {
      options.headers = { token: auth.token }
    }
    fetchWithRetry(src, options)
      .then(response => {
        if (!response.ok) {
          tile.setState(TileState.ERROR)
        }
        return response.blob()
      })
      .then(blob => {
        tile.getImage().src = URL.createObjectURL(blob)
      })
      .catch((e) => {
        tile.setState(TileState.ERROR)
      })
  }
}

export const createLayer = function (opt) {
  const name = opt.name || ''
  const type = opt.type || ''
  const title = opt.title || name
  const color = 'white'
  const visible = !!opt.visible
  const auth = opt.auth
  const service = opt.service || ''
  const layer = opt.layer || ''
  const style = opt.style || 'default'
  const version = opt.version || '1.1.1'
  const matrixSet = opt.matrixSet
  const format = opt.format || ''
  const tileGrid = opt.tileGrid
  const attributionText = createAttribution(opt.attribution?.link || '', opt.attribution?.text || '')

  let source = null

  if (type === 'WMTS') {
    source = new WMTS({
      attributions: attributionText,
      crossOrigin: 'Anonymous',
      url: createUrl(service, auth),
      layer: layer,
      matrixSet: matrixSet,
      format: format,
      tileGrid: tileGrid,
      style: style,
      size: Size,
      tileLoadFunction: getTileLoadFunction(auth)
    })
  } else if (type === 'WMS') {
    source = new TileWMS({
      attributions: attributionText,
      crossOrigin: 'Anonymous',
      url: createUrl(service, auth),
      params: {
        'LAYERS': layer,
        'VERSION': version,
        'TRANSPARENT': 'true',
        'FORMAT': format,
        'STYLES': style
      },
      tileLoadFunction: getTileLoadFunction(auth)
    })
  } else {
    console.error('Unknown service type: "' + type + '"')
    return null
  }

  return new TileLayer({
    opacity: 1.0,
    title: title,
    name: name,
    color: color,
    type: 'base',
    visible: visible,
    source: source,
    preload: Infinity
  })
}

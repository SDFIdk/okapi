import OlMap from 'ol/Map'
import View from 'ol/View'
import Group from 'ol/layer/Group'
import TileLayer from 'ol/layer/Tile'
import WMTS from 'ol/source/WMTS'
import WMTSTileGrid from 'ol/tilegrid/WMTS'
import TileWMS from 'ol/source/TileWMS'
import proj4 from 'proj4/dist/proj4'
import { register } from 'ol/proj/proj4'
import { get as getProjection } from 'ol/proj'
import { createEmpty, extend } from 'ol/extent'
import {defaults as defaultControls, ScaleLine, ZoomSlider, Attribution, FullScreen} from 'ol/control'
import MyLocation from './control/MyLocation'
import LayerSwitcher from './control/LayerSwitcher'
import CreateMarkers from './control/markers/CreateMarkers'
import { fromLonLat } from 'ol/proj'
import CreateMarkerTooltip from './control/markers/CreateMarkerTooltip'
import { Size } from './constants'
import VectorLayer from 'ol/layer/Vector'
import { any } from './utility/IsMobile'

const kfText = any() ? 'SDFE' : 'Styrelsen for Dataforsyning og Effektivisering'
const kfLink = 'https://download.kortforsyningen.dk/content/vilk%C3%A5r-og-betingelser'
const kfAttributionText = '&copy; <a target="_blank" href="' + kfLink +
'">' + kfText + '</a>'
const dfLink = 'https://datafordeler.dk/vejledning/brugervilkaar/sdfe-geografiske-data/'
const dfAttributionText = '&copy; <a target="_blank" href="' + dfLink +
'">' + kfText + '</a>'

export const createLayer = function (opt) {
  const name = opt.name || ''
  const type = opt.type || ''
  const title = opt.title || name
  const color = opt.color || 'black'
  const visible = !!opt.visible
  const auth = opt.auth
  const service = opt.service || ''
  const layer = opt.layer || ''
  const version = opt.version || '1.1.1'
  const matrixSet = opt.matrixSet
  const format = opt.format || ''
  const tileGrid = opt.tileGrid
  const attributionText = opt.auth.source === 'kf' ? kfAttributionText : dfAttributionText

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
      style: 'default',
      size: Size
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
        'STYLES': ''
      }
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
    source: source
  })
}

const createUrl = function (service, auth) {
  if (auth.source === 'kf') {
    const baseUrl = 'https://services.kortforsyningen.dk/'

    return baseUrl + service + '?token=' + auth.token
  }
  else if (auth.source === 'df') {
    const baseUrl = 'https://services.datafordeler.dk/'

    return baseUrl + service + '?username=' + auth.username + '&password=' + auth.password
  } else {
    console.error('Unknown source: "' + auth.source + '"')
  }
}

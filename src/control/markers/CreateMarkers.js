import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Cluster from 'ol/source/Cluster'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { fromLonLat } from 'ol/proj'
import {
  Circle as CircleStyle,
  Fill,
  Stroke,
  Style,
  Icon,
  Text
} from 'ol/style.js'
import pin from '../images/pin.png'
import './CreateMarkers.styl'

function createStyleFunction(icon) {
  const styleCache = {}
  return (feature) => {
    const size = feature.get('features')?.length
    
    if (size === 1) {
      return new Style({
        image: new Icon(({
          anchor: [0.5, 1],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          src: icon
        }))
      })
    }

    let style = styleCache[size]

    if (!style) {
      style = new Style({
        image: new CircleStyle({
          radius: 10,
          stroke: new Stroke({
            color: '#fff'
          }),
          fill: new Fill({
            color: '#C84A38'
          })
        }),
        text: new Text({
          text: size.toString(),
          fill: new Fill({
            color: '#fff'
          })
        })
      })
      styleCache[size] = style
    }
    return style
  }
}

async function createFeature(marker) {
  const dawsUrl = 'https://dawa.aws.dk/adresser?format=json&struktur=mini&q='
  const feature = new Feature()
  for (let key in marker) {
    feature.set(key, marker[key])
  }
  if (marker.lon && marker.lat) {
    feature.set('geometry', new Point(fromLonLat([marker.lon, marker.lat], 'EPSG:25832')))
  } else if (marker.address) {
    const response = await fetch(`${dawsUrl}${marker.address}`)
    const data = await response.json()
    feature.set('geometry', new Point(fromLonLat([data[0].x, data[0].y], 'EPSG:25832')))
  }
  return feature
}

async function createFeatures(markers, icons) {
  let featureGroups = {default: []}
  // We use available icons to determine number of types to visualize. 
  // Types that are not associated with an icon, will be added to the "default" layer
  Object.keys(icons).forEach((i) => {
    featureGroups[i] = []
  })
  for (const marker of markers) {
    const newFeature = await createFeature(marker)
    if (featureGroups[marker.type]) {
      featureGroups[marker.type].push(newFeature)
    } else {
      featureGroups.default.push(newFeature)
    }
  }
  return featureGroups
}

function createLayer(features, iconUrl) {
  const styleFunction = createStyleFunction(iconUrl)
  const vectorSource = new VectorSource({
    features: features
  })
  const clusterSource = new Cluster({
    source: vectorSource,
  })
  const vectorLayer = new VectorLayer({
    source: clusterSource,
    style: styleFunction
  })
  return vectorLayer
}

export default async function(markerArray, icons) {

  // Create features
  const featuresByType = await createFeatures(markerArray,icons)

  // Create layers
  let layers = []
  for (const [key, value] of Object.entries(featuresByType)) {
    const iconUrl = icons[key] ? icons[key] : pin
    layers.push(createLayer(value, iconUrl))
  }

  // Return array of layers pr. marker type
  return layers
}

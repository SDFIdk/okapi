import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { fromLonLat } from 'ol/proj'
import Style from 'ol/style/Style'
import Icon from 'ol/style/Icon'
import pin from '../images/pin.png'
import './CreateMarkers.styl'

function createStyle(url) {
  const src = url || pin

  return new Style({
    image: new Icon(({
      anchor: [0.5, 1],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      src: src
    }))
  })
}

function getLayer(layers, type) {
  const layer = layers.find(function(l) {
    return l.type === type
  })
  return layer
}

export default async function(markerArray, icons) {

  let layers = []
  const dawsUrl = 'https://dawa.aws.dk/adresser?format=json&struktur=mini&q='

  markerArray.forEach(function(marker) {
    let layer
    
    layer = getLayer(layers, marker.type)
    
    if (!layer) {
      const vectorSource = new VectorSource({})
      layer = new VectorLayer({
        source: vectorSource,
        style: createStyle(icons[marker.type])
      })
      layer.type = marker.type
      layers.push(layer)
    }
  })

  markerArray.forEach(async function(marker) {

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
    
    const layer = getLayer(layers, marker.type)
    layer.getSource().addFeature(feature)
  })
  
  return layers
}

import axios from 'axios'
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

export default function createMarkersFromObject(markerArray, icons, map) {
  const layers = []
  let addressCalls = []
  const dawsUrl = 'https://dawa.aws.dk/adresser?format=json&struktur=mini&q='

  markerArray.forEach(function (marker) {

    const feature = new Feature()

    for (let key in marker) {
      feature.set(key, marker[key])
    }

    if (marker.lon && marker.lat) {
      feature.set('geometry', new Point(fromLonLat([marker.lon, marker.lat], 'EPSG:25832')))
    }

    let layer = layers.find(function (type) {
      return type === marker.type
    })

    if (!layer) {
      const vectorSource = new VectorSource({})
      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: createStyle(icons[marker.type])
      })

      layers.push(vectorLayer)
      layer = vectorLayer
    }
    layer.getSource().addFeature(feature)

    if (marker.address && (!marker.lon || !marker.lat)) {
      addressCalls.push(axios({
        method: 'get',
        url: dawsUrl + marker.address,
        feature: feature
      }))
    }
  })

  if (addressCalls.length > 0) {
    axios.all(addressCalls)
      .then(axios.spread((...args) => {
        args.forEach(function (arg) {
          const markerLon = arg.data[0].x
          const markerLat = arg.data[0].y

          arg.config.feature.set('geometry', new Point(fromLonLat([markerLon, markerLat], 'EPSG:25832')))
        })
        map.autoCenter()
      }))

  }

  return layers
}

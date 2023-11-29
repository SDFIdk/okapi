import Overlay from 'ol/Overlay'
import { boundingExtent } from 'ol/extent.js'
import './CreateMarkerTooltip.styl'

export default function markerTooltip(map, custom) {

  const mapDiv = document.getElementById(map.target)

  const popup = document.createElement('div')
  let closer = document.createElement('a')
  const content = document.createElement('div')
  const title = document.createElement('div')
  const description = document.createElement('div')

  title.className = 'title'
  description.className = 'description'

  popup.className = 'ol-popup'

  mapDiv.appendChild(popup)

  if (custom) {
    popup.appendChild(custom)
    closer = custom.getElementsByClassName('closer')[0]
  } else {
    closer.className = 'ol-popup-closer'
    content.className = 'ol-popup-content'

    popup.appendChild(closer)
    popup.appendChild(content)
    content.appendChild(title)
    content.appendChild(description)
  }

  map.olMap.getOverlays().clear()

  const overlay = new Overlay({
    element: popup,
    autoPan: true,
    autoPanAnimation: {
      duration: 250
    }
  })

  map.olMap.addOverlay(overlay)

  if (closer) {
    closer.onclick = function () {
      overlay.setPosition(undefined)
      closer.blur()
      return false
    }
  }

  map.olMap.on('singleclick', function (evt) {
    const clickedFeature = map.olMap.forEachFeatureAtPixel(evt.pixel,
      function (feature) {
        return feature
      })

    if (!clickedFeature) {
      return
    }
    const features = clickedFeature.get('features')

    if (features.length > 1) { // if more than one feature, zoom.
      const extent = boundingExtent(features.map((r) => r.getGeometry().getCoordinates()))

      map.olMap.getView().fit(extent, {duration: 1000, padding: [50, 50, 50, 50]})
    } else { // if a single feature, show tooltip.
      const feature = features[0]

      if (custom) {
        custom.childNodes.forEach(function (element) {
          const content = feature.get(element.className)

          if (content) {
            element.innerHTML = content
          }
        })
      } else {
        title.innerHTML = feature.get('title') || ''
        description.innerHTML = feature.get('description') || ''
      }
      overlay.setPosition(feature.getGeometry().getCoordinates())
    }
  })

  map.olMap.on('pointermove', function (evt) {
    map.olMap.getTargetElement().style.cursor =
      map.olMap.hasFeatureAtPixel(evt.pixel) ? 'pointer' : ''
  })
}

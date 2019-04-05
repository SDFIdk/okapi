import Map from './Map'

export default class Initialize {
  constructor(opt) {

    // Push the marker DOM elements into an array.
    const markerElements = document.querySelectorAll('span.geomarker')

    // Target all map dom elements with the geomap class set
    const mapElements = document.querySelectorAll('div.geomap')

    let markers = []

    markerElements.forEach(function (element) {
      const dataset = element.dataset
      let marker = {}

      for (let key in dataset) {
        console.log()
        if (key === 'lat' || key === 'lon') {
          marker[key] = Number(dataset[key])
        } else {
          marker[key] = dataset[key]
        }
      }
      markers.push(marker)
    }, markers)

    mapElements.forEach(function (element) {
      // Filter relevant markers
      const types = (typeof element.dataset.type === 'undefined') ? [''] : element.dataset.type.split(',')
      const filteredMarkers = markers.filter(function (marker) {
        return marker.type ? (marker.type.indexOf(types) > -1) : true
      }, types)

      const autoView = element.dataset.center === 'auto'
      const center = element.dataset.centerLon ? [
        Number(element.dataset.centerLon),
        Number(element.dataset.centerLat)
      ] : 'auto'

      this._map = new Map({
        target: element.id,
        token: element.dataset.token,
        background: element.dataset.background,
        icons: opt.icons,
        markers: filteredMarkers,
        popup: opt.popup,
        showPopup: element.dataset.showPopup !== 'false',
        zoomSlider: element.dataset.zoomslider === 'true',
        fullScreen: element.dataset.fullscreen === 'true',
        myLocation: element.dataset.mylocation === 'true',
        scaleLine: element.dataset.scaleline === 'true',
        layerSwitcher: element.dataset.layerswitcher === 'true',
        view: {
          center: autoView ? 'auto' : center,
          zoom: element.dataset.zoom
        }
      })
    }, opt, markers)

  }
}

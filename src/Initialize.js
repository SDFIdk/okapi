import Map from './Map'

function scrapeMarkers() {
  
  // Push the marker DOM elements into an array.
  const markerElements = document.querySelectorAll('span.geomarker')
  const markers = []

  markerElements.forEach(function (element) {
    const dataset = element.dataset
    let marker = {}

    for (let key in dataset) {
      if (key === 'lat' || key === 'lon') {
        marker[key] = Number(dataset[key])
      } else {
        marker[key] = dataset[key]
      }
    }
    markers.push(marker)
  })

  return markers
}

function initMaps(options, markers) {
  // Target all map dom elements with the geomap class set
  const mapElements = document.querySelectorAll('div.geomap')
  let maps = []

  mapElements.forEach(function (element) {
    const d = element.dataset
    const types = (typeof d.type === 'undefined') ? [''] : d.type.split(',')

    // Filter relevant markers
    const filteredMarkers = filterMarkers(markers, types)

    const overlays = (typeof d.overlays === 'undefined') ? [''] : d.overlays.split(',')
    const filteredOverlays = options.overlays ? options.overlays.filter(function (e) {
      return e.name ? (e.name.indexOf(overlays) > -1) : true
    }) : []

    const map = generateMap({
      element: element,
      filtered_overlays: filteredOverlays,
      filtered_markers: filteredMarkers,
      opt: options
    })
    
    maps.push(map)
  })

  return maps
}

function filterMarkers(markers, types) {
  return markers.filter(function (marker) {
    return marker.type ? (marker.type.indexOf(types) > -1) : true
  })
}

function generateMap(options) {

  const d = options.element.dataset
  const center = d.centerLon ? [
    Number(d.centerLon),
    Number(d.centerLat)
  ] : 'auto'

  const map = new Map({
    target: options.element.id,
    token: d.token,
    username: d.username,
    password: d.password,
    background: d.background,
    icons: options.opt.icons,
    overlays: options.filtered_overlays,
    markers: options.filtered_markers,
    popup: options.opt.popup,
    showPopup: d.showPopup !== 'false',
    zoomSlider: d.zoomslider === 'true',
    mouseWheelZoom: d.mousewheelzoom === 'false' ? false : true,
    fullScreen: d.fullscreen === 'true',
    myLocation: d.mylocation === 'true',
    scaleLine: d.scaleline === 'true',
    layerSwitcher: d.layerswitcher === 'true',
    extent: d.extent ? JSON.parse(d.extent) : null,
    view: {
      center: d.center === 'auto' ? 'auto' : center,
      zoom: d.zoom
    }
  })

  return map
}

class Initialize {
  
  //Properties
  maps = []

  constructor(options) {
    this.init(options)
  }

  // Methods
  init(options) {
    this.maps = initMaps(options, scrapeMarkers())
  }

  refresh() {
    const markers = scrapeMarkers()

    this.maps.forEach(function(map) {

      // Filter relevant markers
      const t = map.olMap.getTargetElement().dataset.type
      const types = (typeof t === 'undefined') ? [''] : t.split(',')
      const filteredMarkers = filterMarkers(markers, types)

      map.setMarkers(filteredMarkers)
    })
  }

}

export default Initialize

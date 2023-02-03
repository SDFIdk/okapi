import OlMap from 'ol/Map'
import View from 'ol/View'
import Group from 'ol/layer/Group'
import WMTSTileGrid from 'ol/tilegrid/WMTS'
import proj4 from 'proj4/dist/proj4'
import { register } from 'ol/proj/proj4'
import { get as getProjection } from 'ol/proj'
import { createEmpty, extend } from 'ol/extent'
import { defaults as defaultControls, ScaleLine, ZoomSlider, Attribution, FullScreen } from 'ol/control'
import { defaults as defaultInteractions } from 'ol/interaction/defaults'
import MyLocation from './control/MyLocation'
import LayerSwitcher from './control/LayerSwitcher'
import CreateMarkers from './control/markers/CreateMarkers'
import { createLayer } from './CreateLayer'
import { fromLonLat } from 'ol/proj'
import CreateMarkerTooltip from './control/markers/CreateMarkerTooltip'
import { Center, Extent, Resolutions, MatrixIds } from './constants'
import VectorLayer from 'ol/layer/Vector'

import 'ol/ol.css'
import './Map.styl'
import './ZoomSlider.styl'
import './ScaleLine.styl'
import './FullScreen.styl'
import { none } from 'ol/centerconstraint'

export default class Map {

  markers = []
  icons = {}
  markerLayerGroup
  markerLayers
  popup
  showPopup

  set markers(markers) {
    this.setMarkers(markers)
  }

  constructor(opt) {

    this.icons = opt.icons || {}

    const background = opt.background || ''
    const zoomSlider = typeof opt.zoomSlider === 'undefined' ? true : opt.zoomSlider
    const scaleLine = typeof opt.scaleLine === 'undefined' ? true : opt.scaleLine
    const layerSwitcher = opt.layerSwitcher || false
    const myLocation = typeof opt.myLocation === 'undefined' ? true : opt.myLocation
    const view = opt.view
    const autoCenter = view && view.center === 'auto'
    const center = (view && typeof view.center !== 'string') ?
      (view.center || Center) : Center
    const autoZoom = view && view.zoom === 'auto'
    const mouseWheelZoom = typeof opt.mouseWheelZoom === 'undefined' ? true : opt.mouseWheelZoom
    const overrideExtent = opt.extent || false

    this.zoom = view ? view.zoom || 2 : 2
    const fullScreen = typeof opt.fullScreen === 'undefined' ? true : opt.fullScreen

    this.popup = opt.popup || null
    this.showPopup = typeof opt.showPopup === 'undefined' ? true : opt.showPopup

    this._target = opt.target || 'map'
    this._source = opt.source || 'kf'
    this._token = opt.token || ''
    this._username = opt.username || ''
    this._password = opt.password || ''
    this.autocenter = autoCenter
    this.autoZoom = autoZoom

    proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs')
    register(proj4)
    const projection = getProjection('EPSG:25832')

    projection.setExtent(Extent)

    const kfTileGrid = new WMTSTileGrid({
      extent: Extent,
      resolutions: Resolutions,
      matrixIds: MatrixIds
    })
    const kfTileGrid2 = new WMTSTileGrid({
      extent: Extent,
      resolutions: Resolutions,
      matrixIds: ['L00', 'L01', 'L02', 'L03', 'L04', 'L05', 'L06', 'L07', 'L08', 'L09', 'L10', 'L11', 'L12', 'L13']
    })
    const dfTileGrid = new WMTSTileGrid({
      extent: Extent,
      resolutions: Resolutions,
      matrixIds: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13']
    })
    const kfAuth = {
      source: 'kf',
      token: this._token
    }
    const dfAuth = {
      source: 'df',
      username: this._username,
      password: this._password
    }
    const layers = []

    if (this._username && this._password) { // Datafordeleren bruger
      layers.push(createLayer({
        name: 'dtk_skaermkort',
        type: 'WMTS',
        title: 'Skærmkort',
        visible: background === 'dtk_skaermkort',
        service: 'DKskaermkort/topo_skaermkort_wmts/1.0.0/Wmts',
        layer: 'topo_skaermkort',
        matrixSet: 'View1',
        format: 'image/jpeg',
        tileGrid: dfTileGrid,
        auth: dfAuth
      }))
      layers.push(createLayer({
        name: 'dtk_skaermkort_daempet',
        type: 'WMTS',
        title: 'Skærmkort dæmpet',
        visible: background !== 'orto_foraar' && background !== 'forvaltning' &&
        background !== 'dtk_skaermkort',
        service: 'DKskaermkort/topo_skaermkort_daempet/1.0.0/Wmts',
        layer: 'topo_skaermkort_daempet',
        matrixSet: 'View1',
        format: 'image/jpeg',
        tileGrid: dfTileGrid,
        auth: dfAuth
      }))
      layers.push(createLayer({
        name: 'orto_foraar',
        type: 'WMTS',
        title: 'Ortofoto',
        color: 'white',
        visible: background === 'orto_foraar',
        service: 'GeoDanmarkOrto/orto_foraar_wmts/1.0.0/Wmts',
        layer: 'orto_foraar_wmts',
        matrixSet: 'KortforsyningTilingDK',
        format: 'image/jpeg',
        tileGrid: dfTileGrid,
        auth: dfAuth
      }))
    } else if (this._token) { // Dataforsyningen bruger
      layers.push(createLayer({
        name: 'dtk_skaermkort',
        type: 'WMTS',
        title: 'Skærmkort',
        visible: background === 'dtk_skaermkort',
        service: 'topo_skaermkort_wmts_DAF',
        layer: 'topo_skaermkort',
        matrixSet: 'View1',
        format: 'image/jpeg',
        tileGrid: kfTileGrid,
        auth: kfAuth
      }))
      layers.push(createLayer({
        name: 'dtk_skaermkort_daempet',
        type: 'WMTS',
        title: 'Skærmkort dæmpet',
        visible: background !== 'orto_foraar' && background !== 'forvaltning' &&
        background !== 'dtk_skaermkort',
        service: 'topo_skaermkort_daempet_DAF',
        layer: 'topo_skaermkort_daempet',
        matrixSet: 'View1',
        format: 'image/jpeg',
        tileGrid: kfTileGrid,
        auth: kfAuth
      }))
      layers.push(createLayer({
        name: 'orto_foraar',
        type: 'WMTS',
        title: 'Ortofoto',
        color: 'white',
        visible: background === 'orto_foraar',
        service: 'orto_foraar_wmts_DAF',
        layer: 'orto_foraar_wmts',
        matrixSet: 'KortforsyningTilingDK',
        format: 'image/jpeg',
        tileGrid: kfTileGrid,
        auth: kfAuth
      }))
    }
    if (this._token) { // Dataforsyningen bruger
      layers.push(createLayer({
        name: 'forvaltning',
        type: 'WMS',
        title: 'Basiskort',
        visible: background === 'forvaltning',
        service: 'forvaltning2',
        layer: 'basis_kort',
        format: 'image/png',
        auth: kfAuth
      }))
      layers.push(createLayer({
        name: 'kommunikation',
        type: 'WMS',
        title: 'Kommunikation',
        visible: background === 'kommunikation',
        service: 'kommunikation',
        layer: 'Kommunikationskort',
        format: 'image/png',
        auth: kfAuth
      }))
      layers.push(createLayer({
        name: 'natur_friluftskort',
        type: 'WMTS',
        title: 'Natur og Friluftskort',
        visible: background === 'natur_friluftskort',
        service: 'natur_friluftskort',
        layer: 'nfkort',
        matrixSet: 'View1',
        format: 'image/jpeg',
        tileGrid: kfTileGrid2,
        auth: kfAuth
      }))
    }

    const overlays = []

    if (opt.overlays) {
      opt.overlays.forEach(function (e) {
        if (e.source === 'kf') {
          e.auth = kfAuth
          e.tileGrid = kfTileGrid
        } else if (e.source === 'df') {
          e.auth = dfAuth
          e.tileGrid = dfTileGrid
        }
        overlays.push(createLayer(e))
      })
    }

    this._map = new OlMap({
      target: this._target,
      layers: [
        new Group({
          'title': 'Base maps', // This title of the group is shown in the layer switcher
          layers: layers
        }),
        new Group({
          'title': 'Kort',
          layers: overlays
        }),
        new Group({
          'title': 'Hidden',
          layers: []
        })
      ],
      controls: defaultControls({ attribution: false, zoom: zoomSlider }),
      interactions: defaultInteractions({ mouseWheelZoom: mouseWheelZoom }),
      view: new View({
        center: fromLonLat(center, 'EPSG:25832'),
        zoom: this.zoom,
        resolutions: kfTileGrid.getResolutions(),
        projection: projection,
        extent: overrideExtent ? overrideExtent : Extent
      })
    })
    this._map.addControl(new Attribution({ collapsible: false }))
    scaleLine && this._map.addControl(new ScaleLine())
    zoomSlider && this._map.addControl(new ZoomSlider())
    fullScreen && this._map.addControl(new FullScreen())
    myLocation && this._map.addControl(new MyLocation({ zoomSlider: zoomSlider }))
    this._layerSwitcher = new LayerSwitcher({ visible: layerSwitcher })
    this._map.addControl(this._layerSwitcher)

    this.setMarkers(opt.markers)

    this.autoCenter()

    this._map.on('click', function (evt) {
      const focus = document.activeElement

      focus.blur()
    })

    if (zoomSlider) {
      this.adjustControlsCss()
    }

    this._map.on('change:size', () => {
      this.adjustControlsCss()
    })
  }

  setMarkers(markers) {

    if (!markers) {
      return
    }

    this.markerLayers = CreateMarkers(markers, this.icons, this)

    this._map.removeLayer(this.markerLayerGroup)
    this.markerLayerGroup = new Group({layers: this.markerLayers})
    this._map.addLayer(this.markerLayerGroup)

    this.showPopup && CreateMarkerTooltip(this, this.popup)
  }

  addVectorLayer(vector, styles, name) {
    this._map.addLayer(new VectorLayer({
      name: name,
      visible: false,
      source: vector,
      style: styles
    }))
  }

  getVectorLayer(name) {
    return this._map.getLayers().getArray().find(function (e) {
      return e.get('name') === 'name'
    })
  }

  autoCenter() {
    if (!this.autocenter || !this.markerLayers[0]) {
      return
    }
    const extent = createEmpty()

    this.markerLayers.forEach(function (layer) {
      extend(extent, layer.getSource().getExtent())
    })
    if (extent[0] === Infinity) {
      return
    }
    this._map.getView().fit(extent)
    this._map.getView().setZoom(Math.floor(this._map.getView().getZoom()))
    if (!this.autoZoom) {
      this._map.getView().setZoom(this.zoom)
    }
    this._map.updateSize()
  }

  toggleBackground(background) {
    this._layerSwitcher.toggleBackground(background)
  }

  toggleLayer(layer, value) {
    const layers = this._map.getLayers().getArray()
    const vectorLayer = layers.find(function (e) {
      return e.get('name') === layer
    })

    if (vectorLayer) {
      vectorLayer.setVisible(value)
      return
    }
    const overlays = layers.find(function (e) {
      return e.get('title') === 'Kort'
    })

    overlays.get('layers').getArray().forEach(function (e, idx, a) {
      if (e.get('name') === layer) {
        e.setVisible(value)
      }
    })
  }

  adjustControlsCss() {
    const findElementBelongingToThisMap = (collection) => {
      const array = Array.prototype.slice.call(collection)
      return array.find((el) => {
        return !!el.closest('#' + this.target)
      })
    }
    const slider = findElementBelongingToThisMap(document.getElementsByClassName('ol-zoomslider'))
    const button = findElementBelongingToThisMap(document.getElementsByClassName('ol-zoom-out'))
    const myLoc = findElementBelongingToThisMap(document.getElementsByClassName('ol-my-location'))
    const mapHeight = document.getElementById(this.target).offsetHeight

    if (mapHeight < 300) {
      if (slider) {
        slider.style.display = none
      }
      if (myLoc) {
        myLoc.style.bottom = '97px'
      }
    } else {
      if (button) {
        const m = Math.floor(mapHeight * 0.25) + 6 + 'px' // 25% + 6px
        button.style.marginTop = m
      }
    }
  }

  get olMap() {
    return this._map
  }

  get target() {
    return this._target
  }
}

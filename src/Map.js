import OlMap from 'ol/Map'
import View from 'ol/View'
import Group from 'ol/layer/Group'
import WMTSTileGrid from 'ol/tilegrid/WMTS'
import proj4 from 'proj4/dist/proj4'
import { register } from 'ol/proj/proj4'
import { get as getProjection } from 'ol/proj'
import { createEmpty, extend } from 'ol/extent'
import {defaults as defaultControls, ScaleLine, ZoomSlider, Attribution, FullScreen} from 'ol/control'
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

export default class Map {

  constructor(opt) {
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

    this.zoom = view ? view.zoom || 2 : 2
    const fullScreen = typeof opt.fullScreen === 'undefined' ? true : opt.fullScreen
    const markers = opt.markers || []
    const icons = opt.icons || {}
    const popup = opt.popup || null
    const showPopup = typeof opt.showPopup === 'undefined' ? true : opt.showPopup

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

    if (this._username && this._password) {
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
    } else if (this._token) {
      layers.push(createLayer({
        name: 'dtk_skaermkort',
        type: 'WMTS',
        title: 'Skærmkort',
        visible: background === 'dtk_skaermkort',
        service: 'topo_skaermkort',
        layer: 'dtk_skaermkort',
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
        service: 'topo_skaermkort_daempet',
        layer: 'dtk_skaermkort_daempet',
        matrixSet: 'View1',
        format: 'image/jpeg',
        tileGrid: kfTileGrid,
        auth: kfAuth
      }))
    }
    if (this._token) {
      layers.push(createLayer({
        name: 'orto_foraar',
        type: 'WMTS',
        title: 'Ortofoto',
        color: 'white',
        visible: background === 'orto_foraar',
        service: 'orto_foraar',
        layer: 'orto_foraar',
        matrixSet: 'View1',
        format: 'image/jpeg',
        tileGrid: kfTileGrid,
        auth: kfAuth
      }))
      layers.push(createLayer({
        name: 'forvaltning',
        type: 'WMS',
        title: 'Basiskort',
        visible: background === 'forvaltning',
        service: 'forvaltning',
        layer: 'basis_kort',
        format: 'image/png',
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
      view: new View({
        center: fromLonLat(center, 'EPSG:25832'),
        zoom: this.zoom,
        resolutions: kfTileGrid.getResolutions(),
        projection: projection,
        extent: Extent
      })
    })
    this._map.addControl(new Attribution({ collapsible: false }))
    scaleLine && this._map.addControl(new ScaleLine())
    zoomSlider && this._map.addControl(new ZoomSlider())
    fullScreen && this._map.addControl(new FullScreen())
    myLocation && this._map.addControl(new MyLocation())
    this._layerSwitcher = new LayerSwitcher({ visible: layerSwitcher })
    this._map.addControl(this._layerSwitcher)
    this.markerLayers = CreateMarkers(markers, icons, this)
    const _this = this

    this.markerLayers.forEach(function (layer) {
      _this._map.addLayer(layer)
    })
    showPopup && CreateMarkerTooltip(this, popup)

    this.autoCenter()

    this._map.on('click', function (evt) {
      const focus = document.activeElement

      focus.blur()
    })

  }

  addVectorLayer(vector, styles) {
    this._map.addLayer(new VectorLayer({
      source: vector,
      style: styles
    }))
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
    const overlays = layers.find(function (e) {
      return e.get('title') === 'Kort'
    })

    overlays.get('layers').getArray().forEach(function (e, idx, a) {
      if (e.get('name') === layer) {
        e.setVisible(value)
      }
    })
  }

  get olMap() {
    return this._map
  }

  get target() {
    return this._target
  }
}

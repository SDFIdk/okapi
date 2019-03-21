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
import { Center, Extent, Resolutions, MatrixIds, Size } from './constants'

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
    this._token = opt.token || ''
    this.autocenter = autoCenter
    this.autoZoom = autoZoom

    proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs')
    register(proj4)
    const projection = getProjection('EPSG:25832')

    projection.setExtent(Extent)

    const tileGrid = new WMTSTileGrid({
      extent: Extent,
      resolutions: Resolutions,
      matrixIds: MatrixIds
    })
    const kfLink = 'https://download.kortforsyningen.dk/content/vilk%C3%A5r-og-betingelser'
    const attributionText = '&copy; <a target="_blank" href="' + kfLink +
    '">Styrelsen for Dataforsyning og Effektivisering</a>'

    this._map = new OlMap({
      target: this._target,
      layers: [
        new Group({
          'title': 'Base maps', // This title of the group is shown in the layer switcher
          layers: [
            // Skærmkort [WMTS:topo_skaermkort]
            new TileLayer({
              opacity: 1.0,
              title: 'Skærmkort',
              name: 'dtk_skaermkort',
              color: 'black',
              type: 'base',
              visible: background === 'dtk_skaermkort',
              source: new WMTS({
                attributions: attributionText,
                url: this._createUrl('topo_skaermkort'),
                layer: 'dtk_skaermkort',
                matrixSet: 'View1',
                format: 'image/jpeg',
                tileGrid: tileGrid,
                style: 'default',
                size: Size
              })
            }),
            // Skærmkort Dæmpet [WMTS:topo_skaermkort_daempet]
            new TileLayer({
              opacity: 1.0,
              title: 'Skærmkort dæmpet',
              name: 'dtk_skaermkort_daempet',
              color: 'black',
              type: 'base',
              visible: background !== 'orto_foraar' && background !== 'forvaltning' &&
              background !== 'dtk_skaermkort',
              source: new WMTS({
                attributions: attributionText,
                url: this._createUrl('topo_skaermkort_daempet'),
                layer: 'dtk_skaermkort_daempet',
                matrixSet: 'View1',
                format: 'image/jpeg',
                tileGrid: tileGrid,
                style: 'default',
                size: Size
              })
            }),
            // Ortofoto [WMTS:orto_foraar]
            new TileLayer({
              title: 'Ortofoto', // This is the layer title shown in the layer switcher
              name: 'orto_foraar',
              color: 'white',
              type: 'base', // use 'base' for base layers, otherwise 'overlay'
              visible: background === 'orto_foraar', // by default this layer is not visible
              opacity: 1.0, // no transparency
              source: new WMTS({
                attributions: attributionText,
                url: this._createUrl('orto_foraar'),
                layer: 'orto_foraar',
                matrixSet: 'View1',
                format: 'image/jpeg',
                visible: 'false',
                tileGrid: tileGrid,
                style: 'default',
                size: Size
              })
            }),
            // Forvaltning [WMS:forvaltning]
            new TileLayer({
              opacity: 1.0,
              title: 'Basiskort',
              name: 'forvaltning',
              color: 'black',
              type: 'base',
              visible: background === 'forvaltning',
              source: new TileWMS({
                attributions: attributionText,
                url: this._createUrl('forvaltning'),
                params: {
                  'LAYERS': 'basis_kort',
                  'VERSION': '1.1.1',
                  'TRANSPARENT': 'true',
                  'FORMAT': 'image/png',
                  'STYLES': ''
                }
              })
            })
          ]
        }),
        new Group({
          'title': 'Kort',
          layers: []
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
        resolutions: tileGrid.getResolutions(),
        projection: projection,
        extent: Extent
      })
    })
    this._map.addControl(new Attribution({ collapsible: false }))
    scaleLine && this._map.addControl(new ScaleLine())
    zoomSlider && this._map.addControl(new ZoomSlider())
    fullScreen && this._map.addControl(new FullScreen())
    myLocation && this._map.addControl(new MyLocation())
    layerSwitcher && this._map.addControl(new LayerSwitcher())
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

  autoCenter() {
    if (!this.autoCenter || !this.markerLayers[0]) {
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
  }

  get olMap() {
    return this._map
  }

  get target() {
    return this._target
  }

  _createUrl(service) {
    const baseUrl = 'https://services.kortforsyningen.dk/'

    return baseUrl + service + '?token=' + this._token
  }
}

import Control from 'ol/control/Control'
import Point from 'ol/geom/Point'
import Style from 'ol/style/Style'
import Icon from 'ol/style/Icon'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import Feature from 'ol/Feature'
import { fromLonLat } from 'ol/proj'
import marker from './images/marker.png'
import location from './images/location_icon.png'
import './MyLocation.styl'

export default class MyLocation extends Control {

  constructor(opt) {
    const options = opt || {}

    super({
      element: document.createElement('div'),
      target: options.target
    })

    let cssClassName = options.className !== undefined ? options.className :
      'ol-my-location ol-unselectable ol-control'

    cssClassName += options.zoomSlider ? ' zoom-slider-exists' : ''

    this.labelNode_ = document.createElement('img')
    this.labelNode_.src = location

    this.button_ = document.createElement('button')

    const tipLabel = options.tipLabel ? options.tipLabel : 'Min Lokation'

    this.button_.setAttribute('type', 'button')
    this.button_.title = tipLabel
    this.button_.appendChild(this.labelNode_)

    const _this = this

    this.button_.onclick = function (e) {
      e.preventDefault()
      _this.showMyPosition()
    }

    const element = this.element

    element.className = cssClassName
    element.appendChild(this.button_)

    const myLocationStyle = new Style({
      image: new Icon(({
        anchor: [0.5, 18],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: marker
      }))
    })

    this._myLocationVector = new VectorSource({})
    this._myLocationLayer = new VectorLayer({
      source: this._myLocationVector,
      style: myLocationStyle
    })
  }

  setMap(map) {
    super.setMap(map)
    if (map) {
      map.addLayer(this._myLocationLayer)
    }
  }

  handleNoGeolocation(error_msg) {
    const error_str = error_msg.message ? error_msg.message : ''

    console.error(error_str)
    alert(error_str)
  }

  showMyPosition() {
    const _this = this
    const showPosition = function (position) {
      const lonlat = [position.coords.longitude, position.coords.latitude]
      const xy = fromLonLat(lonlat, 'EPSG:25832')
      const feature = new Feature({
        geometry: new Point(xy),
        title: 'Min lokation'
      })

      _this._myLocationVector.clear()
      _this._myLocationVector.addFeature(feature)
      _this.getMap().getView().fit(_this._myLocationVector.getExtent())
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition,
        (err) => { this.handleNoGeolocation(err) })
    } else {
      this.handleNoGeolocation({message: 'Geolokation er ikke tilgængelig.'})
    }
  }

}

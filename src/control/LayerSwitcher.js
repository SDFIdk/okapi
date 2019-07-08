import Control from 'ol/control/Control'
import Skaerm from './images/dtk_skaermkort_thumb.png'
import Daempet from './images/dtk_skaermkort_daempet_thumb.png'
import Forvalt from './images/forvaltning_thumb.png'
import Orto from './images/orto_foraar_thumb.png'
import './LayerSwitcher.styl'

export default class LayerSwitcher extends Control {
  constructor(opt) {
    const options = opt || {}

    super({
      element: document.createElement('div'),
      target: options.target
    })

    this.visible = typeof options.visible === 'undefined' ? true : options.visible

    const cssClassName = options.className !== undefined ? options.className :
      'ol-layer-switcher ol-unselectable ol-control'
    const label = options.label !== undefined ? options.label : 'Skift kort'

    this.labelNode_ = typeof label === 'string' ? document.createTextNode(label) : label
    this.button_ = document.createElement('button')

    const tipLabel = options.tipLabel ? options.tipLabel : 'Skift kort'

    this.button_.setAttribute('type', 'button')
    this.button_.id = 'layer-switcher-button'
    this.button_.title = tipLabel
    this.button_.appendChild(this.labelNode_)

    const _this = this

    this.button_.onclick = function (e) {
      e.preventDefault()
      _this.toggleShow()
    }

    this.panel1_ = document.createElement('div')
    this.panel1_.className = 'container1'

    this.panel2_ = document.createElement('div')
    this.panel2_.className = 'container2'
    this.panel1_.appendChild(this.panel2_)

    const element = this.element

    element.className = cssClassName
    if (this.visible) {
      element.appendChild(this.button_)
      element.appendChild(this.panel1_)
    }
  }

  setMap(map) {
    super.setMap(map)
    if (map) {
      this.renderBackgrounds()
    }
  }

  renderBackgrounds() {
    let baseLayers = null

    if (!this.getMap()) {
      return
    }
    const lyrs = this.getMap().getLayers().getArray()

    for (let i = 0, l; i < lyrs.length; i++) {
      l = lyrs[i]
      if (l.get('title') === 'Base maps') {
        baseLayers = l
      }
    }
    const this_ = this

    while (this.panel2_.firstChild) {
      this.panel2_.removeChild(this.panel2_.firstChild)
    }
    baseLayers.getLayers().forEach(function (e) {
      const div = document.createElement('div')
      const image = document.createElement('img')
      const label = document.createElement('label')

      div.className = 'wrapper'
      image.className = 'image'
      label.className = e.get('color')
      image.appendChild(label)
      div.appendChild(image)
      div.appendChild(label)
      this_.panel2_.appendChild(div)
      if (e.get('visible')) {
        image.classList.add('selected')
      }
      e.image = image

      label.innerHTML = e.get('title')
      const name = e.get('name')
      let img = Skaerm

      if (name === 'dtk_skaermkort_daempet') {
        img = Daempet
      } else if (name === 'forvaltning') {
        img = Forvalt
      } else if (name === 'orto_foraar') {
        img = Orto
      }
      image.src = img

      image.onclick = function (f) {
        f = f || window.event
        this_.toggleBackground(e.get('name'))
        f.preventDefault()
      }

      label.onclick = image.onclick
    })
  }

  toggleBackground(background) {
    let baseLayers = null
    const lyrs = this.getMap().getLayers().getArray()

    for (let i = 0, l; i < lyrs.length; i++) {
      l = lyrs[i]
      if (l.get('title') === 'Base maps') {
        baseLayers = l
      }
    }
    baseLayers.get('layers').getArray().forEach(function (lyr, idx, a) {
      lyr.setVisible(lyr.get('name') === background)
      if (lyr.image.classList.contains('selected')) {
        lyr.image.classList.remove('selected')
      }
      if (lyr.get('name') === background) {
        lyr.image.classList.add('selected')
      }
    })
  }

  setVisible(lyr, visible) {
    const map = this.getMap()

    lyr.setVisible(visible)
    if (visible && lyr.get('type') === 'base') {
      // Hide all other base layers regardless of grouping
      LayerSwitcher.forEachRecursive(map, function (l, idx, a) {
        if (l !== lyr && l.get('type') === 'base') {
          l.setVisible(false)
        }
      })
    }
  }

  forEachRecursive(lyr, fn) {
    lyr.getLayers().forEach(function (lyr, idx, a) {
      fn(lyr, idx, a)
      if (lyr.getLayers) {
        this.forEachRecursive(lyr, fn)
      }
    })
  }

  toggleShow(e) {
    if (this.panel1_.classList.contains('expanded')) {
      this.panel1_.classList.remove('expanded')
      this.button_.classList.remove('expanded')
    } else {
      this.panel1_.classList.add('expanded')
      this.button_.classList.add('expanded')
    }
  }
}

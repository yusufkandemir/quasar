import { defineComponent, h } from 'vue'

import { PanelChildMixin } from '../../mixins/panel.js'

import { slot } from '../../utils/slot.js'

export default defineComponent({
  name: 'QCarouselSlide',

  mixins: [ PanelChildMixin ],

  props: {
    imgSrc: String
  },

  computed: {
    style () {
      if (this.imgSrc) {
        return {
          backgroundImage: `url("${this.imgSrc}")`
        }
      }
    }
  },

  render () {
    return h('div', {
      staticClass: 'q-carousel__slide',
      style: this.style,
      on: { ...this.qListeners }
    }, slot(this, 'default'))
  }
})

import { defineComponent, h } from 'vue'

import mixin from './spinner-mixin.js'

export default defineComponent({
  name: 'QSpinner',

  mixins: [ mixin ],

  props: {
    thickness: {
      type: Number,
      default: 5
    }
  },

  render () {
    return h('svg', {
      class: ['q-spinner q-spinner-mat', this.classes],
      // TODO: Vue 3, uses ListenersMixin
      // on: { ...this.qListeners },
      focusable: 'false' /* needed for IE11 */,
      'width': this.cSize,
      'height': this.cSize,
      'viewBox': '25 25 50 50'
    }, [
      h('circle', {
        class: 'path',
        'cx': '50',
        'cy': '50',
        'r': '20',
        'fill': 'none',
        'stroke': 'currentColor',
        'stroke-width': this.thickness,
        'stroke-miterlimit': '10'
      })
    ])
  }
})

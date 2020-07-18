import { defineComponent, h } from 'vue'

import ListenersMixin from '../../mixins/listeners.js'

import { slot } from '../../utils/slot.js'

export default defineComponent({
  name: 'QToolbar',

  mixins: [ ListenersMixin ],

  props: {
    inset: Boolean
  },

  render () {
    return h('div', {
      class: ['q-toolbar row no-wrap items-center', this.inset ? 'q-toolbar--inset' : null]
      // TODO: Vue 3, uses ListenersMixin
      // on: { ...this.qListeners }
    }, slot(this, 'default'))
  }
})

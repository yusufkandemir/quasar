import { defineComponent, h } from 'vue'

import AlignMixin from '../../mixins/align.js'
import ListenersMixin from '../../mixins/listeners.js'

import { slot } from '../../utils/slot.js'

export default defineComponent({
  name: 'QCardActions',

  mixins: [ ListenersMixin, AlignMixin ],

  props: {
    vertical: Boolean
  },

  computed: {
    classes () {
      return `q-card__actions--${this.vertical === true ? 'vert column' : 'horiz row'} ${this.alignClass}`
    }
  },

  render () {
    return h('div', {
      class: ['q-card__actions', this.classes]
      // TODO: Vue 3, uses ListenersMixin
      // on: { ...this.qListeners }
    }, slot(this, 'default'))
  }
})

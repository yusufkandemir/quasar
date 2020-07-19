import { defineComponent, h } from 'vue'

import TagMixin from '../../mixins/tag.js'
import ListenersMixin from '../../mixins/listeners.js'

import { slot } from '../../utils/slot.js'

export default defineComponent({
  name: 'QCardSection',

  mixins: [ ListenersMixin, TagMixin ],

  props: {
    horizontal: Boolean
  },

  computed: {
    classes () {
      return 'q-card__section ' +
        `q-card__section--${this.horizontal === true ? 'horiz row no-wrap' : 'vert'}`
    }
  },

  render () {
    return h(this.tag, {
      class: this.classes,
      // TODO: Vue 3, uses ListenersMixin
      // on: { ...this.qListeners }
    }, slot(this, 'default'))
  }
})

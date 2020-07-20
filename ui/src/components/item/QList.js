import { defineComponent, h } from 'vue'

import DarkMixin from '../../mixins/dark.js'
import ListenersMixin from '../../mixins/listeners.js'

import { slot } from '../../utils/slot.js'

export default defineComponent({
  name: 'QList',

  mixins: [ ListenersMixin, DarkMixin ],

  props: {
    bordered: Boolean,
    dense: Boolean,
    separator: Boolean,
    padding: Boolean
  },

  computed: {
    classes () {
      return 'q-list' +
        (this.bordered === true ? ' q-list--bordered' : '') +
        (this.dense === true ? ' q-list--dense' : '') +
        (this.separator === true ? ' q-list--separator' : '') +
        (this.isDark === true ? ' q-list--dark' : '') +
        (this.padding === true ? ' q-list--padding' : '')
    }
  },

  render () {
    return h('div', {
      class: this.classes
      // TODO: Vue 3, uses ListenersMixin
      // on: { ...this.qListeners }
    }, slot(this, 'default'))
  }
})

import { defineComponent, h } from 'vue'

import ListenersMixin from '../../mixins/listeners.js'

import { slot } from '../../utils/slot.js'

export default defineComponent({
  name: 'QTr',

  mixins: [ ListenersMixin ],

  props: {
    props: Object,
    noHover: Boolean
  },

  computed: {
    classes () {
      return 'q-tr' + (this.props === void 0 || this.props.header === true ? '' : ' ' + this.props.__trClass) +
        (this.noHover === true ? ' q-tr--no-hover' : '')
    }
  },

  render () {
    return h('tr', {
      // TODO: Vue 3, uses ListenersMixin
      // on: { ...this.qListeners },
      class: this.classes
    }, slot(this, 'default'))
  }
})

import { defineComponent, h } from 'vue'

import ListenersMixin from '../../mixins/listeners.js'

import { slot } from '../../utils/slot.js'

export default defineComponent({
  name: 'QTd',

  mixins: [ ListenersMixin ],

  props: {
    props: Object,
    autoWidth: Boolean,
    noHover: Boolean
  },

  computed: {
    classes () {
      return 'q-td' + (this.autoWidth === true ? ' q-table--col-auto-width' : '') +
        (this.noHover === true ? ' q-td--no-hover' : '')
    }
  },

  render () {
    // TODO: Vue 3, uses ListenersMixin
    const listeners = this.qListeners

    if (this.props === void 0) {
      return h('td', {
        ...listeners,
        class: this.classes
      }, slot(this, 'default'))
    }

    const name = this.$.vnode.key

    const col = this.props.colsMap !== void 0 && name
      ? this.props.colsMap[name]
      : this.props.col

    if (col === void 0) { return }

    return h('td', {
      ...listeners,
      style: col.style,
      class: [this.classes, col.__tdClass]
    }, slot(this, 'default'))
  }
})

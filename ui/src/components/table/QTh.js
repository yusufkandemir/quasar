import { defineComponent, h } from 'vue'

import QIcon from '../icon/QIcon.js'

import ListenersMixin from '../../mixins/listeners.js'

import { slot, uniqueSlot } from '../../utils/slot.js'

export default defineComponent({
  name: 'QTh',

  mixins: [ ListenersMixin ],

  props: {
    props: Object,
    autoWidth: Boolean
  },

  emits: ['click'],

  render () {
    const listeners = { ...this.qListeners }

    if (this.props === void 0) {
      return h('th', {
        ...listeners,
        class: this.autoWidth === true ? 'q-table--col-auto-width' : null
      }, slot(this, 'default'))
    }

    let col, child
    const name = this.$.vnode.key

    if (name) {
      col = this.props.colsMap[name]
      if (col === void 0) { return }
    }
    else {
      col = this.props.col
    }

    if (col.sortable === true) {
      const action = col.align === 'right'
        ? 'unshift'
        : 'push'

      child = uniqueSlot(this, 'default', [])
      child[action](
        h(QIcon, {
          name: this.$q.iconSet.table.arrowUp,
          class: col.__iconClass
        })
      )
    }
    else {
      child = slot(this, 'default')
    }

    if (col.sortable === true) {
      listeners.onClick = event => {
        // eslint-disable-next-line vue/no-mutating-props
        this.props.sort(col)
        this.$emit('click', event)
      }
    }

    return h('th', {
      ...listeners,
      style: col.headerStyle,
      class: col.__thClass +
        (this.autoWidth === true ? ' q-table--col-auto-width' : '')
    }, child)
  }
})

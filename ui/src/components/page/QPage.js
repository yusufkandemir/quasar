import { defineComponent, h } from 'vue'

import ListenersMixin from '../../mixins/listeners.js'

import { slot } from '../../utils/slot.js'

export default defineComponent({
  name: 'QPage',

  mixins: [ ListenersMixin ],

  inject: {
    pageContainer: {
      from: 'pageContainer',
      default () {
        console.error('QPage needs to be child of QPageContainer')
      }
    },
    layout: {
      from: 'layout'
    }
  },

  props: {
    padding: Boolean,
    styleFn: Function
  },

  computed: {
    style () {
      const offset =
        (this.layout.header.space === true ? this.layout.header.size : 0) +
        (this.layout.footer.space === true ? this.layout.footer.size : 0)

      if (typeof this.styleFn === 'function') {
        const height = this.layout.container === true
          ? this.layout.containerHeight
          : this.$q.screen.height

        return this.styleFn(offset, height)
      }

      return {
        minHeight: this.layout.container === true
          ? (this.layout.containerHeight - offset) + 'px'
          : (
            this.$q.screen.height === 0
              ? `calc(100vh - ${offset}px)`
              : (this.$q.screen.height - offset) + 'px'
          )
      }
    },

    classes () {
      if (this.padding === true) {
        return 'q-layout-padding'
      }
    }
  },

  render () {
    return h('main', {
      style: this.style,
      class: ['q-page', this.classes]
      // TODO: Vue 3
      // on: { ...this.qListeners }
    }, slot(this, 'default'))
  }
})

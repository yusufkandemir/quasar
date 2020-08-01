import { defineComponent, h, Transition } from 'vue'

import QPageSticky from '../page-sticky/QPageSticky.js'
import { getScrollTarget, setScrollPosition } from '../../utils/scroll.js'

export default defineComponent({
  name: 'QPageScroller',

  mixins: [ QPageSticky ],

  props: {
    scrollOffset: {
      type: Number,
      default: 1000
    },

    reverse: Boolean,

    duration: {
      type: Number,
      default: 300
    },

    offset: {
      default: () => [18, 18]
    }
  },

  inject: {
    layout: {
      from: 'layout',
      default () {
        console.error('QPageScroller needs to be used within a QLayout')
      }
    }
  },

  emits: ['click'],

  data () {
    return {
      showing: this.__isVisible()
    }
  },

  computed: {
    height () {
      return this.layout.container === true
        ? this.layout.containerHeight
        : this.layout.height
    },

    eventListeners () {
      return {
        // TODO: Vue 3, uses ListenersMixin
        // ...this.qListeners,
        onClick: this.__onClick
      }
    }
  },

  watch: {
    reverse: {
      handler (val) {
        if (val === true) {
          if (this.heightWatcher === void 0) {
            this.heightWatcher = this.$watch(() => this.height, this.__updateVisibility)
          }
        }
        else if (this.heightWatcher !== void 0) {
          this.__cleanup()
        }
      },
      immediate: true
    }
  },

  methods: {
    __isVisible () {
      return this.reverse === true
        ? this.height - this.layout.scroll.position > this.scrollOffset
        : this.layout.scroll.position > this.scrollOffset
    },

    __onClick (e) {
      const target = this.layout.container === true
        ? getScrollTarget(this.$el)
        : getScrollTarget(this.layout.$el)

      setScrollPosition(target, this.reverse === true ? this.layout.height : 0, this.duration)
      this.$emit('click', e)
    },

    __updateVisibility () {
      const newVal = this.__isVisible()
      if (this.showing !== newVal) {
        this.showing = newVal
      }
    },

    __cleanup () {
      this.heightWatcher()
      this.heightWatcher = void 0
    }
  },

  mounted () {
    this.$watch(() => this.layout.scroll.position, () => {
      this.__updateVisibility()
    })
  },

  render () {
    return h(Transition, {
      name: 'q-transition--fade'
    },
    this.showing === true
      ? [
        h('div', {
          class: 'q-page-scroller',
          ...this.eventListeners
        }, [
          QPageSticky.render.call(this)
        ])
      ]
      : null
    )
  },

  beforeUnmount () {
    this.heightWatcher !== void 0 && this.__cleanup()
  }
})

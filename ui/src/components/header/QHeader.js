import { defineComponent, h } from 'vue'

import QResizeObserver from '../resize-observer/QResizeObserver.js'

import ListenersMixin from '../../mixins/listeners.js'

import { uniqueSlot } from '../../utils/slot.js'
import { stop } from '../../utils/event.js'
import cache from '../../utils/cache.js'

export default defineComponent({
  name: 'QHeader',

  mixins: [ ListenersMixin ],

  inject: {
    layout: {
      from: 'layout',
      default () {
        console.error('QHeader needs to be child of QLayout')
      }
    }
  },

  props: {
    modelValue: {
      type: Boolean,
      default: true
    },
    reveal: Boolean,
    revealOffset: {
      type: Number,
      default: 250
    },
    bordered: Boolean,
    elevated: Boolean,

    heightHint: {
      type: [String, Number],
      default: 50
    }
  },

  emits: ['reveal', 'focusin'],

  data () {
    return {
      size: parseInt(this.heightHint, 10),
      revealed: true
    }
  },

  watch: {
    value (val) {
      this.__update('space', val)
      this.__updateLocal('revealed', true)
      this.layout.__animate()
    },

    offset (val) {
      this.__update('offset', val)
    },

    reveal (val) {
      val === false && this.__updateLocal('revealed', this.modelValue)
    },

    revealed (val) {
      this.layout.__animate()
      this.$emit('reveal', val)
    }
  },

  computed: {
    fixed () {
      return this.reveal === true ||
        this.layout.view.indexOf('H') > -1 ||
        this.layout.container === true
    },

    offset () {
      if (this.modelValue !== true) {
        return 0
      }
      if (this.fixed === true) {
        return this.revealed === true ? this.size : 0
      }
      const offset = this.size - this.layout.scroll.position
      return offset > 0 ? offset : 0
    },

    hidden () {
      return this.modelValue !== true || (this.fixed === true && this.revealed !== true)
    },

    revealOnFocus () {
      return this.modelValue === true && this.hidden === true && this.reveal === true
    },

    classes () {
      return (this.fixed === true ? 'fixed' : 'absolute') + '-top' +
        (this.bordered === true ? ' q-header--bordered' : '') +
        (this.hidden === true ? ' q-header--hidden' : '') +
        (this.modelValue !== true ? ' q-layout--prevent-focus' : '')
    },

    style () {
      const
        view = this.layout.rows.top,
        css = {}

      if (view[0] === 'l' && this.layout.left.space === true) {
        css[this.$q.lang.rtl === true ? 'right' : 'left'] = `${this.layout.left.size}px`
      }
      if (view[2] === 'r' && this.layout.right.space === true) {
        css[this.$q.lang.rtl === true ? 'left' : 'right'] = `${this.layout.right.size}px`
      }

      return css
    },

    onEvents () {
      return {
        // TODO: Vue 3, ListenersMixin
        // ...this.qListeners,
        onFocusin: this.__onFocusin,
        'onUpdate:modelValue': stop
      }
    }
  },

  render () {
    const child = uniqueSlot(this, 'default', [])

    this.elevated === true && child.push(
      h('div', {
        class: 'q-layout__shadow absolute-full overflow-hidden no-pointer-events'
      })
    )

    child.push(
      h(QResizeObserver, {
        debounce: 0,
        onResize: cache(this, 'resize', this.__onResize)
      })
    )

    return h('header', {
      class: ['q-header q-layout__section--marginal', this.classes],
      style: this.style,
      ...this.onEvents
    }, child)
  },

  created () {
    this.layout.instances.header = this
    this.modelValue === true && this.__update('size', this.size)
    this.__update('space', this.modelValue)
    this.__update('offset', this.offset)

    this.$watch(() => this.layout.scroll, scroll => {
      this.reveal === true && this.__updateLocal('revealed',
        scroll.direction === 'up' ||
        scroll.position <= this.revealOffset ||
        scroll.position - scroll.inflexionPosition < 100
      )
    })
  },

  beforeUnmount () {
    if (this.layout.instances.header === this) {
      this.layout.instances.header = void 0
      this.__update('size', 0)
      this.__update('offset', 0)
      this.__update('space', false)
    }
  },

  methods: {
    __onResize ({ height }) {
      this.__updateLocal('size', height)
      this.__update('size', height)
    },

    __update (prop, val) {
      if (this.layout.header[prop] !== val) {
        this.layout.header[prop] = val
      }
    },

    __updateLocal (prop, val) {
      if (this[prop] !== val) {
        this[prop] = val
      }
    },

    __onFocusin (evt) {
      if (this.revealOnFocus === true) {
        this.__updateLocal('revealed', true)
      }

      this.$emit('focusin', evt)
    }
  }
})

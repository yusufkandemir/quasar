import { defineComponent, h, KeepAlive, Transition } from 'vue'

import TouchSwipe from '../directives/TouchSwipe.js'

// TODO: Vue 3, review, uses ListenersMixin
import ListenersMixin from './listeners.js'

import { slot } from '../utils/slot.js'

const PanelWrapper = defineComponent({
  name: 'QTabPanelWrapper',

  render () {
    return h('div', {
      class: 'q-panel scroll',
      role: 'tabpanel'
    }, slot(this, 'default'))
  }
})

export const PanelParentMixin = defineComponent({
  mixins: [ ListenersMixin ],

  props: {
    modelValue: {
      required: true
    },

    animated: Boolean,
    infinite: Boolean,
    swipeable: Boolean,
    vertical: Boolean,

    transitionPrev: String,
    transitionNext: String,

    keepAlive: Boolean
  },

  emits: ['update:modelValue', 'before-transition', 'transition'],

  data () {
    return {
      panelIndex: null,
      panelTransition: null
    }
  },

  computed: {
    panelDirectives () {
      const directives = []

      if (this.swipeable === true) {
        directives.push([
          TouchSwipe,
          this.__swipe, '',
          {
            horizontal: this.vertical !== true,
            vertical: this.vertical,
            mouse: true
          }
        ])
      }

      return directives
    },

    contentKey () {
      return typeof this.modelValue === 'string' || typeof this.modelValue === 'number'
        ? this.modelValue
        : String(this.modelValue)
    },

    transitionPrevComputed () {
      return this.transitionPrev || `slide-${this.vertical === true ? 'down' : 'right'}`
    },

    transitionNextComputed () {
      return this.transitionNext || `slide-${this.vertical === true ? 'up' : 'left'}`
    }
  },

  watch: {
    value (newVal, oldVal) {
      const index = this.__isValidPanelName(newVal) === true
        ? this.__getPanelIndex(newVal)
        : -1

      if (this.__forcedPanelTransition !== true) {
        this.__updatePanelTransition(
          index === -1 ? 0 : (index < this.__getPanelIndex(oldVal) ? -1 : 1)
        )
      }

      if (this.panelIndex !== index) {
        this.panelIndex = index
        this.$emit('before-transition', newVal, oldVal)
        this.$nextTick(() => {
          this.$emit('transition', newVal, oldVal)
        })
      }
    }
  },

  methods: {
    next () {
      this.__go(1)
    },

    previous () {
      this.__go(-1)
    },

    goTo (name) {
      this.$emit('update:modelValue', name)
    },

    __isValidPanelName (name) {
      return name !== void 0 && name !== null && name !== ''
    },

    __getPanelIndex (name) {
      return this.panels.findIndex(panel => {
        return (
          panel.props !== null &&
          panel.props.name === name &&
          panel.props.disable !== '' &&
          panel.props.disable !== true
        )
      })
    },

    __getAllPanels () {
      return this.panels.filter(
        panel => panel.props !== null && this.__isValidPanelName(panel.props.name)
      )
    },

    __getAvailablePanels () {
      return this.panels.filter(panel => {
        return (
          panel.props !== null &&
          panel.props.name !== void 0 &&
          panel.props.disable !== '' &&
          panel.props.disable !== true
        )
      })
    },

    __updatePanelTransition (direction) {
      const val = direction !== 0 && this.animated === true && this.panelIndex !== -1
        ? 'q-transition--' + (direction === -1 ? this.transitionPrevComputed : this.transitionNextComputed)
        : null

      if (this.panelTransition !== val) {
        this.panelTransition = val
      }
    },

    __go (direction, startIndex = this.panelIndex) {
      let index = startIndex + direction
      const slots = this.panels

      while (index > -1 && index < slots.length) {
        const opt = slots[index]

        if (
          opt !== void 0 &&
          opt.props !== null &&
          opt.props.disable !== '' &&
          opt.props.disable !== true
        ) {
          this.__updatePanelTransition(direction)
          this.__forcedPanelTransition = true
          this.$emit('update:modelValue', slots[index].props.name)
          setTimeout(() => {
            this.__forcedPanelTransition = false
          })
          return
        }

        index += direction
      }

      if (this.infinite === true && slots.length > 0 && startIndex !== -1 && startIndex !== slots.length) {
        this.__go(direction, direction === -1 ? slots.length : -1)
      }
    },

    __swipe (evt) {
      const dir = this.vertical === true ? 'up' : 'left'
      this.__go((this.$q.lang.rtl === true ? -1 : 1) * (evt.direction === dir ? 1 : -1))
    },

    __updatePanelIndex () {
      const index = this.__getPanelIndex(this.modelValue)

      if (this.panelIndex !== index) {
        this.panelIndex = index
      }

      return true
    },

    __getPanelContent () {
      if (this.panels.length === 0) {
        return
      }

      const panel = this.__isValidPanelName(this.modelValue) &&
        this.__updatePanelIndex() &&
        this.panels[this.panelIndex]

      const content = this.keepAlive === true
        ? [
          // TODO: Vue 3, investigate this, when the child param is array, it emits a warning saying:
          // `Non-function value encountered for default slot. Prefer function slots for better performance`
          // And it breaks the whole page with `Uncaught (in promise) TypeError: Cannot read property '_' of null` error when a function is used instead
          h(KeepAlive, /* () => */ [
            h(PanelWrapper, {
              key: this.contentKey
            }, () => [ panel ])
          ])
        ]
        : [
          h('div', {
            class: 'q-panel scroll',
            key: this.contentKey,
            role: 'tabpanel'
          }, [ panel ])
        ]

      return this.animated === true
        ? [
          h(Transition, {
            name: this.panelTransition
          }, () => content)
        ]
        : content
    }
  },

  render () {
    this.panels = slot(this, 'default', [])
    return this.__renderPanels()
  }
})

export const PanelChildMixin = defineComponent({
  mixins: [ ListenersMixin ],

  props: {
    name: {
      required: true
    },
    disable: Boolean
  }
})

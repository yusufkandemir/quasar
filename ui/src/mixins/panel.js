import { defineComponent, h, KeepAlive, Transition } from 'vue'

import TouchSwipe from '../directives/TouchSwipe.js'

// TODO: Vue 3, review, uses ListenersMixin
import ListenersMixin from './listeners.js'

import { stop } from '../utils/event.js'
import { slot } from '../utils/slot.js'
import cache from '../utils/cache.js'

const PanelWrapper = defineComponent({
  name: 'QTabPanelWrapper',

  render () {
    return h('div', {
      class: 'q-panel scroll',
      role: 'tabpanel',
      // stop propagation of content emitted @input
      // which would tamper with Panel's model
      ...cache(this, 'stop', { 'onUpdate:modelValue': stop })
    }, slot(this, 'default'))
  }
})

export const PanelParentMixin = {
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
      this.$emit('input', name)
    },

    __isValidPanelName (name) {
      return name !== void 0 && name !== null && name !== ''
    },

    __getPanelIndex (name) {
      return this.panels.findIndex(panel => {
        const opt = panel.componentOptions
        return opt &&
          opt.propsData.name === name &&
          opt.propsData.disable !== '' &&
          opt.propsData.disable !== true
      })
    },

    __getAllPanels () {
      return this.panels.filter(
        panel => panel.componentOptions !== void 0 &&
          this.__isValidPanelName(panel.componentOptions.propsData.name)
      )
    },

    __getAvailablePanels () {
      return this.panels.filter(panel => {
        const opt = panel.componentOptions
        return opt &&
          opt.propsData.name !== void 0 &&
          opt.propsData.disable !== '' &&
          opt.propsData.disable !== true
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
        const opt = slots[index].componentOptions

        if (
          opt !== void 0 &&
          opt.propsData.disable !== '' &&
          opt.propsData.disable !== true
        ) {
          this.__updatePanelTransition(direction)
          this.__forcedPanelTransition = true
          this.$emit('input', slots[index].componentOptions.propsData.name)
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
          h(KeepAlive, () => [
            h(PanelWrapper, {
              key: this.contentKey
            }, () => [ panel ])
          ])
        ]
        : [
          h('div', {
            class: 'q-panel scroll',
            key: this.contentKey,
            role: 'tabpanel',
            // stop propagation of content emitted @input
            // which would tamper with Panel's model
            ...cache(this, 'stop', { 'onUpdate:modelValue': stop })
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
}

export const PanelChildMixin = {
  mixins: [ ListenersMixin ],

  props: {
    name: {
      required: true
    },
    disable: Boolean
  }
}

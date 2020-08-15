import { defineComponent } from 'vue'

import { isSSR } from '../plugins/Platform.js'

import TimeoutMixin from './timeout.js'
import ListenersMixin from './listeners.js'

// TODO: Vue 3, review, uses ListenersMixin
export default defineComponent({
  mixins: [ TimeoutMixin, ListenersMixin ],

  props: {
    modelValue: {
      type: Boolean,
      default: void 0
    }
  },

  emits: ['update:modelValue', 'before-show', 'show', 'before-hide', 'hide'],

  data () {
    return {
      showing: false
    }
  },

  watch: {
    modelValue (val) {
      this.__processModelChange(val)
    },

    $route () {
      this.hideOnRouteChange === true && this.showing === true && this.hide()
    }
  },

  methods: {
    toggle (evt) {
      this[this.showing === true ? 'hide' : 'show'](evt)
    },

    show (evt) {
      if (this.disable === true || (this.__showCondition !== void 0 && this.__showCondition(evt) !== true)) {
        return
      }

      if (this.qListeners.input !== void 0 && isSSR === false) {
        this.$emit('update:modelValue', true)
        this.payload = evt
        this.$nextTick(() => {
          if (this.payload === evt) {
            this.payload = void 0
          }
        })
      }

      if (this.modelValue === void 0 || this.qListeners.input === void 0 || isSSR === true) {
        this.__processShow(evt)
      }
    },

    __processShow (evt) {
      if (this.showing === true) {
        return
      }

      // need to call it before setting showing to true
      // in order to not ruin the animation
      this.__preparePortal !== void 0 && this.__preparePortal()

      this.showing = true

      this.$emit('before-show', evt)

      if (this.__show !== void 0) {
        this.__clearTick()
        this.__show(evt)
        this.__prepareTick()
      }
      else {
        this.$emit('show', evt)
      }
    },

    hide (evt) {
      if (this.disable === true) {
        return
      }

      if (this.qListeners.input !== void 0 && isSSR === false) {
        this.$emit('update:modelValue', false)
        this.payload = evt
        this.$nextTick(() => {
          if (this.payload === evt) {
            this.payload = void 0
          }
        })
      }

      if (this.modelValue === void 0 || this.qListeners.input === void 0 || isSSR === true) {
        this.__processHide(evt)
      }
    },

    __processHide (evt) {
      if (this.showing === false) {
        return
      }

      this.showing = false

      this.$emit('before-hide', evt)

      if (this.__hide !== void 0) {
        this.__clearTick()
        this.__hide(evt)
        this.__prepareTick()
      }
      else {
        this.$emit('hide', evt)
      }
    },

    __processModelChange (val) {
      if (this.disable === true && val === true) {
        this.qListeners.input !== void 0 && this.$emit('update:modelValue', false)
      }
      else if ((val === true) !== this.showing) {
        this[`__process${val === true ? 'Show' : 'Hide'}`](this.payload)
      }
    }
  }
})

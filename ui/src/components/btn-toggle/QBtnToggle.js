import { defineComponent, h } from 'vue'

import QBtn from '../btn/QBtn.js'
import QBtnGroup from '../btn-group/QBtnGroup.js'

import ListenersMixin from '../../mixins/listeners.js'
import FormMixin from '../../mixins/form.js'
import RippleMixin from '../../mixins/ripple.js'

import { slot } from '../../utils/slot.js'

export default defineComponent({
  name: 'QBtnToggle',

  mixins: [ ListenersMixin, RippleMixin, FormMixin ],

  props: {
    modelValue: {
      required: true
    },

    options: {
      type: Array,
      required: true,
      validator: v => v.every(
        opt => ('label' in opt || 'icon' in opt || 'slot' in opt) && 'value' in opt
      )
    },

    // To avoid seeing the active raise shadow through the transparent button, give it a color (even white).
    color: String,
    textColor: String,
    toggleColor: {
      type: String,
      default: 'primary'
    },
    toggleTextColor: String,

    outline: Boolean,
    flat: Boolean,
    unelevated: Boolean,
    rounded: Boolean,
    push: Boolean,
    glossy: Boolean,

    size: String,
    padding: String,

    noCaps: Boolean,
    noWrap: Boolean,
    dense: Boolean,
    readonly: Boolean,
    disable: Boolean,

    stack: Boolean,
    stretch: Boolean,

    spread: Boolean,

    clearable: Boolean
  },

  emits: ['update:modelValue', 'click', 'clear'],

  computed: {
    hasActiveValue () {
      return this.options.find(opt => opt.value === this.modelValue) !== void 0
    },

    formAttrs () {
      return {
        type: 'hidden',
        name: this.name,
        value: this.modelValue
      }
    },

    btnOptions () {
      const mergeOption = (opt, key) => opt[key] === void 0 ? this[key] : opt[key]

      return this.options.map((opt, i) => ({
        slot: opt.slot,

        options: {
          key: i,
          class: opt.class,
          style: opt.style,
          // TODO: Vue 3, uses ListenersMixin
          // ...this.qListeners,
          onClick: e => this.__set(opt.value, opt, e),
          ...opt.attrs,
          ...opt,
          slot: void 0,
          modelValue: void 0,
          attrs: void 0,

          outline: this.outline,
          flat: this.flat,
          rounded: this.rounded,
          push: this.push,
          unelevated: this.unelevated,
          dense: this.dense,

          disable: this.disable === true || opt.disable === true,

          // Options that come from the button specific options first, then from general props
          color: opt.modelValue === this.modelValue ? mergeOption(opt, 'toggleColor') : mergeOption(opt, 'color'),
          textColor: opt.value === this.modelValue ? mergeOption(opt, 'toggleTextColor') : mergeOption(opt, 'textColor'),
          noCaps: mergeOption(opt, 'noCaps') === true,
          noWrap: mergeOption(opt, 'noWrap') === true,

          size: mergeOption(opt, 'size'),
          padding: mergeOption(opt, 'padding'),
          ripple: mergeOption(opt, 'ripple'),
          stack: mergeOption(opt, 'stack') === true,
          stretch: mergeOption(opt, 'stretch') === true
        }
      }))
    }
  },

  methods: {
    __set (value, opt, e) {
      if (this.readonly !== true) {
        if (this.modelValue === value) {
          if (this.clearable === true) {
            this.$emit('update:modelValue', null, null)
            this.$emit('clear')
          }
        }
        else {
          this.$emit('update:modelValue', value, opt)
        }

        this.$emit('click', e)
      }
    }
  },

  render () {
    const child = this.btnOptions.map((opt, i) => {
      return h(QBtn, opt.options, opt.slot !== void 0 ? slot(this, opt.slot) : void 0)
    })

    if (this.name !== void 0 && this.disable !== true && this.hasActiveValue === true) {
      this.__injectFormInput(child, 'push')
    }

    return h(QBtnGroup, {
      class: 'q-btn-toggle',

      outline: this.outline,
      flat: this.flat,
      rounded: this.rounded,
      push: this.push,
      stretch: this.stretch,
      unelevated: this.unelevated,
      glossy: this.glossy,
      spread: this.spread
    }, child)
  }
})

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
    const child = this.options.map((opt, i) => {
      return h(QBtn, {
        key: i,
        class: opt.class,
        style: opt.style,
        // TODO: Vue 3, uses ListenersMixin
        // ...this.qListeners,
        onClick: e => this.__set(opt.value, opt, e),

        disable: this.disable || opt.disable,
        label: opt.label,
        // Colors come from the button specific options first, then from general props
        color: opt.value === this.modelValue ? opt.toggleColor || this.toggleColor : opt.color || this.color,
        textColor: opt.value === this.modelValue ? opt.toggleTextColor || this.toggleTextColor : opt.textColor || this.textColor,
        icon: opt.icon,
        iconRight: opt.iconRight,
        noCaps: opt.noCaps === void 0 ? this.noCaps : opt.noCaps === true,
        noWrap: opt.noWrap === void 0 ? this.noWrap : opt.noWrap === true,
        outline: this.outline,
        flat: this.flat,
        rounded: this.rounded,
        push: this.push,
        unelevated: this.unelevated,
        size: this.size,
        dense: this.dense,
        ripple: opt.ripple === void 0 ? this.ripple : opt.ripple,
        stack: opt.stack === void 0 ? this.stack : opt.stack === true,
        tabindex: opt.tabindex,
        stretch: opt.stretch === void 0 ? this.stretch : opt.stretch === true
      }, opt.slot !== void 0 ? slot(this, opt.slot) : void 0)
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

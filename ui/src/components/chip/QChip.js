import { h, defineComponent, withDirectives } from 'vue'

import QIcon from '../icon/QIcon.js'

import Ripple from 'directives/Ripple.js'

import DarkMixin from '../../mixins/dark.js'
import RippleMixin from '../../mixins/ripple.js'
import { getSizeMixin } from '../../mixins/size.js'

import { stopAndPrevent } from '../../utils/event.js'
import { mergeSlotSafely } from '../../utils/slot.js'
import cache from '../../utils/cache.js'

export default defineComponent({
  name: 'QChip',

  mixins: [
    RippleMixin,
    DarkMixin,
    getSizeMixin({
      xs: 8,
      sm: 10,
      md: 14,
      lg: 20,
      xl: 24
    })
  ],

  // TODO: What's this?
  model: {
    event: 'remove'
  },

  props: {
    dense: Boolean,

    icon: String,
    iconRight: String,
    iconRemove: String,
    label: [String, Number],

    color: String,
    textColor: String,

    modelValue: {
      type: Boolean,
      default: true
    },
    selected: {
      type: Boolean,
      default: null
    },

    square: Boolean,
    outline: Boolean,
    clickable: Boolean,
    removable: Boolean,

    tabindex: [String, Number],
    disable: Boolean
  },

  emits: ['update:selected', 'click', 'remove'],

  computed: {
    classes () {
      const text = this.outline === true
        ? this.color || this.textColor
        : this.textColor

      return {
        [`bg-${this.color}`]: this.outline === false && this.color !== void 0,
        [`text-${text} q-chip--colored`]: text,
        disabled: this.disable,
        'q-chip--dense': this.dense,
        'q-chip--outline': this.outline,
        'q-chip--selected': this.selected,
        'q-chip--clickable cursor-pointer non-selectable q-hoverable': this.isClickable,
        'q-chip--square': this.square,
        'q-chip--dark q-dark': this.isDark
      }
    },

    hasLeftIcon () {
      return this.selected === true || this.icon !== void 0
    },

    isClickable () {
      return this.disable === false && (this.clickable === true || this.selected !== null)
    },

    attrs () {
      return this.disable === true
        ? { tabindex: -1, 'aria-disabled': '' }
        : { tabindex: this.tabindex || 0 }
    }
  },

  methods: {
    __onKeyup (e) {
      e.keyCode === 13 /* ENTER */ && this.__onClick(e)
    },

    __onClick (e) {
      if (!this.disable) {
        this.$emit('update:selected', !this.selected)
        this.$emit('click', e)
      }
    },

    __onRemove (e) {
      if (e.keyCode === void 0 || e.keyCode === 13) {
        stopAndPrevent(e)
        !this.disable && this.$emit('remove', false)
      }
    },

    __getContent () {
      const child = []

      this.isClickable === true && child.push(
        h('div', { class: 'q-focus-helper' })
      )

      this.hasLeftIcon === true && child.push(
        h(QIcon, {
          class: 'q-chip__icon q-chip__icon--left',
          name: this.selected === true ? this.$q.iconSet.chip.selected : this.icon
        })
      )

      const label = this.label !== void 0
        ? [ h('div', { class: 'ellipsis' }, [ this.label ]) ]
        : void 0

      child.push(
        h('div', {
          class: 'q-chip__content col row no-wrap items-center q-anchor--skip'
        }, mergeSlotSafely(label, this, 'default'))
      )

      this.iconRight && child.push(
        h(QIcon, {
          class: 'q-chip__icon q-chip__icon--right',
          name: this.iconRight
        })
      )

      this.removable === true && child.push(
        h(QIcon, {
          class: 'q-chip__icon q-chip__icon--remove cursor-pointer',
          name: this.iconRemove || this.$q.iconSet.chip.remove,
          ...this.attrs,
          ...cache(this, 'non', {
            onClick: this.__onRemove,
            onKeyup: this.__onRemove
          })
        })
      )

      return child
    }
  },

  render () {
    if (this.modelValue === false) { return }

    const data = {
      class: ['q-chip row inline no-wrap items-center', this.classes],
      style: this.sizeStyle
    }

    if (this.isClickable !== true) {
      return h('div', data, this.__getContent())
    }

    return withDirectives(
      h('div', {
        ...data,
        ...this.attrs,
        ...cache(this, 'click', {
          onClick: this.__onClick,
          onKeyup: this.__onKeyup
        })
      }, this.__getContent()),
      cache(this, 'dir#' + this.ripple, [
        [ Ripple, this.ripple ]
      ])
    )
  }
})

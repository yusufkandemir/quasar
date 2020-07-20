import { defineComponent, h } from 'vue'

import QIcon from '../icon/QIcon.js'

import SizeMixin from '../../mixins/size.js'
import ListenersMixin from '../../mixins/listeners.js'

import { mergeSlotSafely } from '../../utils/slot.js'

export default defineComponent({
  name: 'QAvatar',

  mixins: [ ListenersMixin, SizeMixin ],

  props: {
    fontSize: String,

    color: String,
    textColor: String,

    icon: String,
    square: Boolean,
    rounded: Boolean
  },

  computed: {
    contentClass () {
      return {
        [`bg-${this.color}`]: this.color,
        [`text-${this.textColor} q-chip--colored`]: this.textColor,
        'q-avatar__content--square': this.square,
        'rounded-borders': this.rounded
      }
    },

    contentStyle () {
      if (this.fontSize) {
        return { fontSize: this.fontSize }
      }
    }
  },

  render () {
    const icon = this.icon !== void 0
      ? [ h(QIcon, { name: this.icon }) ]
      : void 0

    return h('div', {
      class: 'q-avatar',
      style: this.sizeStyle
      // TODO: Vue 3, uses ListenersMixin
      // on: { ...this.qListeners }
    }, [
      h('div', {
        class: ['q-avatar__content row flex-center overflow-hidden', this.contentClass],
        style: this.contentStyle
      }, mergeSlotSafely(icon, this, 'default'))
    ])
  }
})

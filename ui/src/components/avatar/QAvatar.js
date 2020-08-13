import { defineComponent, h, computed, toRef } from 'vue'

import QIcon from '../icon/QIcon.js'

import ListenersMixin from '../../mixins/listeners.js'

import { mergeSlotSafely } from '../../utils/slot.js'
import { useSizes, useSizesProps } from '../../composables/useSizes.js'

export default defineComponent({
  name: 'QAvatar',

  mixins: [ ListenersMixin ],

  props: {
    ...useSizesProps,
    fontSize: String,

    color: String,
    textColor: String,

    icon: String,
    square: Boolean,
    rounded: Boolean
  },

  setup (props, context) {
    const size = toRef(props, 'size')

    const { sizeStyle } = useSizes(size)

    const contentClass = computed(() => ({
      [`bg-${props.color}`]: props.color,
      [`text-${props.textColor} q-chip--colored`]: props.textColor,
      'q-avatar__content--square': props.square,
      'rounded-borders': props.rounded
    }))

    const contentStyle = computed(() => props.fontSize ? {
      fontSize: props.fontSize
    } : void 0)

    const icon = props.icon !== void 0
      ? [ h(QIcon, { name: props.icon }) ]
      : void 0

    return () => h('div', {
      class: 'q-avatar',
      style: sizeStyle.value
      // TODO: Vue 3, uses ListenersMixin
      // on: { ...this.qListeners }
    }, [
      h('div', {
        class: ['q-avatar__content row flex-center overflow-hidden', contentClass.value],
        style: contentStyle.value
      }, mergeSlotSafely(icon, context, 'default'))
    ])
  }
})

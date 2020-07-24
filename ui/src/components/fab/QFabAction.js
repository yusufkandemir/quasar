import { defineComponent, h } from 'vue'

import QBtn from '../btn/QBtn.js'
import QIcon from '../icon/QIcon.js'

import FabMixin from '../../mixins/fab.js'
import ListenersMixin from '../../mixins/listeners.js'

import { mergeSlot } from '../../utils/slot.js'

const anchorMap = {
  start: 'self-end',
  center: 'self-center',
  end: 'self-start'
}

const anchorValues = Object.keys(anchorMap)

export default defineComponent({
  name: 'QFabAction',

  mixins: [ ListenersMixin, FabMixin ],

  props: {
    icon: {
      type: String,
      default: ''
    },

    anchor: {
      type: String,
      validator: v => anchorValues.includes(v)
    },

    to: [String, Object],
    replace: Boolean
  },

  inject: {
    __qFabClose: {
      from: '__qFabClose',
      default () {
        console.error('QFabAction needs to be child of QFab')
      }
    }
  },

  emits: ['click'],

  computed: {
    classes () {
      const align = anchorMap[this.anchor]
      return this.formClass + (align !== void 0 ? ` ${align}` : '')
    },

    eventListeners () {
      return {
        // TODO: Vue 3, uses ListenersMixin
        // ...this.qListeners,
        onClick: this.click
      }
    }
  },

  methods: {
    click (e) {
      this.__qFabClose()
      this.$emit('click', e)
    }
  },

  render () {
    const child = []

    this.icon !== '' && child.push(
      h(QIcon, {
        name: this.icon
      })
    )

    this.label !== '' && child[this.labelProps.action](
      h('div', this.labelProps.data, [this.label])
    )

    return h(QBtn, {
      class: this.classes,
      ...this.$props,
      noWrap: true,
      stack: this.stacked,
      icon: void 0,
      label: void 0,
      noCaps: true,
      fabMini: true,
      ...this.eventListeners
    }, mergeSlot(child, this, 'default'))
  }
})

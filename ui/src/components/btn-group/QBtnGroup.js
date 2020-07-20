import { defineComponent, h } from 'vue'

import ListenersMixin from '../../mixins/listeners.js'

import { slot } from '../../utils/slot.js'

export default defineComponent({
  name: 'QBtnGroup',

  mixin: [ ListenersMixin ],

  props: {
    unelevated: Boolean,
    outline: Boolean,
    flat: Boolean,
    rounded: Boolean,
    push: Boolean,
    stretch: Boolean,
    glossy: Boolean,
    spread: Boolean
  },

  computed: {
    classes () {
      return ['unelevated', 'outline', 'flat', 'rounded', 'push', 'stretch', 'glossy']
        .filter(t => this[t] === true)
        .map(t => `q-btn-group--${t}`).join(' ')
    }
  },

  render () {
    return h('div', {
      class: [
        'q-btn-group row no-wrap ' + (this.spread === true ? 'q-btn-group--spread' : 'inline'),
        this.classes
      ]
      // TODO: Vue 3, uses ListenersMixin
      // on: { ...this.qListeners }
    }, slot(this, 'default'))
  }
})

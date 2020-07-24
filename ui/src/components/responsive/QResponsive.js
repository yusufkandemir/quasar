import { defineComponent, h } from 'vue'

import RatioMixin from '../../mixins/ratio.js'
import ListenersMixin from '../../mixins/listeners.js'

import { slot } from '../../utils/slot.js'

export default defineComponent({
  name: 'QResponsive',

  mixins: [RatioMixin, ListenersMixin],

  render () {
    return h('div', {
      class: 'q-responsive'
      // TODO: Vue 3, uses ListenersMixin
      // on: { ...this.qListeners }
    }, [
      h('div', {
        class: 'q-responsive__filler overflow-hidden'
      }, [
        h('div', { style: this.ratioStyle })
      ]),

      h('div', {
        class: 'q-responsive__content absolute-full fit'
      }, slot(this, 'default'))
    ])
  }
})

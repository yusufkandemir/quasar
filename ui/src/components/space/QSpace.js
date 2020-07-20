import { defineComponent, h } from 'vue'

import ListenersMixin from '../../mixins/listeners.js'

export default defineComponent({
  name: 'QSpace',

  mixins: [ ListenersMixin ],

  render () {
    return h('div', {
      class: 'q-space'
      // TODO: Vue 3, uses ListenersMixin
      // on: { ...this.qListeners },
    })
  }
})

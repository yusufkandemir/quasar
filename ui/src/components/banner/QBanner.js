import { defineComponent, h } from 'vue'

import DarkMixin from '../../mixins/dark.js'
import ListenersMixin from '../../mixins/listeners.js'

import { slot } from '../../utils/slot.js'

const attrs = { role: 'alert' }

export default defineComponent({
  name: 'QBanner',

  mixins: [ ListenersMixin, DarkMixin ],

  props: {
    inlineActions: Boolean,
    dense: Boolean,
    rounded: Boolean
  },

  render () {
    const actions = slot(this, 'action')
    const child = [
      h('div', {
        class: 'q-banner__avatar col-auto row items-center self-start'
      }, slot(this, 'avatar')),

      h('div', {
        class: 'q-banner__content col text-body2'
      }, slot(this, 'default'))
    ]

    actions !== void 0 && child.push(
      h('div', {
        class: ['q-banner__actions row items-center justify-end', `col-${this.inlineActions === true ? 'auto' : 'all'}`]
      }, actions)
    )

    return h('div', {
      class: {
        'q-banner row items-center': true,
        'q-banner--top-padding': actions !== void 0 && !this.inlineActions,
        'q-banner--dense': this.dense,
        'q-banner--dark q-dark': this.isDark,
        'rounded-borders': this.rounded
      },
      ...attrs
      // TODO: Vue 3, uses ListenersMixin
      // on: { ...this.qListeners }
    }, child)
  }
})

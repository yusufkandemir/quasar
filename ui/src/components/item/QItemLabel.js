import { defineComponent, h } from 'vue'

import ListenersMixin from '../../mixins/listeners.js'

import { slot } from '../../utils/slot.js'

export default defineComponent({
  name: 'QItemLabel',

  mixins: [ ListenersMixin ],

  props: {
    overline: Boolean,
    caption: Boolean,
    header: Boolean,
    lines: [ Number, String ]
  },

  computed: {
    classes () {
      return {
        'q-item__label--overline text-overline': this.overline,
        'q-item__label--caption text-caption': this.caption,
        'q-item__label--header': this.header,
        'ellipsis': parseInt(this.lines, 10) === 1
      }
    },

    style () {
      if (this.lines !== void 0 && parseInt(this.lines, 10) > 1) {
        return {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': this.lines
        }
      }
    }
  },

  render () {
    return h('div', {
      style: this.style,
      class: ['q-item__label', this.classes]
      // TODO: Vue 3, uses ListenersMixin
      // on: { ...this.qListeners }
    }, slot(this, 'default'))
  }
})

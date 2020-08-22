import { defineComponent, h } from 'vue'

import CheckboxMixin from '../../mixins/checkbox.js'

export default defineComponent({
  name: 'QCheckbox',

  mixins: [ CheckboxMixin ],

  methods: {
    __getInner () {
      return [
        h('div', {
          class: 'q-checkbox__bg absolute'
        }, [
          h('svg', {
            class: 'q-checkbox__svg fit absolute-full',
            focusable: 'false' /* needed for IE11 */,
            viewBox: '0 0 24 24',
            'aria-hidden': 'true'
          }, [
            h('path', {
              class: 'q-checkbox__truthy',
              fill: 'none',
              d: 'M1.73,12.91 8.1,19.28 22.79,4.59'
            }),

            h('path', {
              class: 'q-checkbox__indet',
              d: 'M4,14H20V10H4'
            })
          ])
        ])
      ]
    }
  },

  created () {
    this.type = 'checkbox'
  },

  render: CheckboxMixin.render
})

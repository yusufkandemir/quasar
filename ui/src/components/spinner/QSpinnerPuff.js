import { defineComponent, h } from 'vue'

import mixin from './spinner-mixin.js'

export default defineComponent({
  name: 'QSpinnerPuff',

  mixins: [ mixin ],

  render () {
    return h('svg', {
      class: ['q-spinner', this.classes],
      // TODO: Vue 3, uses ListenersMixin
      // on: { ...this.qListeners },
      focusable: 'false' /* needed for IE11 */,
      'stroke': 'currentColor',
      'width': this.cSize,
      'height': this.cSize,
      'viewBox': '0 0 44 44',
      'xmlns': 'http://www.w3.org/2000/svg'
    }, [
      h('g', {
        'fill': 'none',
        'fill-rule': 'evenodd',
        'stroke-width': '2'
      }, [
        h('circle', {
          'cx': '22',
          'cy': '22',
          'r': '1'
        }, [
          h('animate', {
            'attributeName': 'r',
            'begin': '0s',
            'dur': '1.8s',
            'values': '1; 20',
            'calcMode': 'spline',
            'keyTimes': '0; 1',
            'keySplines': '0.165, 0.84, 0.44, 1',
            'repeatCount': 'indefinite'
          }),
          h('animate', {
            'attributeName': 'stroke-opacity',
            'begin': '0s',
            'dur': '1.8s',
            'values': '1; 0',
            'calcMode': 'spline',
            'keyTimes': '0; 1',
            'keySplines': '0.3, 0.61, 0.355, 1',
            'repeatCount': 'indefinite'
          })
        ]),
        h('circle', {
          'cx': '22',
          'cy': '22',
          'r': '1'
        }, [
          h('animate', {
            'attributeName': 'r',
            'begin': '-0.9s',
            'dur': '1.8s',
            'values': '1; 20',
            'calcMode': 'spline',
            'keyTimes': '0; 1',
            'keySplines': '0.165, 0.84, 0.44, 1',
            'repeatCount': 'indefinite'
          }),
          h('animate', {
            'attributeName': 'stroke-opacity',
            'begin': '-0.9s',
            'dur': '1.8s',
            'values': '1; 0',
            'calcMode': 'spline',
            'keyTimes': '0; 1',
            'keySplines': '0.3, 0.61, 0.355, 1',
            'repeatCount': 'indefinite'
          })
        ])
      ])
    ])
  }
})

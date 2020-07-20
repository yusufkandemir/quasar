import { h, defineComponent } from 'vue'

import mixin from './spinner-mixin.js'

export default defineComponent({
  name: 'QSpinnerBars',

  mixins: [ mixin ],

  render () {
    return h('svg', {
      class: ['q-spinner', this.classes],
      // TODO: Vue 3, uses ListenersMixin
      // on: { ...this.qListeners },
      focusable: 'false' /* needed for IE11 */,
      'fill': 'currentColor',
      'width': this.cSize,
      'height': this.cSize,
      'viewBox': '0 0 135 140',
      'xmlns': 'http://www.w3.org/2000/svg'
    }, [
      h('rect', {
        'y': '10',
        'width': '15',
        'height': '120',
        'rx': '6'
      }, [
        h('animate', {
          'attributeName': 'height',
          'begin': '0.5s',
          'dur': '1s',
          'values': '120;110;100;90;80;70;60;50;40;140;120',
          'calcMode': 'linear',
          'repeatCount': 'indefinite'
        }),
        h('animate', {
          'attributeName': 'y',
          'begin': '0.5s',
          'dur': '1s',
          'values': '10;15;20;25;30;35;40;45;50;0;10',
          'calcMode': 'linear',
          'repeatCount': 'indefinite'
        })
      ]),
      h('rect', {
        'x': '30',
        'y': '10',
        'width': '15',
        'height': '120',
        'rx': '6'
      }, [
        h('animate', {
          'attributeName': 'height',
          'begin': '0.25s',
          'dur': '1s',
          'values': '120;110;100;90;80;70;60;50;40;140;120',
          'calcMode': 'linear',
          'repeatCount': 'indefinite'
        }),
        h('animate', {
          'attributeName': 'y',
          'begin': '0.25s',
          'dur': '1s',
          'values': '10;15;20;25;30;35;40;45;50;0;10',
          'calcMode': 'linear',
          'repeatCount': 'indefinite'
        })
      ]),
      h('rect', {
        'x': '60',
        'width': '15',
        'height': '140',
        'rx': '6'
      }, [
        h('animate', {
          'attributeName': 'height',
          'begin': '0s',
          'dur': '1s',
          'values': '120;110;100;90;80;70;60;50;40;140;120',
          'calcMode': 'linear',
          'repeatCount': 'indefinite'
        }),
        h('animate', {
          'attributeName': 'y',
          'begin': '0s',
          'dur': '1s',
          'values': '10;15;20;25;30;35;40;45;50;0;10',
          'calcMode': 'linear',
          'repeatCount': 'indefinite'
        })
      ]),
      h('rect', {
        'x': '90',
        'y': '10',
        'width': '15',
        'height': '120',
        'rx': '6'
      }, [
        h('animate', {
          'attributeName': 'height',
          'begin': '0.25s',
          'dur': '1s',
          'values': '120;110;100;90;80;70;60;50;40;140;120',
          'calcMode': 'linear',
          'repeatCount': 'indefinite'
        }),
        h('animate', {
          'attributeName': 'y',
          'begin': '0.25s',
          'dur': '1s',
          'values': '10;15;20;25;30;35;40;45;50;0;10',
          'calcMode': 'linear',
          'repeatCount': 'indefinite'
        })
      ]),
      h('rect', {
        'x': '120',
        'y': '10',
        'width': '15',
        'height': '120',
        'rx': '6'
      }, [
        h('animate', {
          'attributeName': 'height',
          'begin': '0.5s',
          'dur': '1s',
          'values': '120;110;100;90;80;70;60;50;40;140;120',
          'calcMode': 'linear',
          'repeatCount': 'indefinite'
        }),
        h('animate', {
          'attributeName': 'y',
          'begin': '0.5s',
          'dur': '1s',
          'values': '10;15;20;25;30;35;40;45;50;0;10',
          'calcMode': 'linear',
          'repeatCount': 'indefinite'
        })
      ])
    ])
  }
})

import { defineComponent, h, withDirectives } from 'vue'

import DarkMixin from '../../mixins/dark.js'
import { PanelParentMixin } from '../../mixins/panel.js'

export default defineComponent({
  name: 'QTabPanels',

  mixins: [ DarkMixin, PanelParentMixin ],

  computed: {
    classes () {
      return 'q-tab-panels q-panel-parent' +
        (this.isDark === true ? ' q-tab-panels--dark q-dark' : '')
    }
  },

  methods: {
    __renderPanels () {
      return withDirectives(
        h('div', {
          class: this.classes
          // TODO: Vue 3, uses ListenersMixin
          // on: { ...this.qListeners }
        }, this.__getPanelContent()),
        this.panelDirectives
      )
    }
  }
})

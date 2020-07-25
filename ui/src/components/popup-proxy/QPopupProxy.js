import { defineComponent, h } from 'vue'

import QDialog from '../dialog/QDialog.js'
import QMenu from '../menu/QMenu.js'

import AnchorMixin from '../../mixins/anchor.js'
import { slot } from '../../utils/slot.js'
import AttrsMixin from '../../mixins/attrs.js'
import ListenersMixin from '../../mixins/listeners.js'

export default defineComponent({
  name: 'QPopupProxy',

  mixins: [ AttrsMixin, ListenersMixin, AnchorMixin ],

  props: {
    breakpoint: {
      type: [String, Number],
      default: 450
    }
  },

  emits: ['hide'],

  data () {
    const breakpoint = parseInt(this.breakpoint, 10)
    return {
      type: this.$q.screen.width < breakpoint || this.$q.screen.height < breakpoint
        ? 'dialog'
        : 'menu'
    }
  },

  computed: {
    parsedBreakpoint () {
      return parseInt(this.breakpoint, 10)
    },

    onEvents () {
      return {
        // TODO: Vue 3, uses ListenersMixin
        // ...this.qListeners,
        onHide: this.__onHide
      }
    }
  },

  methods: {
    toggle (evt) {
      this.$refs.popup.toggle(evt)
    },

    show (evt) {
      this.$refs.popup.show(evt)
    },

    hide (evt) {
      this.$refs.popup.hide(evt)
    },

    __onHide (evt) {
      this.__updateType(this.$q.screen.width, this.$q.screen.height, this.parsedBreakpoint)
      this.$emit('hide', evt)
    },

    __updateType (width, height, breakpoint) {
      const type = width < breakpoint || height < breakpoint
        ? 'dialog'
        : 'menu'

      if (this.type !== type) {
        this.type = type
      }
    }
  },

  mounted () {
    this.$watch(() => this.$q.screen.width, width => {
      if (this.$refs.popup.showing !== true) {
        this.__updateType(width, this.$q.screen.height, this.parsedBreakpoint)
      }
    })

    this.$watch(() => this.$q.screen.height, height => {
      if (this.$refs.popup.showing !== true) {
        this.__updateType(this.$q.screen.width, height, this.parsedBreakpoint)
      }
    })

    this.$watch(() => this.breakpoint, breakpoint => {
      if (this.$refs.popup.showing !== true) {
        this.__updateType(this.$q.screen.width, this.$q.screen.height, parseInt(breakpoint, 10))
      }
    })
  },

  render () {
    const defaultSlot = slot(this, 'default')

    const props = (
      this.type === 'menu' &&
      defaultSlot !== void 0 &&
      defaultSlot[0] !== void 0 &&
      defaultSlot[0].type !== void 0 &&
      ['QDate', 'QTime', 'QCarousel', 'QColor'].includes(defaultSlot[0].type.name)
    ) ? { cover: true, maxHeight: '99vh' } : {}

    const data = {
      ref: 'popup',
      ...props,
      ...this.qAttrs,
      ...this.onEvents
    }

    let component

    if (this.type === 'dialog') {
      component = QDialog
    }
    else {
      component = QMenu
      data.target = this.target
      data.contextMenu = this.contextMenu
      data.noParentEvent = true
      data.separateClosePopup = true
    }

    return h(component, data, defaultSlot)
  }
})

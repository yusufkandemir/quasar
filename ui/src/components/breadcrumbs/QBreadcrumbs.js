import { defineComponent, h } from 'vue'

import AlignMixin from '../../mixins/align.js'
import { slot } from '../../utils/slot.js'
import ListenersMixin from '../../mixins/listeners.js'

export default defineComponent({
  name: 'QBreadcrumbs',

  mixins: [ ListenersMixin, AlignMixin ],

  props: {
    separator: {
      type: String,
      default: '/'
    },
    separatorColor: String,

    activeColor: {
      type: String,
      default: 'primary'
    },

    gutter: {
      type: String,
      validator: v => ['none', 'xs', 'sm', 'md', 'lg', 'xl'].includes(v),
      default: 'sm'
    }
  },

  computed: {
    classes () {
      return `${this.alignClass}${this.gutter === 'none' ? '' : ` q-gutter-${this.gutter}`}`
    },

    sepClass () {
      if (this.separatorColor) {
        return `text-${this.separatorColor}`
      }
    },

    activeClass () {
      return `text-${this.activeColor}`
    }
  },

  render () {
    const nodes = slot(this, 'default')
    if (nodes === void 0) { return }

    let els = 1

    const isBreadcrumbEl = component => component.type !== void 0 && component.type.name === 'QBreadcrumbsEl'

    const children = []
    const len = nodes.filter(component => isBreadcrumbEl(component)).length
    const separator = this.$slots.separator !== void 0
      ? this.$slots.separator
      : () => this.separator

    nodes.forEach(comp => {
      if (isBreadcrumbEl(comp)) {
        const middle = els < len
        els++

        children.push(h('div', {
          class: ['flex items-center', middle ? this.activeClass : 'q-breadcrumbs--last']
        }, [ comp ]))

        if (middle) {
          children.push(h('div', {
            class: ['q-breadcrumbs__separator', this.sepClass]
          }, separator()))
        }
      }
      else {
        children.push(comp)
      }
    })

    return h('div', {
      class: 'q-breadcrumbs'
      // TODO: Vue 3, uses ListenersMixin
      // on: { ...this.qListeners }
    }, [
      h('div', {
        class: ['flex items-center', this.classes]
      }, children)
    ])
  }
})

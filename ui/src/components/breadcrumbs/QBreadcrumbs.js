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

    const
      child = [],
      len = nodes.filter(c => c.tag !== void 0 && c.tag.endsWith('-QBreadcrumbsEl')).length,
      separator = this.$slots.separator !== void 0
        ? this.$slots.separator
        : () => this.separator

    nodes.forEach(comp => {
      if (comp.tag !== void 0 && comp.tag.endsWith('-QBreadcrumbsEl')) {
        const middle = els < len
        els++

        child.push(h('div', {
          class: ['flex items-center', middle ? this.activeClass : 'q-breadcrumbs--last']
        }, [ comp ]))

        if (middle) {
          child.push(h('div', {
            class: ['q-breadcrumbs__separator', this.sepClass]
          }, separator()))
        }
      }
      else {
        child.push(comp)
      }
    })

    return h('div', {
      class: 'q-breadcrumbs'
      // TODO: Vue 3, uses ListenersMixin
      // on: { ...this.qListeners }
    }, [
      h('div', {
        class: ['flex items-center', this.classes]
      }, child)
    ])
  }
})

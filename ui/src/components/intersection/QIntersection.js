import { h, defineComponent, withDirectives, Transition } from 'vue'

import { onSSR } from '../../plugins/Platform.js'

import Intersection from '../../directives/Intersection.js'

import TagMixin from '../../mixins/tag.js'
import ListenersMixin from '../../mixins/listeners.js'

import { slot } from '../../utils/slot.js'

export default defineComponent({
  name: 'QIntersection',

  mixins: [ TagMixin, ListenersMixin ],

  props: {
    once: Boolean,
    transition: String,

    ssrPrerender: Boolean,

    margin: String,
    threshold: [ Number, Array ],

    disable: Boolean
  },

  emits: ['visibility'],

  data () {
    return {
      showing: onSSR === true ? this.ssrPrerender : false
    }
  },

  computed: {
    value () {
      return this.margin !== void 0 || this.threshold !== void 0
        ? {
          handler: this.__trigger,
          cfg: {
            rootMargin: this.margin,
            threshold: this.threshold
          }
        }
        : this.__trigger
    },

    directives () {
      const directives = []

      if (this.disable !== true && (onSSR !== true || this.once !== true || this.ssrPrerender !== true)) {
        directives.push([Intersection, this.value, '', { once: this.once }])
      }

      return directives
    }
  },

  methods: {
    __trigger (entry) {
      if (this.showing !== entry.isIntersecting) {
        this.showing = entry.isIntersecting

        if (this.qListeners.visibility !== void 0) {
          this.$emit('visibility', this.showing)
        }
      }
    }
  },

  render () {
    const content = this.showing === true
      ? [ h('div', { key: 'content' }, slot(this, 'default')) ]
      : void 0

    return withDirectives(
      h(this.tag, {
        class: 'q-intersection'
        // TODO: Vue 3, uses ListenersMixin
        // on: { ...this.qListeners },
      }, this.transition
        ? [
          h(Transition, {
            name: 'q-transition--' + this.transition
          }, content)
        ]
        : content
      ),
      this.directives
    )
  }
})

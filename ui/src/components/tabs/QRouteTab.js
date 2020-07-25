import { defineComponent, resolveComponent } from 'vue'

import QTab from './QTab.js'
import { RouterLinkMixin } from '../../mixins/router-link.js'
import { isSameRoute, isIncludedRoute } from '../../utils/router.js'

export default defineComponent({
  name: 'QRouteTab',

  mixins: [ QTab, RouterLinkMixin ],

  props: {
    to: { required: true }
  },

  inject: {
    __activateRoute: {
      from: '__activateRoute'
    },
    __recalculateScroll: {
      from: '__recalculateScroll'
    }
  },

  watch: {
    $route () {
      this.__checkActivation()
    }
  },

  methods: {
    __activate (e, keyboard) {
      if (this.disable !== true) {
        this.__checkActivation(true)
      }

      if (keyboard === true) {
        this.$el.focus(e)
      }
      else {
        this.$refs.blurTarget !== void 0 && this.$refs.blurTarget.focus(e)
      }
    },

    __checkActivation (selected = false) {
      const current = this.$route
      const location = this.$router.resolve(this.to, current)
      const { href, matched, redirectedFrom } = location
      const redirected = redirectedFrom !== void 0
      const checkFunction = this.exact === true ? isSameRoute : isIncludedRoute
      const params = {
        name: this.name,
        selected,
        exact: this.exact,
        priorityMatched: matched.length,
        priorityHref: href.length
      }

      checkFunction(current, location) && this.__activateRoute({ ...params, redirected })
      redirected === true && checkFunction(current, {
        path: redirectedFrom,
        ...location
      }) && this.__activateRoute(params)
      this.isActive && this.__activateRoute()
    }
  },

  mounted () {
    this.__recalculateScroll()
    this.$router !== void 0 && this.__checkActivation()
  },

  beforeUnmount () {
    this.__recalculateScroll()
    this.__activateRoute({ remove: true, name: this.name })
  },

  render () {
    return this.__renderTab(resolveComponent('router-link'), this.routerLinkProps)
  }
})

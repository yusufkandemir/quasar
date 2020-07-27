import { defineComponent } from 'vue'

export const routerLinkProps = {
  to: [String, Object],
  exact: Boolean,
  replace: Boolean,
  activeClass: String,
  exactActiveClass: String,
  disable: Boolean
}

export const RouterLinkMixin = defineComponent({
  props: routerLinkProps,

  computed: {
    hasRouterLink () {
      return this.disable !== true && this.to !== void 0 && this.to !== null && this.to !== ''
    },

    routerLinkProps () {
      return {
        to: this.to,
        exact: this.exact,
        replace: this.replace,
        activeClass: this.activeClass || 'q-router-link--active',
        exactActiveClass: this.exactActiveClass || 'q-router-link--exact-active',
        event: this.disable === true ? '' : void 0
      }
    }
  }
})

import { defineComponent, h, resolveComponent } from 'vue'

import { mergeSlot } from '../../utils/slot.js'
import ListenersMixin from '../../mixins/listeners.js'

import QIcon from '../icon/QIcon.js'
import { RouterLinkMixin } from '../../mixins/router-link.js'

export default defineComponent({
  name: 'QBreadcrumbsEl',

  mixins: [ ListenersMixin, RouterLinkMixin ],

  props: {
    label: String,
    icon: String
  },

  render () {
    const child = []

    this.icon !== void 0 && child.push(
      h(QIcon, {
        class: ['q-breadcrumbs__el-icon', this.label !== void 0 ? 'q-breadcrumbs__el-icon--with-label' : null],
        name: this.icon
      })
    )

    this.label && child.push(this.label)

    return h(this.hasRouterLink === true ? resolveComponent('router-link') : 'span', {
      class: 'q-breadcrumbs__el q-link flex inline items-center relative-position',
      ...(this.hasRouterLink === true ? this.routerLinkProps : null)
      // TODO: Vue 3, uses ListenersMixin
      // [this.hasRouterLink === true ? 'nativeOn' : 'on']: { ...this.qListeners }
    }, mergeSlot(child, this, 'default'))
  }
})

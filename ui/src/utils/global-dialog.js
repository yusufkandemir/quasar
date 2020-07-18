import { createApp, h, reactive } from 'vue'

import { isSSR } from '../plugins/Platform.js'

const ssrAPI = {
  onOk: () => ssrAPI,
  okCancel: () => ssrAPI,
  hide: () => ssrAPI
}

// TODO: Vue 3, review
export default function (DefaultComponent) {
  return ({ className, class: klass, style, component, root, parent, ...props }) => {
    if (isSSR === true) { return ssrAPI }

    klass !== void 0 && (props.cardClass = klass)
    style !== void 0 && (props.cardStyle = style)

    const
      okFns = [],
      cancelFns = [],
      API = {
        onOk (fn) {
          okFns.push(fn)
          return API
        },
        onCancel (fn) {
          cancelFns.push(fn)
          return API
        },
        onDismiss (fn) {
          okFns.push(fn)
          cancelFns.push(fn)
          return API
        },
        hide () {
          vm.$refs.dialog.hide()
          return API
        }
      }

    const node = document.createElement('div')
    document.body.appendChild(node)

    let emittedOK = false

    const on = {
      ok: data => {
        emittedOK = true
        okFns.forEach(fn => { fn(data) })
      },

      hide: () => {
        vm.$destroy()
        vm.$el.remove()
        vm = null

        if (emittedOK !== true) {
          cancelFns.forEach(fn => { fn() })
        }
      }
    }

    props = reactive(props)

    const DialogComponent = component !== void 0
      ? component
      : DefaultComponent

    const attrs = component === void 0
      ? props
      : void 0

    const dialogApp = createApp({
      name: 'QGlobalDialog',

      // TODO: Find Vue 3 equivalent
      parent: parent === void 0 ? root : parent,

      render () {
        return h(DialogComponent, {
          ref: 'dialog',
          props,
          attrs,
          on
        })
      },

      mounted () {
        this.$refs.dialog.show()
      }
    })
    dialogApp.config.globalProperties.$q = $q

    let vm = dialogApp.mount(node)

    return API
  }
}

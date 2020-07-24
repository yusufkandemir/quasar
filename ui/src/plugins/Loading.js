import { createApp, h, Transition, ref } from 'vue'

import QSpinner from '../components/spinner/QSpinner.js'
import { isSSR } from './Platform.js'
import cache from '../utils/cache.js'
import { preventScroll } from '../mixins/prevent-scroll.js'

let
  app,
  vm,
  uid = 0,
  timeout,
  props = {}
const
  originalDefaults = {
    delay: 0,
    message: false,
    spinnerSize: 80,
    spinnerColor: 'white',
    messageColor: 'white',
    backgroundColor: 'black',
    spinner: QSpinner,
    customClass: ''
  },
  defaults = { ...originalDefaults }

const Loading = {
  _isActive: ref(false),
  get isActive () {
    return this._isActive.value
  },
  set isActive (value) {
    this._isActive.value = value
  },

  show (opts) {
    if (isSSR === true) { return }

    props = opts === Object(opts) && opts.ignoreDefaults === true
      ? { ...originalDefaults, ...opts }
      : { ...defaults, ...opts }

    props.customClass += ` text-${props.backgroundColor}`
    props.uid = `l_${uid++}`

    this.isActive = true

    if (vm !== void 0) {
      vm.$forceUpdate()
      return
    }

    clearTimeout(timeout)
    timeout = setTimeout(() => {
      timeout = void 0

      const node = document.createElement('div')
      document.body.appendChild(node)

      app = createApp({
        name: 'QLoading',

        mounted () {
          preventScroll(true)
        },

        render: (_ctx, _cache) => {
          return h(Transition, {
            name: 'q-transition--fade',
            appear: true,
            ...cache(this, 'tr', {
              'onAfter-leave': () => {
              // might be called to finalize
              // previous leave, even if it was cancelled
                if (this.isActive !== true && vm !== void 0) {
                  preventScroll(false)

                  app.unmount(node)
                  vm.$el.remove()
                  node.remove()
                  vm = void 0
                  app = void 0
                }
              }
            })
          }, () => [
            this.isActive === true ? h('div', {
              key: props.uid,
              class: ['q-loading fullscreen column flex-center z-max', props.customClass.trim()]
            }, [
              h(props.spinner, {
                color: props.spinnerColor,
                size: props.spinnerSize
              }),
              (props.message && h('div', {
                class: `text-${props.messageColor}`,
                [props.sanitize === true ? 'textContent' : 'innerHTML']: props.message
              })) || void 0
            ]) : null
          ])
        }
      })

      vm = app.mount(node)
    }, props.delay)
  },

  hide () {
    if (this.isActive === true) {
      if (timeout !== void 0) {
        clearTimeout(timeout)
        timeout = void 0
      }

      this.isActive = false
    }
  },

  setDefaults (opts) {
    opts === Object(opts) && Object.assign(defaults, opts)
  },

  install ({ $q, cfg: { loading } }) {
    this.setDefaults(loading)
    $q.loading = this
  }
}

if (isSSR === false) {
  // TODO: Find a way to make this still reactive in Vue 3
  // Vue.util.defineReactive(Loading, 'isActive', Loading.isActive)
}

export default Loading

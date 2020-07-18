import { createApp, h } from 'vue'

import { isSSR } from './Platform.js'
import { noop } from '../utils/event.js'
import QAjaxBar from '../components/ajax-bar/QAjaxBar.js'

export default {
  isActive: false,
  start: noop,
  stop: noop,
  increment: noop,
  setDefaults: noop,

  install ({ $q, cfg }) {
    if (isSSR === true) {
      $q.loadingBar = this
      return
    }

    const props = cfg.loadingBar !== void 0
      ? { ...cfg.loadingBar }
      : {}

    const container = document.createElement('div')
    const barApp = createApp({
      name: 'LoadingBar',
      render: () => h(QAjaxBar, {
        ref: 'bar',
        props
      })
    })
    barApp.config.globalProperties.$q = $q

    const barInstance = barApp.mount(container)
    const bar = $q.loadingBar = barInstance.$refs.bar

    Object.assign(this, {
      start: speed => {
        bar.start(speed)
        this.isActive = bar.isActive = bar.calls > 0
      },
      stop: () => {
        bar.stop()
        this.isActive = bar.isActive = bar.calls > 0
      },
      increment: bar.increment,
      setDefaults: opts => {
        opts === Object(opts) && Object.assign(props, opts)
        bar.$parent.$forceUpdate()
      }
    })

    // TODO: Find a way to make these reactive in Vue 3
    // Vue.util.defineReactive(this, 'isActive', this.isActive)
    // Vue.util.defineReactive(bar, 'isActive', this.isActive)
    bar.setDefaults = this.setDefaults

    document.body.appendChild(bar.$parent.$el)
  }
}

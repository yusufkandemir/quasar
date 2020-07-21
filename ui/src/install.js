import pkg from '../package.json'
const { version } = pkg

import Platform, { isSSR } from './plugins/Platform.js'
import Screen from './plugins/Screen.js'
import Dark from './plugins/Dark.js'
import History from './history.js'
import Lang from './lang.js'
import Body from './body.js'
import IconSet from './icon-set.js'

const autoInstalled = [
  Platform, Screen, Dark
]

export const queues = {
  server: [], // on SSR update
  takeover: [] // on client takeover
}

export const $q = {
  version,
  config: {}
}

export default function (app, opts = {}) {
  if (this.__qInstalled === true) { return }
  this.__qInstalled = true

  const cfg = $q.config = Object.freeze(opts.config || {})

  // required plugins
  Platform.install($q, queues)
  Body.install(queues, cfg)
  Dark.install($q, queues, cfg)
  Screen.install($q, queues, cfg)
  History.install(cfg)
  Lang.install($q, queues, opts.lang)
  IconSet.install($q, queues, opts.iconSet)

  if (isSSR === true) {
    app.mixin({
      beforeCreate () {
        this.$q = this.$root.$options.$q
      }
    })
  }
  else {
    app.config.globalProperties.$q = $q
  }

  opts.components && Object.keys(opts.components).forEach(key => {
    const c = opts.components[key]
    if (typeof c === 'object') {
      app.component(c.name, c)
    }
  })

  opts.directives && Object.keys(opts.directives).forEach(key => {
    const d = opts.directives[key]
    if (d.name !== undefined && d.unmounted !== void 0) {
      app.directive(d.name, d)
    }
  })

  if (opts.plugins) {
    const param = { app, $q, queues, cfg }
    Object.keys(opts.plugins).forEach(key => {
      const p = opts.plugins[key]
      if (typeof p.install === 'function' && autoInstalled.includes(p) === false) {
        p.install(param)
      }
    })
  }
}

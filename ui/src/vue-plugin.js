import install from './install.js'

import pkg from '../package.json'
const { version } = pkg

import lang from './lang.js'
import iconSet from './icon-set.js'
import ssrUpdate from './ssr-update.js'

export default {
  version,
  install,
  lang,
  iconSet,
  ssrUpdate
}

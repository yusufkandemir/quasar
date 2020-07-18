/**
 * Quasar runtime for auto-importing
 * components or directives.
 *
 * Warning! This file does NOT get transpiled by Babel
 * but is included into the UI code.
 *
 * @param {component} Vue Component object
 * @param {type}      One of 'components' or 'directives'
 * @param {items}     Object containing components or directives
 */
module.exports = function qInstall (component, type, items) {
  if (component[type] === void 0) {
    component[type] = items
  }
  else {
    let target = component[type]
    for (let i in items) {
      if (target[i] === void 0) {
        target[i] = items[i]
      }
    }
  }
}

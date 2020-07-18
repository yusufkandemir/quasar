import { isSSR } from '../plugins/Platform.js'

export default function cache (vm, key, obj) {
  if (isSSR === true) return obj

  const k = `__qcache_${key}`
  return !(k in vm) || vm[k] === void 0
    ? (vm[k] = obj)
    : vm[k]
}

// TODO: Vue 3 reactivity system allows dynamic properties, but IE11 build will not.
// Discuss if we still need IE11 support, if not we can refactor this
export function getPropCacheMixin (propName, proxyPropName) {
  return {
    data () {
      return { [proxyPropName]: {} }
    },

    watch: {
      [propName]: {
        immediate: true,
        handler (newObj, oldObj) {
          const target = this[proxyPropName]

          if (oldObj !== void 0) {
            // we first delete obsolete events
            for (const prop in oldObj) {
              if (newObj[prop] === void 0) {
                this.$delete(target, prop)
              }
            }
          }

          for (const prop in newObj) {
            // we then update changed events
            if (target[prop] !== newObj[prop]) {
              this.$set(target, prop, newObj[prop])
            }
          }
        }
      }
    }
  }
}

import { getScrollPosition, getScrollTarget, getHorizontalScrollPosition } from '../utils/scroll.js'
import { listenOpts } from '../utils/event.js'

function updateBinding (ctx, { value, oldValue }) {
  if (typeof value !== 'function') {
    ctx.scrollTarget.removeEventListener('scroll', ctx.scroll, listenOpts.passive)
    return
  }

  ctx.handler = value
  if (typeof oldValue !== 'function') {
    ctx.scrollTarget.addEventListener('scroll', ctx.scroll, listenOpts.passive)
  }
}

export default {
  name: 'scroll',

  beforeMount (el) {
    const ctx = {
      scroll () {
        ctx.handler(
          getScrollPosition(ctx.scrollTarget),
          getHorizontalScrollPosition(ctx.scrollTarget)
        )
      }
    }

    if (el.__qscroll) {
      el.__qscroll_old = el.__qscroll
    }

    el.__qscroll = ctx
  },

  mounted (el, binding) {
    const ctx = el.__qscroll
    ctx.scrollTarget = getScrollTarget(el)
    updateBinding(ctx, binding)
  },

  updated (el, binding) {
    if (el.__qscroll !== void 0 && binding.oldValue !== binding.value) {
      updateBinding(el.__qscroll, binding)
    }
  },

  unmounted (el) {
    const ctx = el.__qscroll_old || el.__qscroll
    if (ctx !== void 0) {
      ctx.scrollTarget.removeEventListener('scroll', ctx.scroll, listenOpts.passive)
      delete el[el.__qscroll_old ? '__qscroll_old' : '__qscroll']
    }
  }
}

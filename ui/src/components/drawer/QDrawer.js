import { defineComponent, h, withDirectives } from 'vue'

import HistoryMixin from '../../mixins/history.js'
import ModelToggleMixin from '../../mixins/model-toggle.js'
import PreventScrollMixin from '../../mixins/prevent-scroll.js'
import DarkMixin from '../../mixins/dark.js'

import TouchPan from '../../directives/TouchPan.js'

import { between } from '../../utils/format.js'
import { slot } from '../../utils/slot.js'
import cache from '../../utils/cache.js'
import { ariaHidden } from '../../mixins/attrs'

const duration = 150

const mouseEvents = [
  'onMouseover', 'onMouseout', 'onMouseenter', 'onMouseleave'
]

export default defineComponent({
  name: 'QDrawer',

  inject: {
    layout: {
      from: 'layout',
      default () {
        console.error('QDrawer needs to be child of QLayout')
      }
    }
  },

  mixins: [ DarkMixin, HistoryMixin, ModelToggleMixin, PreventScrollMixin ],

  props: {
    side: {
      type: String,
      default: 'left',
      validator: v => ['left', 'right'].includes(v)
    },

    width: {
      type: Number,
      default: 300
    },

    mini: Boolean,
    miniToOverlay: Boolean,
    miniWidth: {
      type: Number,
      default: 57
    },

    breakpoint: {
      type: Number,
      default: 1023
    },
    showIfAbove: Boolean,

    behavior: {
      type: String,
      validator: v => ['default', 'desktop', 'mobile'].includes(v),
      default: 'default'
    },

    bordered: Boolean,
    elevated: Boolean,
    contentStyle: [String, Object, Array],
    contentClass: [String, Object, Array],

    overlay: Boolean,
    persistent: Boolean,
    noSwipeOpen: Boolean,
    noSwipeClose: Boolean,
    noSwipeBackdrop: Boolean
  },

  emits: ['update:modelValue', 'show', 'hide', 'click', 'on-layout', 'mini-state'],

  data () {
    const belowBreakpoint = (
      this.behavior === 'mobile' ||
      (this.behavior !== 'desktop' && this.layout.totalWidth <= this.breakpoint)
    )

    return {
      belowBreakpoint,
      showing: this.showIfAbove === true && belowBreakpoint === false
        ? true
        : this.modelValue === true
    }
  },

  watch: {
    belowBreakpoint (val) {
      if (val === true) { // from lg to xs
        this.lastDesktopState = this.showing
        this.showing === true && this.hide(false)
      }
      else if (
        this.overlay === false &&
        this.behavior !== 'mobile' &&
        this.lastDesktopState !== false
      ) { // from xs to lg
        if (this.showing === true) {
          this.__applyPosition(0)
          this.__applyBackdrop(0)
          this.__cleanup()
        }
        else {
          this.show(false)
        }
      }
    },

    side (newSide, oldSide) {
      if (this.layout.instances[oldSide] === this) {
        this.layout.instances[oldSide] = void 0
        this.layout[oldSide].space = false
        this.layout[oldSide].offset = 0
      }

      this.layout.instances[newSide] = this
      this.layout[newSide].size = this.size
      this.layout[newSide].space = this.onLayout
      this.layout[newSide].offset = this.offset
    },

    behavior (val) {
      this.__updateLocal('belowBreakpoint', (
        val === 'mobile' ||
        (val !== 'desktop' && this.layout.totalWidth <= this.breakpoint)
      ))
    },

    breakpoint (val) {
      this.__updateLocal('belowBreakpoint', (
        this.behavior === 'mobile' ||
        (this.behavior !== 'desktop' && this.layout.totalWidth <= val)
      ))
    },

    offset (val) {
      this.__update('offset', val)
    },

    onLayout (val) {
      this.$emit('on-layout', val)
      this.__update('space', val)
    },

    rightSide () {
      this.__applyPosition()
    },

    size (val) {
      this.__applyPosition()
      this.__updateSizeOnLayout(this.miniToOverlay, val)
    },

    miniToOverlay (val) {
      this.__updateSizeOnLayout(val, this.size)
    },

    mini () {
      if (this.modelValue === true) {
        this.__animateMini()
        this.layout.__animate()
      }
    },

    isMini (val) {
      this.$emit('mini-state', val)
    }
  },

  computed: {
    rightSide () {
      return this.side === 'right'
    },

    otherSide () {
      return this.rightSide === true ? 'left' : 'right'
    },

    offset () {
      return this.showing === true && this.belowBreakpoint === false && this.overlay === false
        ? (this.miniToOverlay === true ? this.miniWidth : this.size)
        : 0
    },

    size () {
      return this.isMini === true
        ? this.miniWidth
        : this.width
    },

    fixed () {
      return this.overlay === true ||
        this.miniToOverlay === true ||
        this.layout.view.indexOf(this.rightSide ? 'R' : 'L') > -1 ||
        (this.$q.platform.is.ios && this.layout.container === true)
    },

    onLayout () {
      return this.showing === true && this.belowBreakpoint === false && this.overlay === false
    },

    onScreenOverlay () {
      return this.showing === true && this.belowBreakpoint === false && this.overlay === true
    },

    backdropClass () {
      return this.showing === false ? 'hidden' : null
    },

    headerSlot () {
      return this.rightSide === true
        ? this.layout.rows.top[2] === 'r'
        : this.layout.rows.top[0] === 'l'
    },

    footerSlot () {
      return this.rightSide === true
        ? this.layout.rows.bottom[2] === 'r'
        : this.layout.rows.bottom[0] === 'l'
    },

    aboveStyle () {
      const css = {}

      if (this.layout.header.space === true && this.headerSlot === false) {
        if (this.fixed === true) {
          css.top = `${this.layout.header.offset}px`
        }
        else if (this.layout.header.space === true) {
          css.top = `${this.layout.header.size}px`
        }
      }

      if (this.layout.footer.space === true && this.footerSlot === false) {
        if (this.fixed === true) {
          css.bottom = `${this.layout.footer.offset}px`
        }
        else if (this.layout.footer.space === true) {
          css.bottom = `${this.layout.footer.size}px`
        }
      }

      return css
    },

    style () {
      const style = { width: `${this.size}px` }
      return this.belowBreakpoint === true
        ? style
        : Object.assign(style, this.aboveStyle)
    },

    classes () {
      return `q-drawer--${this.side}` +
        (this.bordered === true ? ' q-drawer--bordered' : '') +
        (this.isDark === true ? ' q-drawer--dark q-dark' : '') +
        (this.showing !== true ? ' q-layout--prevent-focus' : '') +
        (
          this.belowBreakpoint === true
            ? ' fixed q-drawer--on-top q-drawer--mobile q-drawer--top-padding'
            : ` q-drawer--${this.isMini === true ? 'mini' : 'standard'}` +
            (this.fixed === true || this.onLayout !== true ? ' fixed' : '') +
            (this.overlay === true || this.miniToOverlay === true ? ' q-drawer--on-top' : '') +
            (this.headerSlot === true ? ' q-drawer--top-padding' : '')
        )
    },

    stateDirection () {
      return (this.$q.lang.rtl === true ? -1 : 1) * (this.rightSide === true ? 1 : -1)
    },

    isMini () {
      return this.mini === true && this.belowBreakpoint !== true
    },

    eventListeners () {
      if (this.belowBreakpoint !== true) {
        const evt = {
          'onClick': e => { this.$emit('click', e) }
        }

        mouseEvents.forEach(name => {
          evt[name] = e => {
            // TODO: Vue 3, uses ListenersMixin
            // this.qListeners[name] !== void 0 && this.$emit(name, e)
          }
        })

        return evt
      }
    },

    hideOnRouteChange () {
      return this.persistent !== true &&
        (this.belowBreakpoint === true || this.onScreenOverlay === true)
    },

    openDirective () {
      const dir = this.$q.lang.rtl === true ? this.side : this.otherSide

      return [
        TouchPan,
        this.__openByTouch,
        '',
        {
          [dir]: true,
          mouse: true
        }
      ]
    },

    contentCloseDirective () {
      const dir = this.$q.lang.rtl === true ? this.otherSide : this.side

      return [
        TouchPan,
        this.__closeByTouch,
        '',
        {
          [dir]: true,
          mouse: true
        }
      ]
    },

    backdropCloseDirective () {
      const dir = this.$q.lang.rtl === true ? this.otherSide : this.side

      return [
        TouchPan,
        this.__closeByTouch,
        '',
        {
          [dir]: true,
          mouse: true,
          mouseAllDir: true
        }
      ]
    }
  },

  methods: {
    __applyPosition (position) {
      if (position === void 0) {
        this.$nextTick(() => {
          position = this.showing === true ? 0 : this.size
          this.__applyPosition(this.stateDirection * position)
        })
      }
      else if (this.$refs.content !== void 0) {
        if (
          this.layout.container === true &&
          this.rightSide === true &&
          (this.belowBreakpoint === true || Math.abs(position) === this.size)
        ) {
          position += this.stateDirection * this.layout.scrollbarWidth
        }

        if (this.__lastPosition !== position) {
          this.$refs.content.style.transform = `translateX(${position}px)`
          this.__lastPosition = position
        }
      }
    },

    __applyBackdrop (x, retry) {
      if (this.$refs.backdrop !== void 0) {
        this.$refs.backdrop.style.backgroundColor =
          this.lastBackdropBg = `rgba(0,0,0,${x * 0.4})`
      }
      else {
        // rendered nodes might not have
        // picked up this.showing change yet,
        // so we need one retry
        retry !== true && this.$nextTick(() => {
          this.__applyBackdrop(x, true)
        })
      }
    },

    __setBackdropVisible (v) {
      if (this.$refs.backdrop !== void 0) {
        this.$refs.backdrop.classList[v === true ? 'remove' : 'add']('hidden')
      }
    },

    __setScrollable (v) {
      const action = v === true
        ? 'remove'
        : (this.layout.container !== true ? 'add' : '')

      action !== '' && document.body.classList[action]('q-body--drawer-toggle')
    },

    __animateMini () {
      if (this.timerMini !== void 0) {
        clearTimeout(this.timerMini)
      }
      else if (this.$el !== void 0) {
        this.$el.classList.add('q-drawer--mini-animate')
      }
      this.timerMini = setTimeout(() => {
        this.$el !== void 0 && this.$el.classList.remove('q-drawer--mini-animate')
        this.timerMini = void 0
      }, 150)
    },

    __openByTouch (evt) {
      if (this.showing !== false) {
        // some browsers might capture and trigger this
        // even if Drawer has just been opened (but animation is still pending)
        return
      }

      const
        width = this.size,
        position = between(evt.distance.x, 0, width)

      if (evt.isFinal === true) {
        const
          el = this.$refs.content,
          opened = position >= Math.min(75, width)

        el.classList.remove('no-transition')

        if (opened === true) {
          this.show()
        }
        else {
          this.layout.__animate()
          this.__applyBackdrop(0)
          this.__applyPosition(this.stateDirection * width)
          el.classList.remove('q-drawer--delimiter')
          el.classList.add('q-layout--prevent-focus')
          this.__setBackdropVisible(false)
        }

        return
      }

      this.__applyPosition(
        (this.$q.lang.rtl === true ? this.rightSide !== true : this.rightSide)
          ? Math.max(width - position, 0)
          : Math.min(0, position - width)
      )
      this.__applyBackdrop(
        between(position / width, 0, 1)
      )

      if (evt.isFirst === true) {
        const el = this.$refs.content
        el.classList.add('no-transition')
        el.classList.add('q-drawer--delimiter')
        el.classList.remove('q-layout--prevent-focus')
        this.__setBackdropVisible(true)
      }
    },

    __closeByTouch (evt) {
      if (this.showing !== true) {
        // some browsers might capture and trigger this
        // even if Drawer has just been closed (but animation is still pending)
        return
      }

      const
        width = this.size,
        dir = evt.direction === this.side,
        position = (this.$q.lang.rtl === true ? dir !== true : dir)
          ? between(evt.distance.x, 0, width)
          : 0

      if (evt.isFinal === true) {
        const opened = Math.abs(position) < Math.min(75, width)
        this.$refs.content.classList.remove('no-transition')

        if (opened === true) {
          this.layout.__animate()
          this.__applyBackdrop(1)
          this.__applyPosition(0)
        }
        else {
          this.hide()
        }

        return
      }

      this.__applyPosition(this.stateDirection * position)
      this.__applyBackdrop(between(1 - position / width, 0, 1))

      if (evt.isFirst === true) {
        this.$refs.content.classList.add('no-transition')
      }
    },

    __show (evt, noEvent) {
      this.__addHistory()

      this.__setBackdropVisible(true)
      evt !== false && this.layout.__animate()
      this.__applyPosition(0)

      if (this.belowBreakpoint === true) {
        const otherSide = this.layout.instances[this.otherSide]
        if (otherSide !== void 0 && otherSide.belowBreakpoint === true) {
          otherSide.hide(false)
        }

        this.__applyBackdrop(1)
        this.layout.container !== true && this.__preventScroll(true)
      }
      else {
        this.__applyBackdrop(0)
        evt !== false && this.__setScrollable(false)
      }

      this.__setTimeout(() => {
        evt !== false && this.__setScrollable(true)
        noEvent !== true && this.$emit('show', evt)
      }, duration)
    },

    __hide (evt, noEvent) {
      this.__removeHistory()

      evt !== false && this.layout.__animate()

      this.__applyBackdrop(0)
      this.__applyPosition(this.stateDirection * this.size)
      this.__setBackdropVisible(false)

      this.__cleanup()

      noEvent !== true && this.__setTimeout(() => {
        this.$emit('hide', evt)
      }, duration)
    },

    __cleanup () {
      this.__preventScroll(false)
      this.__setScrollable(true)
    },

    __update (prop, val) {
      if (this.layout[this.side][prop] !== val) {
        this.layout[this.side][prop] = val
      }
    },

    __updateLocal (prop, val) {
      if (this[prop] !== val) {
        this[prop] = val
      }
    },

    __updateSizeOnLayout (miniToOverlay, size) {
      this.__update('size', miniToOverlay === true ? this.miniWidth : size)
    }
  },

  created () {
    this.layout.instances[this.side] = this
    this.__updateSizeOnLayout(this.miniToOverlay, this.size)
    this.__update('space', this.onLayout)
    this.__update('offset', this.offset)

    if (
      this.showIfAbove === true &&
      this.modelValue !== true &&
      this.showing === true &&
      // TODO: Vue 3, uses ListenersMixin
      this.qListeners.input !== void 0
    ) {
      this.$emit('update:modelValue', true)
    }
  },

  mounted () {
    this.$emit('on-layout', this.onLayout)
    this.$emit('mini-state', this.isMini)

    this.lastDesktopState = this.showIfAbove === true

    const fn = () => {
      const action = this.showing === true ? 'show' : 'hide'
      this[`__${action}`](false, true)
    }

    if (this.layout.totalWidth !== 0) {
      // make sure that all computed properties
      // have been updated before calling __show/__hide()
      this.$nextTick(fn)
      return
    }

    this.$watch(() => this.layout.totalWidth, val => {
      this.__updateLocal('belowBreakpoint', (
        this.behavior === 'mobile' ||
        (this.behavior !== 'desktop' && val <= this.breakpoint)
      ))
    })

    this.$watch(() => this.layout.container, val => {
      this.showing === true && this.__preventScroll(val !== true)
    })

    this.$watch(() => this.layout.scrollbarWidth, val => {
      this.__applyPosition(this.showing === true ? 0 : void 0)
    })

    this.$watch(() => this.$q.lang.rtl, val => {
      this.__applyPosition()
    })

    // one time watcher
    this.stopWatcher = this.$watch(() => this.layout.totalWidth, () => {
      this.stopWatcher()
      this.stopWatcher = void 0

      if (this.showing === false && this.showIfAbove === true && this.belowBreakpoint === false) {
        this.show(false)
      }
      else {
        fn()
      }
    })
  },

  beforeUnmount () {
    this.stopWatcher !== void 0 && this.stopWatcher()
    clearTimeout(this.timerMini)

    this.showing === true && this.__cleanup()

    if (this.layout.instances[this.side] === this) {
      this.layout.instances[this.side] = void 0
      this.__update('size', 0)
      this.__update('offset', 0)
      this.__update('space', false)
    }
  },

  render () {
    const child = []

    if (this.belowBreakpoint === true) {
      this.noSwipeOpen !== true && child.push(
        withDirectives(
          h('div', {
            class: `q-drawer__opener fixed-${this.side}`,
            ...ariaHidden
          }),
          [ this.openDirective ]
        )
      )

      child.push(
        withDirectives(
          h('div', {
            ref: 'backdrop',
            class: ['fullscreen q-drawer__backdrop', this.backdropClass],
            ...ariaHidden,
            style: this.lastBackdropBg !== void 0
              ? { backgroundColor: this.lastBackdropBg }
              : null,
            ...cache(this, 'bkdrop', { onClick: this.hide })
          }),
          (this.showing === false || this.noSwipeBackdrop === true) ? [] : [this.backdropCloseDirective]
        )
      )
    }

    const content = [
      h('div', {
        class: ['q-drawer__content fit', (this.layout.container === true ? 'overflow-auto' : 'scroll'), this.contentClass],
        style: this.contentStyle
      }, this.isMini === true && this.$slots.mini !== void 0
        ? this.$slots.mini()
        : slot(this, 'default')
      )
    ]

    if (this.elevated === true && this.showing === true) {
      content.push(
        h('div', {
          class: 'q-layout__shadow absolute-full overflow-hidden no-pointer-events'
        })
      )
    }

    child.push(
      withDirectives(
        h('aside', {
          ref: 'content',
          class: [`q-drawer`, this.classes],
          style: this.style,
          ...this.eventListeners
        }, content),
        (this.belowBreakpoint === true && this.noSwipeClose !== true) ? [this.contentCloseDirective] : []
      )
    )

    return h('div', { class: 'q-drawer-container' }, child)
  }
})

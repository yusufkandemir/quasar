import { h, defineComponent, withDirectives } from 'vue'

import QIcon from '../icon/QIcon.js'
import QSpinner from '../spinner/QSpinner.js'
import TouchPan from '../../directives/TouchPan.js'

import ListenersMixin from '../../mixins/listeners.js'

import { getScrollTarget, getScrollPosition } from '../../utils/scroll.js'
import { between } from '../../utils/format.js'
import { prevent } from '../../utils/event.js'
import { slot } from '../../utils/slot.js'

const PULLER_HEIGHT = 40
const OFFSET_TOP = 20

export default defineComponent({
  name: 'QPullToRefresh',

  mixins: [ ListenersMixin ],

  props: {
    color: String,
    bgColor: String,
    icon: String,
    noMouse: Boolean,
    disable: Boolean,

    scrollTarget: {
      default: void 0
    }
  },

  emits: ['refresh'],

  data () {
    return {
      state: 'pull',
      pullRatio: 0,
      pulling: false,
      pullPosition: -PULLER_HEIGHT,
      animating: false,
      positionCSS: {}
    }
  },

  computed: {
    style () {
      return {
        opacity: this.pullRatio,
        transform: `translateY(${this.pullPosition}px) rotate(${this.pullRatio * 360}deg)`
      }
    },

    classes () {
      return 'q-pull-to-refresh__puller row flex-center' +
        (this.animating === true ? ' q-pull-to-refresh__puller--animating' : '') +
        (this.bgColor !== void 0 ? ` bg-${this.bgColor}` : '')
    },

    directives () {
      const directives = []

      if (this.disable !== true) {
        directives.push([
          TouchPan,
          this.__pull,
          '',
          {
            down: true,
            mightPrevent: true,
            mouse: this.noMouse !== true
          }
        ])
      }

      return directives
    },

    contentClass () {
      return `q-pull-to-refresh__content${this.pulling === true ? ' no-pointer-events' : ''}`
    }
  },

  watch: {
    scrollTarget () {
      this.updateScrollTarget()
    }
  },

  methods: {
    trigger () {
      this.$emit('refresh', () => {
        this.__animateTo({ pos: -PULLER_HEIGHT, ratio: 0 }, () => {
          this.state = 'pull'
        })
      })
    },

    updateScrollTarget () {
      this.__scrollTarget = getScrollTarget(this.$el, this.scrollTarget)
    },

    __pull (event) {
      if (event.isFinal === true) {
        if (this.pulling === true) {
          this.pulling = false

          if (this.state === 'pulled') {
            this.state = 'refreshing'
            this.__animateTo({ pos: OFFSET_TOP })
            this.trigger()
          }
          else if (this.state === 'pull') {
            this.__animateTo({ pos: -PULLER_HEIGHT, ratio: 0 })
          }
        }

        return
      }

      if (this.animating === true || this.state === 'refreshing') {
        return false
      }

      if (event.isFirst === true) {
        if (getScrollPosition(this.__scrollTarget) !== 0) {
          if (this.pulling === true) {
            this.pulling = false
            this.state = 'pull'
            this.__animateTo({ pos: -PULLER_HEIGHT, ratio: 0 })
          }

          return false
        }

        this.pulling = true

        const { top, left } = this.$el.getBoundingClientRect()
        this.positionCSS = {
          top: top + 'px',
          left: left + 'px',
          width: window.getComputedStyle(this.$el).getPropertyValue('width')
        }
      }

      prevent(event.evt)

      const distance = Math.min(140, Math.max(0, event.distance.y))
      this.pullPosition = distance - PULLER_HEIGHT
      this.pullRatio = between(distance / (OFFSET_TOP + PULLER_HEIGHT), 0, 1)

      const state = this.pullPosition > OFFSET_TOP ? 'pulled' : 'pull'

      if (this.state !== state) {
        this.state = state
      }
    },

    __animateTo ({ pos, ratio }, done) {
      this.animating = true
      this.pullPosition = pos

      if (ratio !== void 0) {
        this.pullRatio = ratio
      }

      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.animating = false
        done && done()
      }, 300)
    }
  },

  mounted () {
    this.updateScrollTarget()
  },

  beforeUnmount () {
    clearTimeout(this.timer)
  },

  render () {
    // TODO: Vue 3, when `this.directives` is not empty(`this.disable === true`) on the initial render, the directives cannot be undone even though `this.directives` is updated later;
    // If it is empty(`this.disable === true`) on the initial render, change in value of `this.disable` will result in different internal Vue errors
    return withDirectives(
      h('div', {
        class: 'q-pull-to-refresh'
        // TODO: Vue 3, uses ListenersMixin
        // on: { ...this.qListeners },
      }, [
        h('div', {
          class: this.contentClass
        }, slot(this, 'default')),

        h('div', {
          class: 'q-pull-to-refresh__puller-container fixed row flex-center no-pointer-events z-top',
          style: this.positionCSS
        }, [
          h('div', {
            style: this.style,
            class: this.classes
          }, [
            this.state !== 'refreshing'
              ? h(QIcon, {
                name: this.icon || this.$q.iconSet.pullToRefresh.icon,
                color: this.color,
                size: '32px'
              })
              : h(QSpinner, {
                size: '24px',
                color: this.color
              })
          ])
        ])
      ]),
      this.directives
    )
  }
})

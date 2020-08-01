import { h, defineComponent, withDirectives } from 'vue'

import QBtn from '../btn/QBtn.js'

import DarkMixin from '../../mixins/dark.js'
import { PanelParentMixin } from '../../mixins/panel.js'
import FullscreenMixin from '../../mixins/fullscreen.js'

import { isNumber } from '../../utils/is.js'
import { mergeSlot } from '../../utils/slot.js'
import cache from '../../utils/cache.js'

export default defineComponent({
  name: 'QCarousel',

  mixins: [ DarkMixin, PanelParentMixin, FullscreenMixin ],

  props: {
    height: String,
    padding: Boolean,

    controlType: {
      type: String,
      validator: v => [ 'regular', 'flat', 'outline', 'push', 'unelevated' ].includes(v),
      default: 'flat'
    },
    controlColor: String,
    controlTextColor: String,

    autoplay: [Number, Boolean],

    arrows: Boolean,
    prevIcon: String,
    nextIcon: String,

    navigation: Boolean,
    navigationPosition: {
      type: String,
      validator: v => ['top', 'right', 'bottom', 'left'].includes(v)
    },
    navigationIcon: String,

    thumbnails: Boolean
  },

  computed: {
    style () {
      if (this.inFullscreen !== true && this.height !== void 0) {
        return {
          height: this.height
        }
      }
    },

    direction () {
      return this.vertical === true ? 'vertical' : 'horizontal'
    },

    classes () {
      return `q-carousel q-panel-parent q-carousel--with${this.padding === true ? '' : 'out'}-padding` +
        (this.inFullscreen === true ? ' fullscreen' : '') +
        (this.isDark === true ? ' q-carousel--dark q-dark' : '') +
        (this.arrows === true ? ` q-carousel--arrows-${this.direction}` : '') +
        (this.navigation === true ? ` q-carousel--navigation-${this.navigationPositionComputed}` : '')
    },

    arrowIcons () {
      const ico = [
        this.prevIcon || this.$q.iconSet.carousel[this.vertical === true ? 'up' : 'left'],
        this.nextIcon || this.$q.iconSet.carousel[this.vertical === true ? 'down' : 'right']
      ]

      return this.vertical === false && this.$q.lang.rtl === true
        ? ico.reverse()
        : ico
    },

    navIcon () {
      return this.navigationIcon || this.$q.iconSet.carousel.navigationIcon
    },

    navigationPositionComputed () {
      return this.navigationPosition || (this.vertical === true ? 'right' : 'bottom')
    },

    controlProps () {
      return {
        color: this.controlColor,
        textColor: this.controlTextColor,
        round: true,
        [ this.controlType ]: true,
        dense: true
      }
    },

    transitionPrevComputed () {
      return this.transitionPrev || `fade`
    },

    transitionNextComputed () {
      return this.transitionNext || `fade`
    }
  },

  watch: {
    modelValue () {
      if (this.autoplay) {
        clearInterval(this.timer)
        this.__startTimer()
      }
    },

    autoplay (val) {
      if (val) {
        this.__startTimer()
      }
      else {
        clearInterval(this.timer)
      }
    }
  },

  methods: {
    __startTimer () {
      this.timer = setTimeout(
        this.next,
        isNumber(this.autoplay) ? this.autoplay : 5000
      )
    },

    __getNavigationContainer (type, mapping) {
      return h('div', {
        class: 'q-carousel__control q-carousel__navigation no-wrap absolute flex' +
          ` q-carousel__navigation--${type} q-carousel__navigation--${this.navigationPositionComputed}` +
          (this.controlColor !== void 0 ? ` text-${this.controlColor}` : '')
      }, [
        h('div', {
          class: 'q-carousel__navigation-inner flex no-wrap justify-center'
        }, this.__getAvailablePanels().map(mapping))
      ])
    },

    __getContent () {
      const node = []

      if (this.navigation === true) {
        node.push(this.__getNavigationContainer('buttons', panel => {
          const name = panel.props.name

          return h(QBtn, {
            key: name,
            class: `q-carousel__navigation-icon q-carousel__navigation-icon--${name === this.modelValue ? '' : 'in'}active`,
            icon: this.navIcon,
            size: 'sm',
            ...this.controlProps,
            ...cache(this, 'nav#' + name, { onClick: () => { this.goTo(name) } })
          })
        }))
      }
      else if (this.thumbnails === true) {
        const color = this.controlColor !== void 0
          ? ` text-${this.controlColor}`
          : ''

        node.push(this.__getNavigationContainer('thumbnails', panel => {
          const slide = panel.props

          return h('img', {
            key: 'tmb#' + slide.name,
            class: `q-carousel__thumbnail q-carousel__thumbnail--${slide.name === this.modelValue ? '' : 'in'}active` + color,
            // TODO: Vue 3, prop keys are not normalized (it can be either 'imgSrc' or 'img-src')
            // see: https://github.com/vuejs/vue-next/issues/1755
            src: slide.imgSrc || slide['img-src'],
            ...cache(this, 'tmb#' + slide.name, { onClick: () => { this.goTo(slide.name) } })
          })
        }))
      }

      if (this.arrows === true) {
        node.push(
          h('div', {
            class: `q-carousel__control q-carousel__arrow q-carousel__prev-arrow q-carousel__prev-arrow--${this.direction} absolute flex flex-center`
          }, [
            h(QBtn, {
              icon: this.arrowIcons[0],
              ...this.controlProps,
              ...cache(this, 'prev', { onClick: this.previous })
            })
          ]),
          h('div', {
            class: `q-carousel__control q-carousel__arrow q-carousel__next-arrow q-carousel__next-arrow--${this.direction} absolute flex flex-center`
          }, [
            h(QBtn, {
              icon: this.arrowIcons[1],
              ...this.controlProps,
              ...cache(this, 'next', { onClick: this.next })
            })
          ])
        )
      }

      return mergeSlot(node, this, 'control')
    },

    __renderPanels () {
      return h('div', {
        style: this.style,
        class: this.classes
        // TODO: Vue 3, usese ListenersMixin
        // on: { ...this.qListeners }
      }, [
        withDirectives(
          h('div', {
            class: 'q-carousel__slides-container'
          }, this.__getPanelContent()),
          this.panelDirectives
        )
      ].concat(this.__getContent()))
    }
  },

  mounted () {
    this.autoplay && this.__startTimer()
  },

  beforeUnmount () {
    clearInterval(this.timer)
  }
})

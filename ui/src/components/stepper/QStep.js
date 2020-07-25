import { h, defineComponent, KeepAlive } from 'vue'

import QSlideTransition from '../slide-transition/QSlideTransition.js'
import StepHeader from './StepHeader.js'

import { PanelChildMixin } from '../../mixins/panel.js'

import { slot } from '../../utils/slot.js'

const StepWrapper = defineComponent({
  name: 'QStepWrapper',

  render () {
    return h('div', {
      class: 'q-stepper__step-content'
    }, [
      h('div', {
        class: 'q-stepper__step-inner'
      }, slot(this, 'default'))
    ])
  }
})

export default defineComponent({
  name: 'QStep',

  inject: {
    stepper: {
      from: 'stepper',
      default () {
        console.error('QStep needs to be child of QStepper')
      }
    }
  },

  mixins: [ PanelChildMixin ],

  props: {
    icon: String,
    color: String,
    title: {
      type: String,
      required: true
    },
    caption: String,
    prefix: [ String, Number ],

    doneIcon: String,
    doneColor: String,
    activeIcon: String,
    activeColor: String,
    errorIcon: String,
    errorColor: String,

    headerNav: {
      type: Boolean,
      default: true
    },
    done: Boolean,
    error: Boolean
  },

  computed: {
    isActive () {
      return this.stepper.modelValue === this.name
    }
  },

  watch: {
    isActive (active) {
      if (
        active === true &&
        this.stepper.vertical === true
      ) {
        this.$nextTick(() => {
          if (this.$el !== void 0) {
            this.$el.scrollTop = 0
          }
        })
      }
    }
  },

  render () {
    const vertical = this.stepper.vertical
    const content = vertical === true && this.stepper.keepAlive === true
      ? h(
        KeepAlive,
        this.isActive === true
          ? [ h(StepWrapper, { key: this.name }, slot(this, 'default')) ]
          : void 0
      )
      : (
        vertical !== true || this.isActive === true
          ? StepWrapper.render.call(this)
          : void 0
      )

    return h(
      'div',
      {
        class: 'q-stepper__step'
        // TODO: Vue 3, uses ListenersMixin
        // on: { ...this.qListeners }
      },
      vertical === true
        ? [
          h(StepHeader, {
            stepper: this.stepper,
            step: this
          }),

          this.stepper.animated === true
            ? h(QSlideTransition, [ content ])
            : content
        ]
        : [ content ]
    )
  }
})

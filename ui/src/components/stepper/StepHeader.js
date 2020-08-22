import { defineComponent, h, withDirectives } from 'vue'

import QIcon from '../icon/QIcon.js'
import Ripple from '../../directives/Ripple.js'

import AttrsMixin from '../../mixins/attrs.js'

import cache from '../../utils/cache.js'

export default defineComponent({
  name: 'StepHeader',

  mixins: [AttrsMixin],

  props: {
    stepper: {},
    step: {}
  },

  computed: {
    isActive () {
      return this.stepper.modelValue === this.step.name
    },

    isDisable () {
      const opt = this.step.disable
      return opt === true || opt === ''
    },

    isError () {
      const opt = this.step.error
      return opt === true || opt === ''
    },

    isDone () {
      const opt = this.step.done
      return this.isDisable === false && (opt === true || opt === '')
    },

    headerNav () {
      const
        opt = this.step.headerNav,
        nav = opt === true || opt === '' || opt === void 0

      return this.isDisable === false &&
        this.stepper.headerNav &&
        nav
    },

    hasPrefix () {
      return this.step.prefix &&
        this.isActive === false &&
        this.isError === false &&
        this.isDone === false
    },

    icon () {
      if (this.isActive === true) {
        return this.step.activeIcon || this.stepper.activeIcon || this.$q.iconSet.stepper.active
      }
      if (this.isError === true) {
        return this.step.errorIcon || this.stepper.errorIcon || this.$q.iconSet.stepper.error
      }
      if (this.isDisable === false && this.isDone === true) {
        return this.step.doneIcon || this.stepper.doneIcon || this.$q.iconSet.stepper.done
      }

      return this.step.icon || this.stepper.inactiveIcon
    },

    color () {
      const errorColor = this.isError === true
        ? this.step.errorColor || this.stepper.errorColor
        : void 0

      if (this.isActive === true) {
        const color = this.step.activeColor || this.stepper.activeColor || this.step.color
        return color !== void 0
          ? color
          : errorColor
      }
      if (errorColor !== void 0) {
        return errorColor
      }
      if (this.isDisable === false && this.isDone === true) {
        return this.step.doneColor || this.stepper.doneColor || this.step.color || this.stepper.inactiveColor
      }

      return this.step.color || this.stepper.inactiveColor
    },

    classes () {
      return `q-stepper__tab col-grow flex items-center no-wrap relative-position` +
        (this.color !== void 0 ? ` text-${this.color}` : '') +
        (this.isError === true ? ' q-stepper__tab--error' : '') +
        (this.isActive === true ? ' q-stepper__tab--active' : '') +
        (this.isDone === true ? ' q-stepper__tab--done' : '') +
        (this.headerNav === true ? ' q-stepper__tab--navigation q-focusable q-hoverable' : '') +
        (this.isDisable === true ? ' q-stepper__tab--disabled' : '')
    }
  },

  methods: {
    activate () {
      this.$refs.blurTarget !== void 0 && this.$refs.blurTarget.focus()
      this.isActive === false && this.stepper.goTo(this.step.name)
    },

    keyup (e) {
      if (e.keyCode === 13 && this.isActive === false) {
        this.stepper.goTo(this.step.name)
      }
    }
  },

  render () {
    const data = { class: this.classes }
    const directives = []

    if (this.stepper.headerNav === true) {
      directives.push([Ripple, this.headerNav])
    }

    this.headerNav === true && Object.assign(data, {
      ...cache(this, 'headnavon', {
        onClick: this.activate,
        onKeyup: this.keyup
      }),
      ...(
        this.isDisable === true
          ? { tabindex: -1, 'aria-disabled': 'true' }
          : { tabindex: this.qAttrs.tabindex || 0 }
      )
    })

    const child = [
      h('div', { class: 'q-focus-helper', tabindex: -1, ref: 'blurTarget' }),

      h('div', { class: 'q-stepper__dot row flex-center q-stepper__line relative-position' }, [
        h('span', { class: 'row flex-center' }, [
          this.hasPrefix === true
            ? this.step.prefix
            : h(QIcon, { name: this.icon })
        ])
      ])
    ]

    if (this.step.title !== void 0 && this.step.title !== null) {
      const content = [
        h('div', { class: 'q-stepper__title' }, [this.step.title])
      ]

      if (this.step.caption !== void 0 && this.step.caption !== null) {
        content.push(
          h('div', { class: 'q-stepper__caption' }, [this.step.caption])
        )
      }

      child.push(
        h('div', {
          class: 'q-stepper__label q-stepper__line relative-position'
        }, content)
      )
    }

    return withDirectives(
      h('div', data, child),
      directives
    )
  }
})

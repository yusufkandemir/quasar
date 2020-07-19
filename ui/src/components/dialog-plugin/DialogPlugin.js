import { defineComponent, h } from 'vue'

import QDialog from '../dialog/QDialog.js'
import QBtn from '../btn/QBtn.js'

import clone from '../../utils/clone.js'
import { isKeyCode } from '../../utils/key-composition.js'

import QCard from '../card/QCard.js'
import QCardSection from '../card/QCardSection.js'
import QCardActions from '../card/QCardActions.js'
import QSeparator from '../separator/QSeparator.js'

import QInput from '../input/QInput.js'
import QOptionGroup from '../option-group/QOptionGroup.js'

import DarkMixin from '../../mixins/dark.js'
import AttrsMixin from '../../mixins/attrs.js'

import cache from '../../utils/cache.js'

export default defineComponent({
  name: 'DialogPlugin',

  mixins: [ DarkMixin, AttrsMixin ],

  inheritAttrs: false,

  props: {
    modelValue: Boolean,

    title: String,
    message: String,
    prompt: Object,
    options: Object,

    html: Boolean,

    ok: {
      type: [String, Object, Boolean],
      default: true
    },
    cancel: [String, Object, Boolean],
    focus: {
      type: String,
      default: 'ok',
      validator: v => ['ok', 'cancel', 'none'].includes(v)
    },

    stackButtons: Boolean,
    color: String,

    cardClass: [String, Array, Object],
    cardStyle: [String, Array, Object]
  },

  computed: {
    hasForm () {
      return this.prompt !== void 0 || this.options !== void 0
    },

    okLabel () {
      return Object(this.ok) === this.ok
        ? this.$q.lang.label.ok
        : (
          this.ok === true
            ? this.$q.lang.label.ok
            : this.ok
        )
    },

    cancelLabel () {
      return Object(this.cancel) === this.cancel
        ? this.$q.lang.label.cancel
        : (
          this.cancel === true
            ? this.$q.lang.label.cancel
            : this.cancel
        )
    },

    vmColor () {
      return this.color || (this.isDark === true ? 'amber' : 'primary')
    },

    okDisabled () {
      if (this.prompt !== void 0) {
        return this.prompt.isValid !== void 0 &&
          this.prompt.isValid(this.prompt.model) !== true
      }
      if (this.options !== void 0) {
        return this.options.isValid !== void 0 &&
          this.options.isValid(this.options.model) !== true
      }
    },

    okProps () {
      return {
        color: this.vmColor,
        label: this.okLabel,
        ripple: false,
        ...(Object(this.ok) === this.ok ? this.ok : { flat: true }),
        disable: this.okDisabled
      }
    },

    cancelProps () {
      return {
        color: this.vmColor,
        label: this.cancelLabel,
        ripple: false,
        ...(Object(this.cancel) === this.cancel ? this.cancel : { flat: true })
      }
    }
  },

  methods: {
    show () {
      this.$refs.dialog.show()
    },

    hide () {
      this.$refs.dialog.hide()
    },

    getPrompt () {
      return [
        h(QInput, {
          // Begin props
          value: this.prompt.model,
          type: this.prompt.type,

          label: this.prompt.label,
          stackLabel: this.prompt.stackLabel,

          outlined: this.prompt.outlined,
          filled: this.prompt.filled,
          standout: this.prompt.standout,
          rounded: this.prompt.rounded,
          square: this.prompt.square,

          counter: this.prompt.counter,
          maxlength: this.prompt.maxlength,
          prefix: this.prompt.prefix,
          suffix: this.prompt.suffix,

          color: this.vmColor,
          dense: true,
          autofocus: true,
          dark: this.isDark,
          // End props

          ...this.prompt.attrs,
          ...cache(this, 'prompt', {
            onInput: v => { this.prompt.model = v },
            onKeyup: evt => {
              // if ENTER key
              if (
                this.okDisabled !== true &&
                this.prompt.type !== 'textarea' &&
                isKeyCode(evt, 13) === true
              ) {
                this.onOk()
              }
            }
          })
        })
      ]
    },

    getOptions () {
      return [
        h(QOptionGroup, {
          // Props
          value: this.options.model,
          type: this.options.type,
          color: this.vmColor,
          inline: this.options.inline,
          options: this.options.items,
          dark: this.isDark,

          ...cache(this, 'opts', {
            onInput: v => { this.options.model = v }
          })
        })
      ]
    },

    getButtons () {
      const child = []

      this.cancel && child.push(h(QBtn, {
        ...this.cancelProps,
        'data-autofocus': this.focus === 'cancel' && this.hasForm !== true,
        ...cache(this, 'cancel', { onClick: this.onCancel })
      }))

      this.ok && child.push(h(QBtn, {
        ...this.okProps,
        'data-autofocus': this.focus === 'ok' && this.hasForm !== true,
        ...cache(this, 'ok', { onClick: this.onOk })
      }))

      if (child.length > 0) {
        return h(QCardActions, {
          class: this.stackButtons === true ? 'items-end' : null,
          vertical: this.stackButtons,
          align: 'right'
        }, child)
      }
    },

    onOk () {
      this.$emit('ok', clone(this.getData()))
      this.hide()
    },

    onCancel () {
      this.hide()
    },

    getData () {
      return this.prompt !== void 0
        ? this.prompt.model
        : (this.options !== void 0 ? this.options.model : void 0)
    },

    getSection (classes, text) {
      return this.html === true
        ? h(QCardSection, {
          class: classes,
          innerHTML: text
        })
        : h(QCardSection, { class: classes }, [ text ])
    }
  },

  render () {
    const child = []

    this.title && child.push(
      this.getSection('q-dialog__title', this.title)
    )

    this.message && child.push(
      this.getSection('q-dialog__message', this.message)
    )

    if (this.prompt !== void 0) {
      child.push(
        h(
          QCardSection,
          { class: 'scroll q-dialog-plugin__form' },
          this.getPrompt()
        )
      )
    }
    else if (this.options !== void 0) {
      child.push(
        h(QSeparator, { dark: this.isDark }),
        h(
          QCardSection,
          { class: 'scroll q-dialog-plugin__form' },
          this.getOptions()
        ),
        h(QSeparator, { dark: this.isDark })
      )
    }

    if (this.ok || this.cancel) {
      child.push(this.getButtons())
    }

    return h(QDialog, {
      ref: 'dialog',

      ...this.qAttrs,
      modelValue: this.modelValue,

      ...cache(this, 'hide', {
        onHide: () => {
          this.$emit('hide')
        }
      })
    }, [
      h(QCard, {
        class: 'q-dialog-plugin' +
          (this.isDark === true ? ' q-dialog-plugin--dark q-dark' : ''),
        style: this.cardStyle,
        class: this.cardClass,
        dark: this.isDark
      }, child)
    ])
  }
})

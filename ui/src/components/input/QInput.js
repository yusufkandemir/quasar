import { defineComponent, h } from 'vue'

import QField from '../field/QField.js'

import { FormFieldMixin } from '../../mixins/form.js'
import { FileValueMixin } from '../../mixins/file.js'
import MaskMixin from '../../mixins/mask.js'
import CompositionMixin from '../../mixins/composition.js'
import ListenersMixin from '../../mixins/listeners.js'

import { stop } from '../../utils/event.js'

export default defineComponent({
  name: 'QInput',

  mixins: [
    QField,
    MaskMixin,
    CompositionMixin,
    FormFieldMixin,
    FileValueMixin,
    ListenersMixin
  ],

  props: {
    modelValue: { required: false },

    shadowText: String,

    type: {
      type: String,
      default: 'text'
    },

    debounce: [String, Number],

    autogrow: Boolean, // makes a textarea

    inputClass: [Array, String, Object],
    inputStyle: [Array, String, Object]
  },

  emits: ['update:modelValue', 'change', 'paste'],

  watch: {
    modelValue (v) {
      if (this.hasMask === true) {
        if (this.stopValueWatcher === true) {
          this.stopValueWatcher = false
          return
        }

        this.__updateMaskValue(v)
      }
      else if (this.innerValue !== v) {
        this.innerValue = v

        if (
          this.type === 'number' &&
          this.hasOwnProperty('tempValue') === true
        ) {
          if (this.typedNumber === true) {
            this.typedNumber = false
          }
          else {
            delete this.tempValue
          }
        }
      }

      // textarea only
      this.autogrow === true && this.$nextTick(this.__adjustHeight)
    },

    autogrow (autogrow) {
      // textarea only
      if (autogrow === true) {
        this.$nextTick(this.__adjustHeight)
      }
      // if it has a number of rows set respect it
      else if (this.qAttrs.rows > 0 && this.$refs.input !== void 0) {
        const inp = this.$refs.input
        inp.style.height = 'auto'
      }
    },

    dense () {
      this.autogrow === true && this.$nextTick(this.__adjustHeight)
    }
  },

  data () {
    return { innerValue: this.__getInitialMaskedValue() }
  },

  computed: {
    isTextarea () {
      return this.type === 'textarea' || this.autogrow === true
    },

    fieldClass () {
      return `q-${this.isTextarea === true ? 'textarea' : 'input'}` +
        (this.autogrow === true ? ' q-textarea--autogrow' : '')
    },

    hasShadow () {
      return this.type !== 'file' &&
        typeof this.shadowText === 'string' &&
        this.shadowText.length > 0
    },

    onEvents () {
      const listeners = {
        // TODO: Vue 3, uses ListenersMixin
        // ...this.qListeners,
        'onUpdate:modelValue': this.__onInput,
        onPaste: this.__onPaste,
        // Safari < 10.2 & UIWebView doesn't fire compositionend when
        // switching focus before confirming composition choice
        // this also fixes the issue where some browsers e.g. iOS Chrome
        // fires "change" instead of "input" on autocomplete.
        onChange: this.__onChange,
        onBlur: this.__onFinishEditing,
        onFocus: stop
      }

      listeners.onCompositionstart = listeners.onCompositionupdate = listeners.onCompositionend = this.__onComposition

      if (this.hasMask === true) {
        listeners.onKeydown = this.__onMaskedKeydown
      }

      if (this.autogrow === true) {
        listeners.onAnimationend = this.__adjustHeight
      }

      return listeners
    },

    inputAttrs () {
      const attrs = {
        tabindex: 0,
        'data-autofocus': this.autofocus,
        rows: this.type === 'textarea' ? 6 : void 0,
        'aria-label': this.label,
        name: this.nameProp,
        ...this.qAttrs,
        id: this.targetUid,
        type: this.type,
        maxlength: this.maxlength,
        disabled: this.disable === true,
        readonly: this.readonly === true
      }

      if (this.autogrow === true) {
        attrs.rows = 1
      }

      return attrs
    }
  },

  methods: {
    focus () {
      const el = document.activeElement
      if (
        this.$refs.input !== void 0 &&
        this.$refs.input !== el &&
        // IE can have null document.activeElement
        (el === null || el.id !== this.targetUid)
      ) {
        this.$refs.input.focus()
      }
    },

    select () {
      this.$refs.input !== void 0 && this.$refs.input.select()
    },

    __onPaste (e) {
      if (this.hasMask === true && this.reverseFillMask !== true) {
        const inp = e.target
        this.__moveCursorForPaste(inp, inp.selectionStart, inp.selectionEnd)
      }

      this.$emit('paste', e)
    },

    __onInput (e) {
      if (e && e.target && e.target.composing === true) {
        return
      }

      if (this.type === 'file') {
        this.$emit('update:modelValue', e.target.files)
        return
      }

      const val = e.target.value

      if (this.hasMask === true) {
        this.__updateMaskValue(val, false, e.inputType)
      }
      else {
        this.__emitValue(val)
      }

      // we need to trigger it immediately too,
      // to avoid "flickering"
      this.autogrow === true && this.__adjustHeight()
    },

    __emitValue (val, stopWatcher) {
      this.emitValueFn = () => {
        if (
          this.type !== 'number' &&
          this.hasOwnProperty('tempValue') === true
        ) {
          delete this.tempValue
        }

        if (this.modelValue !== val) {
          stopWatcher === true && (this.stopValueWatcher = true)
          this.$emit('update:modelValue', val)
        }

        this.emitValueFn = void 0
      }

      if (this.type === 'number') {
        this.typedNumber = true
        this.tempValue = val
      }

      if (this.debounce !== void 0) {
        clearTimeout(this.emitTimer)
        this.tempValue = val
        this.emitTimer = setTimeout(this.emitValueFn, this.debounce)
      }
      else {
        this.emitValueFn()
      }
    },

    // textarea only
    __adjustHeight () {
      const inp = this.$refs.input
      if (inp !== void 0) {
        const parentStyle = inp.parentNode.style

        // reset height of textarea to a small size to detect the real height
        // but keep the total control size the same
        parentStyle.marginBottom = (inp.scrollHeight - 1) + 'px'
        inp.style.height = '1px'

        inp.style.height = inp.scrollHeight + 'px'
        parentStyle.marginBottom = ''
      }
    },

    __onChange (e) {
      this.__onComposition(e)

      clearTimeout(this.emitTimer)
      this.emitValueFn !== void 0 && this.emitValueFn()

      this.$emit('change', e)
    },

    __onFinishEditing (e) {
      e !== void 0 && stop(e)

      clearTimeout(this.emitTimer)
      this.emitValueFn !== void 0 && this.emitValueFn()

      this.typedNumber = false
      this.stopValueWatcher = false
      delete this.tempValue

      this.type !== 'file' && this.$nextTick(() => {
        if (this.$refs.input !== void 0) {
          this.$refs.input.value = this.innerValue !== void 0 ? this.innerValue : ''
        }
      })
    },

    __getCurValue () {
      return this.hasOwnProperty('tempValue') === true
        ? this.tempValue
        : (this.innerValue !== void 0 ? this.innerValue : '')
    },

    __getShadowControl () {
      return h('div', {
        class: 'q-field__native q-field__shadow absolute-full no-pointer-events'
      }, [
        h('span', { class: 'invisible' }, this.__getCurValue()),
        h('span', this.shadowText)
      ])
    },

    __getControl () {
      return h(this.isTextarea === true ? 'textarea' : 'input', {
        ref: 'input',
        class: ['q-field__native q-placeholder', this.inputClass],
        style: this.inputStyle,
        ...this.inputAttrs,
        ...this.onEvents,
        ...(
          this.type !== 'file'
            ? { modelValue: this.__getCurValue() }
            : this.formDomProps
        )
      })
    }
  },

  // TODO: Vue 3, render function from the mixin somehow can't make it into here
  // see: https://github.com/vuejs/vue-next/issues/1630

  mounted () {
    // textarea only
    this.autogrow === true && this.__adjustHeight()
  },

  beforeUnmount () {
    this.__onFinishEditing()
  }
})

import { defineComponent, h } from 'vue'

import QMenu from '../menu/QMenu.js'
import QBtn from '../btn/QBtn.js'

import AttrsMixin from '../../mixins/attrs.js'

import clone from '../../utils/clone.js'
import { isDeepEqual } from '../../utils/is.js'
import { slot } from '../../utils/slot.js'
import { isKeyCode } from '../../utils/key-composition.js'
import cache from '../../utils/cache.js'

export default defineComponent({
  name: 'QPopupEdit',

  mixins: [ AttrsMixin ],

  props: {
    modelValue: {
      required: true
    },
    title: String,
    buttons: Boolean,
    labelSet: String,
    labelCancel: String,

    color: {
      type: String,
      default: 'primary'
    },
    validate: {
      type: Function,
      default: () => true
    },

    autoSave: Boolean,

    /* menu props overrides */
    cover: {
      type: Boolean,
      default: true
    },
    contentClass: String,
    /* end of menu props */

    disable: Boolean
  },

  emits: ['update:modelValue', 'save', 'cancel', 'show', 'hide', 'before-show', 'before-hide'],

  data () {
    return {
      initialValue: ''
    }
  },

  computed: {
    classes () {
      return 'q-popup-edit' +
        (this.contentClass !== void 0 ? ` ${this.contentClass}` : '')
    },

    defaultSlotScope () {
      return {
        initialValue: this.initialValue,
        modelValue: this.modelValue,
        emitValue: this.__emitValue,
        validate: this.validate,
        set: this.set,
        cancel: this.cancel
      }
    },

    menuProps () {
      return {
        ...this.qAttrs,
        cover: this.cover,
        contentClass: this.classes
      }
    }
  },

  methods: {
    set () {
      if (this.__hasChanged() === true) {
        if (this.validate(this.modelValue) === false) {
          return
        }
        this.$emit('save', this.modelValue, this.initialValue)
      }
      this.__close()
    },

    cancel () {
      if (this.__hasChanged() === true) {
        this.$emit('update:modelValue', this.initialValue)
        this.$emit('cancel', this.modelValue, this.initialValue)
      }
      this.__close()
    },

    show (e) {
      this.$refs.menu !== void 0 && this.$refs.menu.show(e)
    },

    hide (e) {
      this.$refs.menu !== void 0 && this.$refs.menu.hide(e)
    },

    __hasChanged () {
      return isDeepEqual(this.modelValue, this.initialValue) === false
    },

    __emitValue (val) {
      if (this.disable !== true) {
        this.$emit('update:modelValue', val)
      }
    },

    __close () {
      this.validated = true
      this.$refs.menu.showing === true && this.$refs.menu.hide()
    },

    __reposition () {
      this.$nextTick(() => {
        this.$refs.menu.updatePosition()
      })
    },

    __getContent () {
      const
        title = slot(this, 'title', this.title),
        child = this.$slots.default === void 0
          ? []
          : this.$slots.default(this.defaultSlotScope).slice()

      title && child.unshift(
        h('div', { class: 'q-dialog__title q-mt-sm q-mb-sm' }, [ title ])
      )

      this.buttons === true && child.push(
        h('div', { class: 'q-popup-edit__buttons row justify-center no-wrap' }, [
          h(QBtn, {
            flat: true,
            color: this.color,
            label: this.labelCancel || this.$q.lang.label.cancel,
            ...cache(this, 'cancel', { onClick: this.cancel })
          }),
          h(QBtn, {
            flat: true,
            color: this.color,
            label: this.labelSet || this.$q.lang.label.set,
            ...cache(this, 'ok', { onClick: this.set })
          })
        ])
      )

      return child
    }
  },

  render () {
    if (this.disable === true) { return }

    return h(QMenu, {
      ref: 'menu',
      ...this.menuProps,
      ...cache(this, 'menu', {
        'onBefore-show': () => {
          this.validated = false
          this.initialValue = clone(this.modelValue)
          this.watcher = this.$watch(() => this.modelValue, this.__reposition)
          this.$emit('before-show')
        },
        onShow: () => {
          this.$emit('show')
        },
        'onEscape-key': this.cancel,
        'onBefore-hide': () => {
          this.watcher()

          if (this.validated === false && this.__hasChanged() === true) {
            if (this.autoSave === true && this.validate(this.modelValue) === true) {
              this.$emit('save', this.modelValue, this.initialValue)
            }
            else {
              this.$emit('cancel', this.modelValue, this.initialValue)
              this.$emit('update:modelValue', this.initialValue)
            }
          }

          this.$emit('before-hide')
        },
        onHide: () => {
          this.$emit('hide')
        },
        onKeyup: e => {
          isKeyCode(e, 13) === true && this.set()
        }
      })
    }, this.__getContent())
  }
})

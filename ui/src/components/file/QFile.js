import { defineComponent, h } from 'vue'

import QField from '../field/QField.js'
import QChip from '../chip/QChip.js'

import { FormFieldMixin } from '../../mixins/form.js'
import FileMixin, { FileValueMixin } from '../../mixins/file.js'

import { isSSR } from '../../plugins/Platform'
import { humanStorageSize } from '../../utils/format.js'
import cache from '../../utils/cache.js'

export default defineComponent({
  name: 'QFile',

  mixins: [ QField, FileMixin, FormFieldMixin, FileValueMixin ],

  props: {
    /* SSR does not know about File & FileList */
    modelValue: isSSR === true
      ? {}
      : [ File, FileList, Array ],

    append: Boolean,
    useChips: Boolean,
    displayValue: [ String, Number ],

    tabindex: {
      type: [ String, Number ],
      default: 0
    },

    counterLabel: Function,

    inputClass: [ Array, String, Object ],
    inputStyle: [ Array, String, Object ]
  },

  emits: ['update:modelValue'],

  data () {
    return {
      dnd: false
    }
  },

  computed: {
    innerValue () {
      return Object(this.modelValue) === this.modelValue
        ? ('length' in this.modelValue ? Array.from(this.modelValue) : [ this.modelValue ])
        : []
    },

    selectedString () {
      return this.innerValue
        .map(file => file.name)
        .join(', ')
    },

    totalSize () {
      return humanStorageSize(
        this.innerValue.reduce((acc, file) => acc + file.size, 0)
      )
    },

    counterProps () {
      return {
        totalSize: this.totalSize,
        filesNumber: this.innerValue.length,
        maxFiles: this.maxFiles
      }
    },

    computedCounter () {
      if (this.counterLabel !== void 0) {
        return this.counterLabel(this.counterProps)
      }

      const max = this.maxFiles
      return `${this.innerValue.length}${max !== void 0 ? ' / ' + max : ''} (${this.totalSize})`
    },

    inputAttrs () {
      return {
        tabindex: -1,
        type: 'file',
        title: '', // try to remove default tooltip,
        accept: this.accept,
        capture: this.capture,
        name: this.nameProp,
        ...this.qAttrs,
        id: this.targetUid,
        disabled: this.editable !== true
      }
    },

    isAppending () {
      return this.multiple === true && this.append === true
    }
  },

  methods: {
    removeAtIndex (index) {
      const files = this.innerValue.slice()
      files.splice(index, 1)
      this.__emitValue(files)
    },

    removeFile (file) {
      const index = this.innerValue.findIndex(file)
      if (index > -1) {
        this.removeAtIndex(index)
      }
    },

    __emitValue (files) {
      this.$emit('update:modelValue', this.multiple === true ? files : files[0])
    },

    __onKeyup (e) {
      // only on ENTER
      e.keyCode === 13 && this.pickFiles(e)
    },

    __getFileInput () {
      return this.$refs.input
    },

    __addFiles (e, fileList) {
      const files = this.__processFiles(e, fileList, this.innerValue, this.isAppending)

      files !== void 0 && this.__emitValue(
        this.isAppending === true
          ? this.innerValue.concat(files)
          : files
      )
    },

    __getControl () {
      return h(
        'div',
        {
          ref: 'target',
          class: 'q-field__native row items-center cursor-pointer',
          tabindex: this.tabindex,
          ...(
            this.editable === true
              ? cache(this, 'native', {
                onDragover: this.__onDragOver,
                onKeyup: this.__onKeyup
              })
              : null
          )
        },
        [ this.__getInput() ].concat(this.__getSelection())
      )
    },

    __getControlChild () {
      return this.__getDnd('file')
    },

    __getSelection () {
      if (this.$slots.file !== void 0) {
        return this.innerValue.map((file, index) => this.$slots.file({ index, file, ref: this }))
      }

      if (this.$slots.selected !== void 0) {
        return this.$slots.selected({ files: this.innerValue, ref: this })
      }

      if (this.useChips === true) {
        return this.innerValue.map((file, i) => h(QChip, {
          key: 'file-' + i,
          removable: this.editable,
          dense: true,
          textColor: this.color,
          tabindex: this.tabindex,
          ...cache(this, 'rem#' + i, {
            onRemove: () => { this.removeAtIndex(i) }
          })
        }, [
          h('span', {
            class: 'ellipsis',
            textContent: file.name
          })
        ]))
      }

      return [
        h('div', {
          style: this.inputStyle,
          class: this.inputClass,
          textContent: this.displayValue !== void 0
            ? this.displayValue
            : this.selectedString
        })
      ]
    },

    __getInput () {
      return h('input', {
        ref: 'input',
        class: 'q-field__input fit absolute-full cursor-pointer',
        ...this.inputAttrs,
        ...this.formDomProps,
        multiple: this.multiple === true,
        ...cache(this, 'input', {
          onChange: this.__addFiles
        })
      })
    }
  },

  created () {
    this.fieldClass = 'q-file q-field--auto-height'

    // necessary for QField's clearable
    // and FileValueMixin
    this.type = 'file'
  },

  render: QField.render
})

import { defineComponent, h, withDirectives } from 'vue'

import { testPattern } from '../../utils/patterns.js'
import throttle from '../../utils/throttle.js'
import cache from '../../utils/cache.js'
import { stop } from '../../utils/event.js'
import { hexToRgb, rgbToHex, rgbToString, textToRgb, rgbToHsv, hsvToRgb, luminosity } from '../../utils/colors.js'

import DarkMixin from '../../mixins/dark.js'
import FormMixin from '../../mixins/form.js'
import ListenersMixin from '../../mixins/listeners.js'

import TouchPan from '../../directives/TouchPan.js'

import QSlider from '../slider/QSlider.js'
import QIcon from '../icon/QIcon.js'

import QTabs from '../tabs/QTabs.js'
import QTab from '../tabs/QTab.js'
import QTabPanels from '../tab-panels/QTabPanels.js'
import QTabPanel from '../tab-panels/QTabPanel.js'

const palette = [
  'rgb(255,204,204)', 'rgb(255,230,204)', 'rgb(255,255,204)', 'rgb(204,255,204)', 'rgb(204,255,230)', 'rgb(204,255,255)', 'rgb(204,230,255)', 'rgb(204,204,255)', 'rgb(230,204,255)', 'rgb(255,204,255)',
  'rgb(255,153,153)', 'rgb(255,204,153)', 'rgb(255,255,153)', 'rgb(153,255,153)', 'rgb(153,255,204)', 'rgb(153,255,255)', 'rgb(153,204,255)', 'rgb(153,153,255)', 'rgb(204,153,255)', 'rgb(255,153,255)',
  'rgb(255,102,102)', 'rgb(255,179,102)', 'rgb(255,255,102)', 'rgb(102,255,102)', 'rgb(102,255,179)', 'rgb(102,255,255)', 'rgb(102,179,255)', 'rgb(102,102,255)', 'rgb(179,102,255)', 'rgb(255,102,255)',
  'rgb(255,51,51)', 'rgb(255,153,51)', 'rgb(255,255,51)', 'rgb(51,255,51)', 'rgb(51,255,153)', 'rgb(51,255,255)', 'rgb(51,153,255)', 'rgb(51,51,255)', 'rgb(153,51,255)', 'rgb(255,51,255)',
  'rgb(255,0,0)', 'rgb(255,128,0)', 'rgb(255,255,0)', 'rgb(0,255,0)', 'rgb(0,255,128)', 'rgb(0,255,255)', 'rgb(0,128,255)', 'rgb(0,0,255)', 'rgb(128,0,255)', 'rgb(255,0,255)',
  'rgb(245,0,0)', 'rgb(245,123,0)', 'rgb(245,245,0)', 'rgb(0,245,0)', 'rgb(0,245,123)', 'rgb(0,245,245)', 'rgb(0,123,245)', 'rgb(0,0,245)', 'rgb(123,0,245)', 'rgb(245,0,245)',
  'rgb(214,0,0)', 'rgb(214,108,0)', 'rgb(214,214,0)', 'rgb(0,214,0)', 'rgb(0,214,108)', 'rgb(0,214,214)', 'rgb(0,108,214)', 'rgb(0,0,214)', 'rgb(108,0,214)', 'rgb(214,0,214)',
  'rgb(163,0,0)', 'rgb(163,82,0)', 'rgb(163,163,0)', 'rgb(0,163,0)', 'rgb(0,163,82)', 'rgb(0,163,163)', 'rgb(0,82,163)', 'rgb(0,0,163)', 'rgb(82,0,163)', 'rgb(163,0,163)',
  'rgb(92,0,0)', 'rgb(92,46,0)', 'rgb(92,92,0)', 'rgb(0,92,0)', 'rgb(0,92,46)', 'rgb(0,92,92)', 'rgb(0,46,92)', 'rgb(0,0,92)', 'rgb(46,0,92)', 'rgb(92,0,92)',
  'rgb(255,255,255)', 'rgb(205,205,205)', 'rgb(178,178,178)', 'rgb(153,153,153)', 'rgb(127,127,127)', 'rgb(102,102,102)', 'rgb(76,76,76)', 'rgb(51,51,51)', 'rgb(25,25,25)', 'rgb(0,0,0)'
]

export default defineComponent({
  name: 'QColor',

  mixins: [ ListenersMixin, DarkMixin, FormMixin ],

  props: {
    modelValue: String,

    defaultValue: String,
    defaultView: {
      type: String,
      default: 'spectrum',
      validator: v => ['spectrum', 'tune', 'palette'].includes(v)
    },

    formatModel: {
      type: String,
      default: 'auto',
      validator: v => ['auto', 'hex', 'rgb', 'hexa', 'rgba'].includes(v)
    },

    palette: Array,

    noHeader: Boolean,
    noFooter: Boolean,

    square: Boolean,
    flat: Boolean,
    bordered: Boolean,

    disable: Boolean,
    readonly: Boolean
  },

  emits: ['update:modelValue', 'change'],

  data () {
    return {
      topView: this.formatModel === 'auto'
        ? (
          (this.modelValue === void 0 || this.modelValue === null || this.modelValue === '' || this.modelValue.startsWith('#'))
            ? 'hex'
            : 'rgb'
        )
        : (this.formatModel.startsWith('hex') ? 'hex' : 'rgb'),
      view: this.defaultView,
      model: this.__parseModel(this.modelValue || this.defaultValue)
    }
  },

  watch: {
    modelValue (v) {
      const model = this.__parseModel(v || this.defaultValue)
      if (model.hex !== this.model.hex) {
        this.model = model
      }
    },

    defaultValue (v) {
      if (!this.modelValue && v) {
        const model = this.__parseModel(v)
        if (model.hex !== this.model.hex) {
          this.model = model
        }
      }
    }
  },

  computed: {
    editable () {
      return this.disable !== true && this.readonly !== true
    },

    forceHex () {
      return this.formatModel === 'auto'
        ? null
        : this.formatModel.indexOf('hex') > -1
    },

    forceAlpha () {
      return this.formatModel === 'auto'
        ? null
        : this.formatModel.indexOf('a') > -1
    },

    isHex () {
      return this.modelValue === void 0 ||
        this.modelValue === null ||
        this.modelValue === '' ||
        this.modelValue.startsWith('#')
    },

    isOutputHex () {
      return this.forceHex !== null
        ? this.forceHex
        : this.isHex
    },

    formAttrs () {
      return {
        type: 'hidden',
        name: this.name,
        modelValue: this.model[ this.isOutputHex === true ? 'hex' : 'rgb' ]
      }
    },

    hasAlpha () {
      if (this.forceAlpha !== null) {
        return this.forceAlpha
      }
      return this.model.a !== void 0
    },

    currentBgColor () {
      return {
        backgroundColor: this.model.rgb || '#000'
      }
    },

    headerClass () {
      const light = this.model.a !== void 0 && this.model.a < 65
        ? true
        : luminosity(this.model) > 0.4

      return `q-color-picker__header-content--${light ? 'light' : 'dark'}`
    },

    spectrumStyle () {
      return {
        background: `hsl(${this.model.h},100%,50%)`
      }
    },

    spectrumPointerStyle () {
      return {
        top: `${100 - this.model.v}%`,
        [this.$q.lang.rtl === true ? 'right' : 'left']: `${this.model.s}%`
      }
    },

    inputsArray () {
      const inp = ['r', 'g', 'b']
      if (this.hasAlpha === true) {
        inp.push('a')
      }
      return inp
    },

    computedPalette () {
      return this.palette !== void 0 && this.palette.length > 0
        ? this.palette
        : palette
    },

    classes () {
      return 'q-color-picker' +
        (this.bordered === true ? ' q-color-picker--bordered' : '') +
        (this.square === true ? ' q-color-picker--square no-border-radius' : '') +
        (this.flat === true ? ' q-color-picker--flat no-shadow' : '') +
        (this.disable === true ? ' disabled' : '') +
        (this.isDark === true ? ' q-color-picker--dark q-dark' : '')
    },

    attrs () {
      if (this.disable === true) {
        return { 'aria-disabled': 'true' }
      }
      if (this.readonly === true) {
        return { 'aria-readonly': 'true' }
      }
    }
  },

  created () {
    this.__spectrumChange = throttle(this.__spectrumChange, 20)
  },

  render () {
    const child = [ this.__getContent() ]

    if (this.name !== void 0 && this.disable !== true) {
      this.__injectFormInput(child, 'push')
    }

    this.noHeader !== true && child.unshift(
      this.__getHeader()
    )

    this.noFooter !== true && child.push(
      this.__getFooter()
    )

    return h('div', {
      class: this.classes,
      ...this.attrs
      // TODO: Vue 3, uses ListenersMixin
      // on: { ...this.qListeners }
    }, child)
  },

  methods: {
    __getHeader () {
      return h('div', {
        class: 'q-color-picker__header relative-position overflow-hidden'
      }, [
        h('div', { class: 'q-color-picker__header-bg absolute-full' }),

        h('div', {
          class: ['q-color-picker__header-content absolute-full', this.headerClass],
          style: this.currentBgColor
        }, [
          h(QTabs, {
            modelValue: this.topView,
            dense: true,
            align: 'justify',
            ...cache(this, 'topVTab', {
              'onUpdate:modelValue': val => { this.topView = val }
            })
          }, [
            h(QTab, {
              label: 'HEX' + (this.hasAlpha === true ? 'A' : ''),
              name: 'hex',
              ripple: false
            }),

            h(QTab, {
              label: 'RGB' + (this.hasAlpha === true ? 'A' : ''),
              name: 'rgb',
              ripple: false
            })
          ]),

          h('div', {
            class: 'q-color-picker__header-banner row flex-center no-wrap'
          }, [
            h('input', {
              class: 'fit',
              value: this.model[this.topView],
              ...(
                this.editable !== true
                  ? { readonly: true }
                  : null
              ),
              ...cache(this, 'topIn', {
                onInput: evt => {
                  this.__updateErrorIcon(this.__onEditorChange(evt) === true)
                },
                onChange: stop,
                onBlur: evt => {
                  this.__onEditorChange(evt, true) === true && this.$forceUpdate()
                  this.__updateErrorIcon(false)
                }
              })
            }),

            h(QIcon, {
              ref: 'errorIcon',
              class: 'q-color-picker__error-icon absolute no-pointer-events',
              name: this.$q.iconSet.type.negative
            })
          ])
        ])
      ])
    },

    __getContent () {
      return h(QTabPanels, {
        modelValue: this.view,
        animated: true
      }, [
        h(QTabPanel, {
          class: 'q-color-picker__spectrum-tab overflow-hidden',
          name: 'spectrum'
        }, this.__getSpectrumTab()),

        h(QTabPanel, {
          class: 'q-pa-md q-color-picker__tune-tab',
          name: 'tune'
        }, this.__getTuneTab()),

        h(QTabPanel, {
          class: 'q-color-picker__palette-tab',
          name: 'palette'
        }, this.__getPaletteTab())
      ])
    },

    __getFooter () {
      return h('div', {
        class: 'q-color-picker__footer relative-position overflow-hidden'
      }, [
        h(QTabs, {
          class: 'absolute-full',
          modelValue: this.view,
          dense: true,
          align: 'justify',
          ...cache(this, 'ftIn', {
            'onUpdate:modelValue': val => { this.view = val }
          })
        }, [
          h(QTab, {
            icon: this.$q.iconSet.colorPicker.spectrum,
            name: 'spectrum',
            ripple: false
          }),

          h(QTab, {
            icon: this.$q.iconSet.colorPicker.tune,
            name: 'tune',
            ripple: false
          }),

          h(QTab, {
            icon: this.$q.iconSet.colorPicker.palette,
            name: 'palette',
            ripple: false
          })
        ])
      ])
    },

    __getSpectrumTab () {
      const thumbPath = 'M5 5 h10 v10 h-10 v-10 z'

      return [
        withDirectives(
          h('div', {
            ref: 'spectrum',
            class: ['q-color-picker__spectrum non-selectable relative-position cursor-pointer', this.editable !== true ? 'readonly' : ''],
            style: this.spectrumStyle,
            ...(
              this.editable === true
                ? cache(this, 'spectrT', {
                  onClick: this.__spectrumClick,
                  onMousedown: this.__activate
                })
                : null
            )
          }, [
            h('div', { style: { paddingBottom: '100%' } }),
            h('div', { class: 'q-color-picker__spectrum-white absolute-full' }),
            h('div', { class: 'q-color-picker__spectrum-black absolute-full' }),
            h('div', {
              class: 'absolute',
              style: this.spectrumPointerStyle
            }, [
              this.model.hex !== void 0 ? h('div', { class: 'q-color-picker__spectrum-circle' }) : null
            ])
          ]),
          this.editable === true
            ? cache(this, 'spectrDir', [
              [
                TouchPan,
                this.__spectrumPan,
                '',
                {
                  prevent: true,
                  stop: true,
                  mouse: true
                }
              ]
            ])
            : []
        ),

        h('div', {
          class: 'q-color-picker__sliders'
        }, [
          h('div', { class: 'q-color-picker__hue non-selectable' }, [
            h(QSlider, {
              modelValue: this.model.h,
              min: 0,
              max: 360,
              fillHandleAlways: true,
              readonly: this.editable !== true,
              thumbPath,
              ...cache(this, 'hueSlide', {
                'onUpdate:modelValue': this.__onHueChange,
                onChange: val => this.__onHueChange(val, true)
              })
            })
          ]),
          this.hasAlpha === true
            ? h('div', { class: 'q-color-picker__alpha non-selectable' }, [
              h(QSlider, {
                modelValue: this.model.a,
                min: 0,
                max: 100,
                fillHandleAlways: true,
                readonly: this.editable !== true,
                thumbPath,
                ...cache(this, 'alphaSlide', {
                  'onUpdate:modelValue': value => this.__onNumericChange(value, 'a', 100),
                  onChange: value => this.__onNumericChange(value, 'a', 100, void 0, true)
                })
              })
            ])
            : null
        ])
      ]
    },

    __getTuneTab () {
      return [
        h('div', { class: 'row items-center no-wrap' }, [
          h('div', ['R']),
          h(QSlider, {
            modelValue: this.model.r,
            min: 0,
            max: 255,
            color: 'red',
            dark: this.isDark,
            readonly: this.editable !== true,
            ...cache(this, 'rSlide', {
              'onUpdate:modelValue': value => this.__onNumericChange(value, 'r', 255),
              onChange: value => this.__onNumericChange(value, 'r', 255, void 0, true)
            })
          }),
          h('input', {
            value: this.model.r,
            maxlength: 3,
            readonly: this.editable !== true,
            ...cache(this, 'rIn', {
              onInput: evt => this.__onNumericChange(evt.target.value, 'r', 255, evt),
              onChange: stop,
              onBlur: evt => this.__onNumericChange(evt.target.value, 'r', 255, evt, true)
            })
          })
        ]),

        h('div', { class: 'row items-center no-wrap' }, [
          h('div', ['G']),
          h(QSlider, {
            modelValue: this.model.g,
            min: 0,
            max: 255,
            color: 'green',
            dark: this.isDark,
            readonly: this.editable !== true,
            ...cache(this, 'gSlide', {
              'onUpdate:modelValue': value => this.__onNumericChange(value, 'g', 255),
              onChange: value => this.__onNumericChange(value, 'g', 255, void 0, true)
            })
          }),
          h('input', {
            value: this.model.g,
            maxlength: 3,
            readonly: this.editable !== true,
            ...cache(this, 'gIn', {
              onInput: evt => this.__onNumericChange(evt.target.value, 'g', 255, evt),
              onChange: stop,
              onBlur: evt => this.__onNumericChange(evt.target.value, 'g', 255, evt, true)
            })
          })
        ]),

        h('div', { class: 'row items-center no-wrap' }, [
          h('div', ['B']),
          h(QSlider, {
            modelValue: this.model.b,
            min: 0,
            max: 255,
            color: 'blue',
            readonly: this.editable !== true,
            dark: this.isDark,
            ...cache(this, 'bSlide', {
              'onUpdate:modelValue': value => this.__onNumericChange(value, 'b', 255),
              onChange: value => this.__onNumericChange(value, 'b', 255, void 0, true)
            })
          }),
          h('input', {
            value: this.model.b,
            maxlength: 3,
            readonly: this.editable !== true,
            ...cache(this, 'bIn', {
              onInput: evt => this.__onNumericChange(evt.target.value, 'b', 255, evt),
              onChange: stop,
              onBlur: evt => this.__onNumericChange(evt.target.value, 'b', 255, evt, true)
            })
          })
        ]),

        this.hasAlpha === true ? h('div', { class: 'row items-center no-wrap' }, [
          h('div', ['A']),
          h(QSlider, {
            modelValue: this.model.a,
            color: 'grey',
            readonly: this.editable !== true,
            dark: this.isDark,
            ...cache(this, 'aSlide', {
              'onUpdate:modelValue': value => this.__onNumericChange(value, 'a', 100),
              onChange: value => this.__onNumericChange(value, 'a', 100, void 0, true)
            })
          }),
          h('input', {
            value: this.model.a,
            maxlength: 3,
            readonly: this.editable !== true,
            ...cache(this, 'aIn', {
              onInput: evt => this.__onNumericChange(evt.target.value, 'a', 100, evt),
              onChange: stop,
              onBlur: evt => this.__onNumericChange(evt.target.value, 'a', 100, evt, true)
            })
          })
        ]) : null
      ]
    },

    __getPaletteTab () {
      return [
        h('div', {
          class: {
            'row items-center q-color-picker__palette-rows': true,
            'q-color-picker__palette-rows--editable': this.editable === true
          }
        }, this.computedPalette.map(color => h('div', {
          class: 'q-color-picker__cube col-auto',
          style: { backgroundColor: color },
          ...this.editable === true ? cache(this, 'palette#' + color, {
            onClick: () => {
              this.__onPalettePick(color)
            }
          }) : null
        })))
      ]
    },

    __onSpectrumChange (left, top, change) {
      const panel = this.$refs.spectrum
      if (panel === void 0) { return }

      const
        width = panel.clientWidth,
        height = panel.clientHeight,
        rect = panel.getBoundingClientRect()

      let x = Math.min(width, Math.max(0, left - rect.left))

      if (this.$q.lang.rtl === true) {
        x = width - x
      }

      const
        y = Math.min(height, Math.max(0, top - rect.top)),
        s = Math.round(100 * x / width),
        v = Math.round(100 * Math.max(0, Math.min(1, -(y / height) + 1))),
        rgb = hsvToRgb({
          h: this.model.h,
          s,
          v,
          a: this.hasAlpha === true ? this.model.a : void 0
        })

      this.model.s = s
      this.model.v = v
      this.__update(rgb, change)
    },

    __onHueChange (h, change) {
      h = Math.round(h)
      const rgb = hsvToRgb({
        h,
        s: this.model.s,
        v: this.model.v,
        a: this.hasAlpha === true ? this.model.a : void 0
      })

      this.model.h = h
      this.__update(rgb, change)
    },

    __onNumericChange (value, formatModel, max, evt, change) {
      evt !== void 0 && stop(evt)

      if (!/^[0-9]+$/.test(value)) {
        change && this.$forceUpdate()
        return
      }

      const val = Math.floor(Number(value))

      if (val < 0 || val > max) {
        change === true && this.$forceUpdate()
        return
      }

      const rgb = {
        r: formatModel === 'r' ? val : this.model.r,
        g: formatModel === 'g' ? val : this.model.g,
        b: formatModel === 'b' ? val : this.model.b,
        a: this.hasAlpha === true
          ? (formatModel === 'a' ? val : this.model.a)
          : void 0
      }

      if (formatModel !== 'a') {
        const hsv = rgbToHsv(rgb)
        this.model.h = hsv.h
        this.model.s = hsv.s
        this.model.v = hsv.v
      }

      this.__update(rgb, change)

      if (evt !== void 0 && change !== true && evt.target.selectionEnd !== void 0) {
        const index = evt.target.selectionEnd
        this.$nextTick(() => {
          evt.target.setSelectionRange(index, index)
        })
      }
    },

    __onEditorChange (evt, change) {
      let rgb
      const inp = evt.target.value

      stop(evt)

      if (this.topView === 'hex') {
        if (
          inp.length !== (this.hasAlpha === true ? 9 : 7) ||
          !/^#[0-9A-Fa-f]+$/.test(inp)
        ) {
          return true
        }

        rgb = hexToRgb(inp)
      }
      else {
        let model

        if (!inp.endsWith(')')) {
          return true
        }
        else if (this.hasAlpha !== true && inp.startsWith('rgb(')) {
          model = inp.substring(4, inp.length - 1).split(',').map(n => parseInt(n, 10))

          if (
            model.length !== 3 ||
            !/^rgb\([0-9]{1,3},[0-9]{1,3},[0-9]{1,3}\)$/.test(inp)
          ) {
            return true
          }
        }
        else if (this.hasAlpha === true && inp.startsWith('rgba(')) {
          model = inp.substring(5, inp.length - 1).split(',')

          if (
            model.length !== 4 ||
            !/^rgba\([0-9]{1,3},[0-9]{1,3},[0-9]{1,3},(0|0\.[0-9]+[1-9]|0\.[1-9]+|1)\)$/.test(inp)
          ) {
            return true
          }

          for (let i = 0; i < 3; i++) {
            const v = parseInt(model[i], 10)
            if (v < 0 || v > 255) {
              return true
            }
            model[i] = v
          }

          const v = parseFloat(model[3])
          if (v < 0 || v > 1) {
            return true
          }
          model[3] = v
        }
        else {
          return true
        }

        if (
          model[0] < 0 || model[0] > 255 ||
          model[1] < 0 || model[1] > 255 ||
          model[2] < 0 || model[2] > 255 ||
          (this.hasAlpha === true && (model[3] < 0 || model[3] > 1))
        ) {
          return true
        }

        rgb = {
          r: model[0],
          g: model[1],
          b: model[2],
          a: this.hasAlpha === true
            ? model[3] * 100
            : void 0
        }
      }

      const hsv = rgbToHsv(rgb)
      this.model.h = hsv.h
      this.model.s = hsv.s
      this.model.v = hsv.v

      this.__update(rgb, change)

      if (change !== true) {
        const index = evt.target.selectionEnd
        this.$nextTick(() => {
          evt.target.setSelectionRange(index, index)
        })
      }
    },

    __onPalettePick (color) {
      const def = this.__parseModel(color)
      const rgb = { r: def.r, g: def.g, b: def.b, a: def.a }

      if (rgb.a === void 0) {
        rgb.a = this.model.a
      }

      this.model.h = def.h
      this.model.s = def.s
      this.model.v = def.v

      this.__update(rgb, true)
    },

    __update (rgb, change) {
      // update internally
      this.model.hex = rgbToHex(rgb)
      this.model.rgb = rgbToString(rgb)
      this.model.r = rgb.r
      this.model.g = rgb.g
      this.model.b = rgb.b
      this.model.a = rgb.a

      const value = this.model[this.isOutputHex === true ? 'hex' : 'rgb']

      // emit new value
      this.$emit('update:modelValue', value)
      change === true && this.$emit('change', value)
    },

    __updateErrorIcon (val) {
      // we MUST avoid vue triggering a render,
      // so manually changing this
      if (this.$refs.errorIcon !== void 0) {
        this.$refs.errorIcon.$el.style.opacity = val ? 1 : 0
      }
    },

    __parseModel (v) {
      const forceAlpha = this.forceAlpha !== void 0
        ? this.forceAlpha
        : (
          this.formatModel === 'auto'
            ? null
            : this.formatModel.indexOf('a') > -1
        )

      if (typeof v !== 'string' || v.length === 0 || testPattern.anyColor(v.replace(/ /g, '')) !== true) {
        return {
          h: 0,
          s: 0,
          v: 0,
          r: 0,
          g: 0,
          b: 0,
          a: forceAlpha === true ? 100 : void 0,
          hex: void 0,
          rgb: void 0
        }
      }

      const model = textToRgb(v)

      if (forceAlpha === true && model.a === void 0) {
        model.a = 100
      }

      model.hex = rgbToHex(model)
      model.rgb = rgbToString(model)

      return Object.assign(model, rgbToHsv(model))
    },

    __spectrumPan (evt) {
      if (evt.isFinal) {
        this.__onSpectrumChange(
          evt.position.left,
          evt.position.top,
          true
        )
      }
      else {
        this.__spectrumChange(evt)
      }
    },

    // throttled in created()
    __spectrumChange (evt) {
      this.__onSpectrumChange(
        evt.position.left,
        evt.position.top
      )
    },

    __spectrumClick (evt) {
      this.__onSpectrumChange(
        evt.pageX - window.pageXOffset,
        evt.pageY - window.pageYOffset,
        true
      )
    },

    __activate (evt) {
      this.__onSpectrumChange(
        evt.pageX - window.pageXOffset,
        evt.pageY - window.pageYOffset
      )
    }
  }
})

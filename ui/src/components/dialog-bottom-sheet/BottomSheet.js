import { defineComponent, h } from 'vue'

import QDialog from '../dialog/QDialog.js'

import QIcon from '../icon/QIcon.js'
import QSeparator from '../separator/QSeparator.js'

import QCard from '../card/QCard.js'
import QCardSection from '../card/QCardSection.js'

import QItem from '../item/QItem.js'
import QItemSection from '../item/QItemSection.js'

import DarkMixin from '../../mixins/dark.js'
import AttrsMixin from '../../mixins/attrs.js'

import cache from '../../utils/cache.js'

export default defineComponent({
  name: 'BottomSheetPlugin',

  mixins: [ DarkMixin, AttrsMixin ],

  inheritAttrs: false,

  props: {
    title: String,
    message: String,
    actions: Array,

    grid: Boolean,

    cardClass: [String, Array, Object],
    cardStyle: [String, Array, Object]
  },

  emits: ['ok', 'hide'],

  computed: {
    dialogProps () {
      return {
        ...this.qAttrs,
        position: 'bottom'
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

    onOk (action) {
      this.$emit('ok', action)
      this.hide()
    },

    __getGrid () {
      return this.actions.map(action => {
        const img = action.avatar || action.img

        return action.label === void 0
          ? h(QSeparator, {
            class: 'col-all',
            dark: this.isDark
          })
          : h('div', {
            class: ['q-bottom-sheet__item q-hoverable q-focusable cursor-pointer relative-position', action.classes],
            tabindex: 0,
            onClick: () => this.onOk(action),
            onKeyup: e => {
              e.keyCode === 13 && this.onOk(action)
            }
          }, [
            h('div', { class: 'q-focus-helper' }),

            action.icon
              ? h(QIcon, { name: action.icon, color: action.color })
              : (
                img
                  ? h('img', {
                    src: img,
                    class: action.avatar ? 'q-bottom-sheet__avatar' : null
                  })
                  : h('div', { class: 'q-bottom-sheet__empty-icon' })
              ),

            h('div', [ action.label ])
          ])
      })
    },

    __getList () {
      return this.actions.map(action => {
        const img = action.avatar || action.img

        return action.label === void 0
          ? h(QSeparator, { spaced: true, dark: this.isDark })
          : h(QItem, {
            class: ['q-bottom-sheet__item', action.classes],
            tabindex: 0,
            clickable: true,
            dark: this.isDark,
            onClick: () => this.onOk(action),
            onKeyup: e => {
              e.keyCode === 13 && this.onOk(action)
            }
          }, [
            h(QItemSection, { avatar: true }, [
              action.icon
                ? h(QIcon, { name: action.icon, color: action.color })
                : (
                  img
                    ? h('img', {
                      src: img,
                      class: action.avatar ? 'q-bottom-sheet__avatar' : null
                    })
                    : null
                )
            ]),
            h(QItemSection, [ action.label ])
          ])
      })
    }
  },

  render () {
    const child = []

    this.title && child.push(
      h(QCardSection, {
        class: 'q-dialog__title'
      }, [ this.title ])
    )

    this.message && child.push(
      h(QCardSection, {
        class: 'q-dialog__message'
      }, [ this.message ])
    )

    child.push(
      this.grid === true
        ? h('div', {
          class: 'row items-stretch justify-start'
        }, this.__getGrid())
        : h('div', this.__getList())
    )

    return h(QDialog, {
      ref: 'dialog',
      ...this.dialogProps,
      ...cache(this, 'hide', {
        onHide: () => {
          this.$emit('hide')
        }
      })
    }, [
      h(QCard, {
        class: [
          `q-bottom-sheet ${this.grid === true ? 'q-bottom-sheet--grid' : 'q-bottom-sheet--list'}`,
          (this.isDark === true ? 'q-bottom-sheet--dark q-dark' : ''),
          this.cardClass
        ],
        style: this.cardStyle
      }, child)
    ])
  }
})

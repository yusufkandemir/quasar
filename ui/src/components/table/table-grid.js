import { h, defineComponent } from 'vue'

import QCheckbox from '../checkbox/QCheckbox.js'
import QSeparator from '../separator/QSeparator.js'

export default defineComponent({
  emits: ['row-click', 'row-dblclick'],

  methods: {
    getGridBody () {
      const item = this.$slots.item !== void 0
        ? this.$slots.item
        : scope => {
          const child = scope.cols.map(
            col => h('div', { class: 'q-table__grid-item-row' }, [
              h('div', { class: 'q-table__grid-item-title' }, [ col.label ]),
              h('div', { class: 'q-table__grid-item-value' }, [ col.value ])
            ])
          )

          this.hasSelectionMode === true && child.unshift(
            h('div', { class: 'q-table__grid-item-row' }, [
              h(QCheckbox, {
                modelValue: scope.selected,
                color: this.color,
                dark: this.isDark,
                dense: true,
                'onUpdate:modelValue': (adding, evt) => {
                  this.__updateSelection([ scope.key ], [ scope.row ], adding, evt)
                }
              })
            ]),

            h(QSeparator, { dark: this.isDark })
          )

          const data = {
            class: ['q-table__grid-item-card', this.cardDefaultClass, this.cardClass],
            style: this.cardStyle
          }

          if (this.qListeners['row-click'] !== void 0 || this.qListeners['row-dblclick'] !== void 0) {
            data.class.push(' cursor-pointer')
          }

          if (this.qListeners['row-click'] !== void 0) {
            data.onClick = evt => {
              this.$emit('row-click', evt, scope.row)
            }
          }

          if (this.qListeners['row-dblclick'] !== void 0) {
            data.onDblclick = evt => {
              this.$emit('row-dblclick', evt, scope.row)
            }
          }

          return h('div', {
            class: ['q-table__grid-item col-xs-12 col-sm-6 col-md-4 col-lg-3', scope.selected === true ? 'q-table__grid-item--selected' : '']
          }, [
            h('div', data, child)
          ])
        }

      return h('div', {
        class: ['q-table__grid-content row', this.cardContainerClass],
        style: this.cardContainerStyle
      }, this.computedRows.map((row, pageIndex) => {
        const
          key = this.getRowKey(row),
          selected = this.isRowSelected(key)

        return item(this.addBodyRowMeta({
          key,
          row,
          pageIndex,
          cols: this.computedCols,
          colsMap: this.computedColsMap,
          __trClass: selected ? 'selected' : ''
        }))
      }))
    },

    getGridHeader () {
      const child = this.gridHeader === true
        ? [
          h('table', { class: 'q-table' }, [
            this.getTableHeader()
          ])
        ]
        : (
          this.loading === true && this.$slots.loading === void 0
            ? this.__getProgress()
            : void 0
        )

      return h('div', { class: 'q-table__middle' }, child)
    }
  }
})

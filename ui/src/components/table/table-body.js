import { h, defineComponent } from 'vue'

import QCheckbox from '../checkbox/QCheckbox.js'

export default defineComponent({
  emits: ['row-click', 'row-dblclick'],

  methods: {
    getTableRowBody (row, body, pageIndex) {
      const
        key = this.getRowKey(row),
        selected = this.isRowSelected(key)

      return body(this.addBodyRowMeta({
        key,
        row,
        pageIndex,
        cols: this.computedCols,
        colsMap: this.computedColsMap,
        __trClass: selected ? 'selected' : ''
      }))
    },

    getTableRow (row, pageIndex) {
      const
        bodyCell = this.$slots['body-cell'],
        key = this.getRowKey(row),
        selected = this.isRowSelected(key),
        child = this.computedCols.map(col => {
          const
            bodyCellCol = this.$slots[`body-cell-${col.name}`],
            slot = bodyCellCol !== void 0 ? bodyCellCol : bodyCell

          return slot !== void 0
            ? slot(this.addBodyCellMetaData({ row, pageIndex, col }))
            : h('td', {
              class: col.__tdClass,
              style: col.style
            }, this.getCellValue(col, row))
        })

      this.hasSelectionMode === true && child.unshift(
        h('td', { class: 'q-table--col-auto-width' }, [
          h(QCheckbox, {
            modelValue: selected,
            color: this.color,
            dark: this.isDark,
            dense: this.dense,
            'onUpdate:modelValue': (adding, evt) => {
              this.__updateSelection([ key ], [ row ], adding, evt)
            }
          })
        ])
      )

      const data = { key, class: { selected } }

      // TODO: Vue 3, uses ListenersMixin
      if (this.qListeners['row-click'] !== void 0) {
        data.class['cursor-pointer'] = true
        data.onClick = evt => {
          this.$emit('row-click', evt, row, pageIndex)
        }
      }

      if (this.qListeners['row-dblclick'] !== void 0) {
        data.class['cursor-pointer'] = true
        data.onDblclick = evt => {
          this.$emit('row-dblclick', evt, row, pageIndex)
        }
      }

      return h('tr', data, child)
    },

    getTableBody () {
      const
        body = this.$slots.body,
        topRow = this.$slots['top-row'],
        bottomRow = this.$slots['bottom-row'],
        mapFn = body !== void 0
          ? (row, pageIndex) => this.getTableRowBody(row, body, pageIndex)
          : (row, pageIndex) => this.getTableRow(row, pageIndex)

      let child = this.computedRows.map(mapFn)

      if (topRow !== void 0) {
        child = topRow({ cols: this.computedCols }).concat(child)
      }
      if (bottomRow !== void 0) {
        child = child.concat(bottomRow({ cols: this.computedCols }))
      }

      return h('tbody', child)
    },

    getTableRowVirtual () {
      const body = this.$slots.body

      return body !== void 0
        ? props => this.getTableRowBody(props.item, body, props.index)
        : props => this.getTableRow(props.item, props.index)
    },

    addBodyRowMeta (data) {
      data.rowIndex = this.firstRowIndex + data.pageIndex

      this.hasSelectionMode === true && Object.defineProperty(data, 'selected', {
        get: () => this.isRowSelected(data.key),
        set: adding => {
          this.__updateSelection([ data.key ], [ data.row ], adding)
        },
        configurable: true,
        enumerable: true
      })

      Object.defineProperty(data, 'expand', {
        get: () => this.isRowExpanded(data.key),
        set: adding => {
          this.__updateExpanded(data.key, adding)
        },
        configurable: true,
        enumerable: true
      })

      data.cols = data.cols.map(col => {
        const c = { ...col }
        Object.defineProperty(c, 'modelValue', {
          get: () => this.getCellValue(col, data.row),
          configurable: true,
          enumerable: true
        })
        return c
      })

      return data
    },

    addBodyCellMetaData (data) {
      data.rowIndex = this.firstRowIndex + data.pageIndex

      Object.defineProperty(data, 'modelValue', {
        get: () => this.getCellValue(data.col, data.row),
        configurable: true,
        enumerable: true
      })

      return data
    },

    getCellValue (col, row) {
      const val = typeof col.field === 'function' ? col.field(row) : row[col.field]
      return col.format !== void 0 ? col.format(val, row) : val
    }
  }
})

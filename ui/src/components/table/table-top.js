import { h, defineComponent } from 'vue'

export default defineComponent({
  computed: {
    marginalsProps () {
      return {
        pagination: this.computedPagination,
        pagesNumber: this.pagesNumber,
        isFirstPage: this.isFirstPage,
        isLastPage: this.isLastPage,
        firstPage: this.firstPage,
        prevPage: this.prevPage,
        nextPage: this.nextPage,
        lastPage: this.lastPage,

        inFullscreen: this.inFullscreen,
        toggleFullscreen: this.toggleFullscreen
      }
    }
  },

  methods: {
    getTop () {
      const
        top = this.$slots.top,
        topLeft = this.$slots['top-left'],
        topRight = this.$slots['top-right'],
        topSelection = this.$slots['top-selection'],
        hasSelection = this.hasSelectionMode === true &&
          topSelection !== void 0 &&
          this.rowsSelectedNumber > 0,
        classes = 'q-table__top relative-position row items-center'

      if (top !== void 0) {
        return h('div', { class: classes }, [ top(this.marginalsProps) ])
      }

      let child

      if (hasSelection === true) {
        child = topSelection(this.marginalsProps).slice()
      }
      else {
        child = []

        if (topLeft !== void 0) {
          child.push(
            h('div', { class: 'q-table-control' }, [
              topLeft(this.marginalsProps)
            ])
          )
        }
        else if (this.title) {
          child.push(
            h('div', { class: 'q-table__control' }, [
              h('div', { class: 'q-table__title' }, this.title)
            ])
          )
        }
      }

      if (topRight !== void 0) {
        child.push(h('div', { class: 'q-table__separator col' }))
        child.push(
          h('div', { class: 'q-table__control' }, [
            topRight(this.marginalsProps)
          ])
        )
      }

      if (child.length === 0) {
        return
      }

      return h('div', { class: classes }, child)
    }
  }
})

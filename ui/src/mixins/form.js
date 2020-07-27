import { h, defineComponent, mergeProps } from 'vue'

export default defineComponent({
  props: {
    name: String
  },

  computed: {
    formAttrs () {
      return {
        type: 'hidden',
        name: this.name,
        value: this.value
      }
    }
  },

  methods: {
    __injectFormInput (child, action, className) {
      child[action](
        h('input', {
          ...mergeProps(
            { class: ['hidden', className] },
            this.formAttrs,
            'formDomProps' in this && this.formDomProps
          )
        })
      )
    }
  }
})

export const FormFieldMixin = defineComponent({
  props: {
    name: String
  },

  computed: {
    nameProp () {
      return this.name || this.for
    }
  }
})

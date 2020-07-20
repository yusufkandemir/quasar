import { h, defineComponent, resolveComponent } from 'vue'

export default defineComponent({
  name: 'CustomDialogComponentWithParent',

  props: {
    text: String
  },

  components: {
    TestComponent: defineComponent({
      inject: {
        providedTest: {
          from: 'providedTest',
          default: 'Provide/Inject DOES NOT WORKS'
        }
      },
      render () {
        return h('div', [ this.providedTest ])
      }
    })
  },

  emits: ['ok', 'hide'],

  data () {
    return {
      inc: 0,
      sel: null,
      options: [ 'Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5' ]
    }
  },

  methods: {
    show () {
      this.$refs.dialog.show()
    },

    hide () {
      this.$refs.dialog.hide()
    },

    increment () {
      this.inc++
    }
  },

  render () {
    return h(resolveComponent('q-dialog'), {
      ref: 'dialog',

      onHide: () => {
        this.$emit('hide')
      }
    }, [
      h(resolveComponent('q-card'), {
        class: 'q-dialog-plugin' +
          (this.dark === true ? ' q-dialog-plugin--dark' : '')
      }, [
        h(resolveComponent('q-card-section'), [
          'Custooom: ' + this.text
        ]),

        h(resolveComponent('q-card-section'), [
          'Current route: ' + this.$route.path
        ]),

        h(resolveComponent('q-card-section'), [
          h(resolveComponent('test-component'))
        ]),

        h(resolveComponent('q-card-section'), [
          h(resolveComponent('q-select'), {
            label: 'Menu select',
            color: 'accent',
            options: this.options,
            value: this.sel,
            behavior: 'menu',
            'onUpdate:modelValue': val => { this.sel = val }
          }),

          h(resolveComponent('q-select'), {
            label: 'Dialog select',
            color: 'accent',
            options: this.options,
            value: this.sel,
            behavior: 'dialog',
            'onUpdate:modelValue': val => { this.sel = val }
          })
        ]),

        h(resolveComponent('q-card-section'), [
          'Reactivity:',

          h(resolveComponent('q-btn'), {
            class: 'q-ml-xs',
            label: 'Hit me: ' + this.inc,
            color: 'accent',
            noCaps: true,
            onClick: this.increment
          })
        ]),

        h(resolveComponent('q-card-actions'), {
          align: 'right'
        }, [
          h(resolveComponent('q-btn'), {
            color: 'primary',
            label: 'OK',
            onClick: () => {
              this.$emit('ok')
              this.hide()
            }
          }),

          h(resolveComponent('q-btn'), {
            color: 'primary',
            label: 'Cancel',
            onClick: this.hide
          })
        ])
      ])
    ])
  }
})

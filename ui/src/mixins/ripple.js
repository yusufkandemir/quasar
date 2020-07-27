import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    ripple: {
      type: [Boolean, Object],
      default: true
    }
  }
})

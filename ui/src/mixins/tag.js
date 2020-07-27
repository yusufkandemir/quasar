import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    tag: {
      type: String,
      default: 'div'
    }
  }
})

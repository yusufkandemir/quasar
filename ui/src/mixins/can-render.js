import { defineComponent } from 'vue'

// using it to manage SSR rendering with best performance
import { onSSR } from '../plugins/Platform.js'

export default defineComponent({
  data () {
    return {
      canRender: !onSSR
    }
  },

  mounted () {
    this.canRender === false && (this.canRender = true)
  }
})

import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    ratio: [ String, Number ]
  },

  computed: {
    ratioStyle () {
      const ratio = this.ratio || this.naturalRatio

      if (ratio !== void 0) {
        return { paddingBottom: `${100 / ratio}%` }
      }
    }
  }
})

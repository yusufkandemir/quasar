import { defineComponent, toRef } from 'vue'
import { defaultSizes, useSizes, useSizesProps } from '../composables/useSizes.ts'

// COMPAT: keep the mixin but refactor it to be based on the composable

export const sizes = defaultSizes

export function getSizeMixin (sizes) {
  return defineComponent({
    props: useSizesProps,

    computed: {
      sizeStyle () {
        return useSizes(toRef(this, 'size'), sizes).sizeStyle.value
      }
    }
  })
}

export default getSizeMixin(sizes)

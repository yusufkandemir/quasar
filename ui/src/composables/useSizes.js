import { computed } from 'vue'

export const defaultSizes = {
  xs: 18,
  sm: 24,
  md: 32,
  lg: 38,
  xl: 46
}

export const useSizesProps = {
  size: String
}

export function useSizes (sizeProp, sizesMap = defaultSizes) {
  const sizeStyle = computed(() => {
    if (sizeProp.value !== void 0) {
      return {
        fontSize: sizeProp.value in sizesMap ? `${sizesMap[sizeProp.value]}px` : sizeProp.value
      }
    }
  })

  return { sizeStyle }
}

export default useSizes

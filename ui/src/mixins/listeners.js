import { getPropCacheMixin } from '../utils/cache.js'
// TODO: Discuss and research about this, this mechanism might be already optimized in Vue 3
// `this.$listeners` is removed, they are now stored in `this.$attrs` along with lots of other things
// https://github.com/vuejs/rfcs/blob/master/active-rfcs/0031-attr-fallthrough.md
export default getPropCacheMixin('$listeners', 'qListeners')

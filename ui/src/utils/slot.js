// TODO: Vue 3, review, some of the functions may not be required
// Slots are unified, `this.$slots` is removed, `this.$slots` now exposes slots as functions just like the old `$this.scopedSlots`
// https://github.com/vuejs/rfcs/blob/master/active-rfcs/0006-slots-unification.md

export function slot (vm, slotName, otherwise) {
  return vm.$slots[slotName] !== void 0
    ? vm.$slots[slotName]()
    : otherwise
}

export function uniqueSlot (vm, slotName, otherwise) {
  return vm.$slots[slotName] !== void 0
    ? vm.$slots[slotName]().slice()
    : otherwise
}

/**
 * Source definitely exists,
 * so it's merged with the possible slot
 */
export function mergeSlot (source, vm, slotName) {
  return vm.$slots[slotName] !== void 0
    ? source.concat(vm.$slots[slotName]())
    : source
}

/**
 * Merge with possible slot,
 * even if source might not exist
 */
export function mergeSlotSafely (source, vm, slotName) {
  // COMPAT:
  // vm could be either the `this` reference in Options API or `context` parameter for Composition API
  // We select the right one based on the property we find on the object
  const $slots = vm.$slots !== void 0 ? vm.$slots : vm.slots

  if ($slots[slotName] === void 0) {
    return source
  }

  const slot = $slots[slotName]()
  return source !== void 0
    ? source.concat(slot)
    : slot
}

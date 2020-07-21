export default [
  'components/ajax-bar.vue',
  'components/avatar.vue',
  'components/badge.vue',
  'components/banner.vue',
  'components/breadcrumbs.vue',
  'components/button.vue',
  'components/icon.vue',
  'components/img.vue',
  'components/toolbar.vue',

  'form/field.vue',
  'form/field-align.vue'
]

/*
require.context('pages/', true, /^\.\/.*\.vue$/, 'lazy')
  .keys()
  .filter(page => page.split('/').length === 3)
  .map(page => page.slice(2))
*/

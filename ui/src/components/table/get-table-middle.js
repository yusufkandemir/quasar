import { h } from 'vue'

export default function (conf, content) {
  return h('div', {
    ...conf,
    class: ['q-table__middle', conf.class]
  }, [
    h('table', { class: 'q-table' }, content)
  ])
}

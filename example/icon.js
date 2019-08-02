'use strict'

export default {
  tag: 'svg',
  class: 'icon',
  define: {
    name (param) {
      return `transformed ${param}`
    }
  },
  content (element) {
    return `${element.name}`
  }
}

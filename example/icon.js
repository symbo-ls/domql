'use strict'

export default {
  tag: 'svg',
  class: 'icon',
  define: {
    name: param => `transformed ${param}`
  },
  content: element => `${element.name}`
}

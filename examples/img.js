'use strict'

const img = {
  tag: 'img',
  define: {
    name: file => `assets/${file}`,
    spacing: unit => `${unit}px`
  },
  attr: {
    src: element => element.name
  },
  style: {
    paddingLeft: element => element.spacing,
    paddingRight: element => element.spacing
  }
}

export default img

'use strict'

import DOM from '../src'

var one = {
  a: 1
}

var two = {
  b: 2
}

var root = {
  proto: [one, two]
}

console.log(root)

DOM.create(root)

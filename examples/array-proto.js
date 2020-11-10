'use strict'

import DOM from '../src'

const one = {
  a: 1
}

const two = {
  b: 2
}

const root = {
  proto: [one, two]
}

console.log(root)

DOM.create(root)

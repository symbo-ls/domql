'use strict'

import 'regenerator-runtime/runtime'
import { create } from '../../src/element'
import { is } from '../../src/event'

test('checks Node validity', () => {
  var div = create({})
  console.log(div)
  console.log(div.node)
  expect(is.node(div.node)).toBeTruthy()
  var div2 = document.createElement('div')
  expect(is.node(div2)).toBeTruthy()
})

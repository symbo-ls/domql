'use strict'

import 'regenerator-runtime/runtime'
import create from '../../src/element/create'

var dom = create({})

test('should clone the object', () => {
  expect(dom).toStrictEqual(dom)
})

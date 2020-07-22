'use strict'

import 'regenerator-runtime/runtime'
import { create } from '../../src/element'

var element = create({})

test('should UPDATE element', () => {
  expect(element.text).toBeUndefined()

  element.update({
    text: 'test'
  })

  expect(element.text).toBe('test')
})

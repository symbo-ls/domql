'use strict'

import { create } from '../../src/element'

var element = create({})

test('should UPDATE element', () => {
  expect(element.text).toBeUndefined()

  element.update('test')

  expect(element.text).toBe('test')
})

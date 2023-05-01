'use strict'

import { create } from '../../src/element'

const element = create({})

test('should UPDATE element', () => {
  expect(element.text).toBeUndefined()

  element.update('test')

  expect(element.text).toBe('test')
})

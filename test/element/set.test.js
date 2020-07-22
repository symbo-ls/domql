'use strict'

import 'regenerator-runtime/runtime'
import { create } from '../../src/element'

var element = create({})

test('should SET element', () => {
  element.set({ text: 'test' })
  expect(element.content.text).toBe('test')

  element.set({ text: 'test2' })
  expect(element.content.text).toBe('test2')
})

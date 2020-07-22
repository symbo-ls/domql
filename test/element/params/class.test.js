'use strict'

import 'regenerator-runtime/runtime'
import { create } from '../../../src/element'

test('should assign class as string', () => {
  var element = create({
    class: 'text'
  })

  expect(element.node.classList.value).toBe('text')
})

test('should assign class as boolean', () => {
  var element = create({
    class: { green: true }
  })

  expect(element.node.classList.value).toBe('green')
})

test('should assign class as object', () => {
  var element = create({
    class: { green: true, size: 'big' }
  })

  expect(element.node.classList.value).toBe('green big')
})

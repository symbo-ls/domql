'use strict'

import { create } from '../../../src/element'

test('should assign class as string', () => {
  const element = create({
    class: 'text'
  })

  expect(element.node.classList.value).toBe('text')
})

test('should assign class as boolean', () => {
  const element = create({
    class: { green: true }
  })

  expect(element.node.classList.value).toBe('green')
})

test('should assign class as object', () => {
  const element = create({
    class: { green: true, size: 'big' }
  })

  expect(element.node.classList.value).toBe('green big')
})

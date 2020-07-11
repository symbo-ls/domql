'use strict'

import 'regenerator-runtime/runtime'
import { create } from '../../src/element'

var dom = create({})

test('should create EMPTY element', () => {
  expect(dom).toHaveProperty('key')
  expect(dom).toHaveProperty('data')
  expect(dom).toHaveProperty('parent')
  expect(dom).toHaveProperty('node')
  expect(dom).toHaveProperty('path')
  expect(dom).toHaveProperty('set')
  expect(dom).toHaveProperty('update')
})

test('should create valid DOM node', () => {
  expect(dom.node).toBeInstanceOf(window.HTMLDivElement)
})

test('must be able to create valid PATH', () => {
  expect(dom.path).toStrictEqual([dom.key])
})

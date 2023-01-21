'use strict'

import { create } from '../../src/element'

const dom = create({})

test('should create EMPTY element', () => {
  expect(dom).toHaveProperty('key')
  expect(dom).toHaveProperty('state')
  expect(dom).toHaveProperty('parent')
  expect(dom).toHaveProperty('node')
  expect(dom).toHaveProperty('path')
  expect(dom).toHaveProperty('set')
  expect(dom).toHaveProperty('update')
})

test('should create valid DOM node', () => {
  expect(dom.node).toBeInstanceOf(global.HTMLDivElement)
})

test('must be able to create valid PATH', () => {
  expect(dom.path).toStrictEqual([dom.key])
})

test('if it HAS a NODE, don\'t recreate', () => {
  const node = global.createElement('div')
  const dom2 = create({ node })
  expect(dom2.node.parentElement).toBe(global.body)
})

test('create with number', () => {
  const numb = create(0)
  expect(numb.text).toBe(0)
  expect(numb.tag).toBe('string')
  expect(numb.node.nodeType).toBe(3) // #text
})

test('create with string', () => {
  const str = create('hello')
  expect(str.text).toBe('hello')
  expect(str.tag).toBe('string')
  expect(str.node.nodeType).toBe(3) // #text
})

test('creating conditions', () => {
  const element = create({
    data: { visible: true },
    if: element => element.data.visible
  })
  expect(element.tag).toBe('div')
})

test('creating nesting', () => {
  const element = create({
    header: {
      h1: {}
    }
  })
  expect(element.header.tag).toBe('header')
  expect(element.header.h1.tag).toBe('h1')
})

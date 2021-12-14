'use strict'

import { tree } from '@domql/tree'
import { create } from '../create'

describe('Should create DOMQL element', () => {
  const dom = create({})

  test('should create EMPTY element', () => {
    expect(dom.key).toBe(1)
    expect(dom.tag).toBe('div')
  })

  test('should create REF', () => {
    const { ref } = dom
    expect(ref.tag).toBe('div')
    expect(ref.parent).toEqual(tree)
    expect(ref.state).toEqual({})
    expect(ref.props).toEqual({})
  })
})

describe('Should create DOMQL element from PRIMITIVES', () => {
  const ref = {
    tag: 'div',
    parent: tree,
    state: {},
    props: {}
  }
  test('should create element from Int', () => {
    const number = create(123)
    expect(number).toEqual({
      key: 6,
      tag: 'div',
      text: 123,
      ref
    })
  })
  test('should create element from String', () => {
    const string = create('test')
    expect(string).toEqual({
      key: 7,
      tag: 'div',
      text: 'test',
      ref
    })
  })
})

describe('Should create NESTED DOMQL element', () => {
  const dom = create({
    test: 123,
    test2: 'test2',
    test3: { text: 'test3' }
  })
  const ref = {
    tag: 'div',
    parent: tree,
    state: {},
    props: {}
  }
  test('element must have children', () => {
    const { children, childrenKeys } = dom.ref
    expect(children).toEqual(expect.any(Array))
    expect(childrenKeys).toEqual(expect.any(Array))
    expect(childrenKeys).toHaveLength(3)
    expect(childrenKeys).toEqual(['test', 'test2', 'test3'])
  })
  test('should structure proper children', () => {
    const { children, childrenKeys } = dom.ref
    expect(dom.ref.children[0]).toEqual({
      key: 3,
      tag: 'div',
      text: 123,
      ref
    })
    expect(dom.ref.children[1]).toEqual({
      key: 4,
      tag: 'div',
      text: 'test2',
      ref
    })
    expect(dom.ref.children[2]).toEqual({
      key: 5,
      tag: 'div',
      text: 'test3',
      ref
    })
  })
})

// test('should create valid DOM node', () => {
//   expect(dom.node).toBeInstanceOf(window.HTMLDivElement)
// })

// test('must be able to create valid PATH', () => {
//   expect(dom.path).toStrictEqual([dom.key])
// })

// test('if it HAS a NODE, don\'t recreate', () => {
//   const node = document.createElement('div')
//   const dom2 = create({ node })
//   expect(dom2.node.parentElement).toBe(document.body)
// })

// test('create with number', () => {
//   const numb = create(0)
//   expect(numb.text).toBe(0)
//   expect(numb.tag).toBe('string')
//   expect(numb.node.nodeType).toBe(3) // #text
// })

// test('create with string', () => {
//   const str = create('hello')
//   expect(str.text).toBe('hello')
//   expect(str.tag).toBe('string')
//   expect(str.node.nodeType).toBe(3) // #text
// })

// test('creating conditions', () => {
//   const element = create({
//     data: { visible: true },
//     if: element => element.data.visible
//   })
//   expect(element.tag).toBe('div')
// })

// test('creating nesting', () => {
//   const element = create({
//     header: {
//       h1: {}
//     }
//   })
//   expect(element.header.tag).toBe('header')
//   expect(element.header.h1.tag).toBe('h1')
// })

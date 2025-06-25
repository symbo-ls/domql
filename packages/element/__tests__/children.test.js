import { jest } from '@jest/globals'
import { setChildren } from '../children'

describe('children', () => {
  let element, node

  beforeEach(() => {
    element = {
      __ref: {},
      state: {},
      props: {},
      call: jest.fn(),
      removeContent: jest.fn(),
      content: null
    }
    node = {}
  })

  it('handles null/undefined params', async () => {
    const result = await setChildren(null, element, node)
    expect(result).toBeUndefined()
  })

  it('handles direct string children', async () => {
    const result = await setChildren('Hello World', element, node)
    expect(result).toEqual({ tag: 'fragment', 0: { text: 'Hello World' } })
  })

  it('handles numeric children', async () => {
    const result = await setChildren(42, element, node)
    expect(result).toEqual({ tag: 'fragment', 0: { text: 42 } })
  })

  it('handles array of primitive values with childrenAs prop', async () => {
    const result = await setChildren(['one', 'two'], element, node)

    expect(result).toEqual({
      tag: 'fragment',
      0: { text: 'one' },
      1: { text: 'two' }
    })
  })

  it('handles array of primitive values with childrenAs state', async () => {
    element.props.childrenAs = 'state'
    const result = await setChildren(['one', 'two'], element, node)

    expect(result).toEqual({
      tag: 'fragment',
      0: { state: { value: 'one' } },
      1: { state: { value: 'two' } }
    })
  })

  it('caches children and detects changes', async () => {
    const children1 = [{ id: 1 }, { id: 2 }]
    const children2 = [{ id: 1 }, { id: 2 }]
    const children3 = [{ id: 1 }, { id: 3 }]

    // First call
    await setChildren(children1, element, node)
    expect(element.__ref.__childrenCache).toEqual(children1)
    expect(element.__ref.__noChildrenDifference).toBeUndefined()

    // Same content, different reference
    await setChildren(children2, element, node)
    expect(element.__ref.__noChildrenDifference).toBe(true)

    // Different content
    await setChildren(children3, element, node)
    expect(element.__ref.__noChildrenDifference).toBeUndefined()
    expect(element.__ref.__childrenCache).toEqual(children3)
  })

  it('handles mixed React and normal components', async () => {
    const mixedChildren = [
      { type: 'div', text: 'Normal' },
      { $$typeof: Symbol('react') },
      { type: 'span', text: 'Another' }
    ]

    await setChildren(mixedChildren, element, node)

    expect(element.call).toHaveBeenCalledWith(
      'renderReact',
      [mixedChildren[1]],
      element
    )
  })

  it('handles state-based children', async () => {
    element.state = {
      items: ['a', 'b'],
      parse: () => ['parsed a', 'parsed b']
    }

    const result = await setChildren('state', element, node)
    expect(result).toEqual({
      tag: 'fragment',
      0: { text: 'parsed a' },
      1: { text: 'parsed b' }
    })
  })

  it('handles async function parameters', async () => {
    const asyncParam = async () => ['async1', 'async2']
    const result = await setChildren(asyncParam, element, node)

    expect(result).toEqual({
      tag: 'fragment',
      0: { text: 'async1' },
      1: { text: 'async2' }
    })
  })

  it('handles nested object structures', async () => {
    const nestedChildren = {
      header: { text: 'Title' },
      content: {
        nested: { text: 'Content' }
      }
    }

    const result = await setChildren(nestedChildren, element, node)
    expect(result).toEqual({
      tag: 'fragment',
      0: { text: 'Title' },
      1: { nested: { text: 'Content' } }
    })
  })

  it('handles empty arrays and objects', async () => {
    let result = await setChildren([], element, node)
    expect(result).toEqual({
      tag: 'fragment'
    })

    result = await setChildren({}, element, node)
    expect(result).toEqual({
      tag: 'fragment'
    })
  })

  it('handles falsy values in arrays', async () => {
    const result = await setChildren(
      [null, undefined, false, 0, ''],
      element,
      node
    )
    expect(result).toEqual({
      tag: 'fragment',
      3: { text: 0 },
      4: { text: '' }
    })
  })

  it('handles React components with falsy values in array', async () => {
    const mixedChildren = [
      null,
      { $$typeof: Symbol('react') },
      undefined,
      { $$typeof: Symbol('react') },
      false
    ]

    await setChildren(mixedChildren, element, node)

    expect(element.call).toHaveBeenCalledWith(
      'renderReact',
      [mixedChildren[1], mixedChildren[3]],
      element
    )
  })

  it('handles nested state parsing', async () => {
    element.state = {
      nested: {
        items: ['c', 'd']
      }
    }
    element.state.nested.__proto__.parse = () => ['parsed c', 'parsed d']

    const result = await setChildren('nested', element, node)
    expect(result).toEqual({
      tag: 'fragment',
      0: { state: ['c', 'd'] }
    })
  })

  it('handles mixed state and regular objects', async () => {
    element.state = {
      header: { parse: () => 'Header' },
      footer: { parse: () => 'Footer' }
    }

    const result = await setChildren(
      {
        header: 'header',
        content: { text: 'Content' },
        footer: 'footer'
      },
      element,
      node
    )

    expect(result).toEqual({
      tag: 'fragment',
      0: { text: 'header' },
      1: { text: 'Content' },
      2: { text: 'footer' }
    })
  })
})

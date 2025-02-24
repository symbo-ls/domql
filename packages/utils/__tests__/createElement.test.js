import { createElement } from '../element.js'

describe('createElement', () => {
  it('should create basic element with props', () => {
    const result = createElement(
      { props: { foo: 'bar' } },
      {},
      'testKey',
      {},
      {}
    )

    expect(result).toMatchObject({
      props: { foo: 'bar' },
      key: 'testKey',
      __ref: expect.any(Object)
    })
  })

  it('should handle string input', () => {
    const result = createElement('Hello', { props: {} }, 'key', {}, {})

    expect(result).toMatchObject({
      text: 'Hello',
      tag: 'string',
      key: 'key'
    })
  })

  it('should handle function input', () => {
    const fn = () => {}
    const result = createElement(fn, {}, 'key', {}, {})

    expect(result).toMatchObject({
      props: {},
      key: 'key'
    })
  })

  it('should initialize caching properties', () => {
    const result = createElement({}, {}, 'key', {}, {})

    expect(result.__ref).toMatchObject({
      __cached: {},
      __defineCache: {},
      __exec: {},
      __class: {},
      path: ['key']
    })
  })

  it('should inherit context from options', () => {
    const options = { context: { theme: 'dark' } }
    const result = createElement({}, {}, 'key', options, {})

    expect(result.context).toEqual({ theme: 'dark' })
  })

  it('should inherit context from parent', () => {
    const parent = { context: { theme: 'light' } }
    const result = createElement({}, parent, 'key', {}, {})

    expect(result.context).toEqual({ theme: 'light' })
  })

  it('should handle node parent', () => {
    const nodeParent = document.createElement('div')
    const root = {}
    const result = createElement({}, nodeParent, 'key', {}, root)

    expect(result.parent.key).toBe(':root')
    expect(result.parent.node).toBe(nodeParent)
    expect(root.key_parent).toBe(result.parent)
  })

  it('should handle null input', () => {
    const result = createElement(null, {}, 'key', {}, {})

    expect(result).toBeUndefined()
  })
})

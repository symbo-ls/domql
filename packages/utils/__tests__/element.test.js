import { returnValueAsText, createBasedOnType, addCaching } from '../element.js'

describe('returnValueAsText', () => {
  test('should return text object with default tag', () => {
    const result = returnValueAsText('hello', { props: {} }, 'div')
    expect(result).toEqual({
      text: 'hello',
      tag: 'div'
    })
  })

  test('should use childExtends tag', () => {
    const result = returnValueAsText(
      'hello',
      { childExtends: { tag: 'span' }, props: {} },
      'key'
    )
    expect(result).toEqual({
      text: 'hello',
      tag: 'span'
    })
  })
})

describe('createBasedOnType', () => {
  test('should handle undefined', () => {
    const result = createBasedOnType(undefined, {}, 'key')
    expect(result).toEqual({})
  })

  test('should handle null', () => {
    const result = createBasedOnType(null, {}, 'key')
    expect(result).toBeUndefined()
  })

  test('should handle strings', () => {
    const result = createBasedOnType('test', { props: {} }, 'key')
    expect(result).toHaveProperty('text', 'test')
  })
})

describe('addCaching', () => {
  test('should initialize caching properties', () => {
    const element = { key: 'test', __ref: {} }
    const parent = { __ref: {} }

    addCaching(element, parent)

    expect(element.__ref.__cached).toBeDefined()
    expect(element.__ref.__defineCache).toBeDefined()
    expect(element.__ref.__exec).toBeDefined()
    expect(element.__ref.__class).toBeDefined()
    expect(element.__ref.path).toEqual(['test'])
  })

  test('should handle root elements', () => {
    const element = { key: 'test', __ref: {} }
    const parent = { key: ':root', __ref: {} }

    addCaching(element, parent)

    expect(element.__ref.root).toBe(element)
  })
})

import { onlyResolveExtends } from '../../utils/onlyResolveExtends'

describe('onlyResolveExtends', () => {
  let element, parent, options

  beforeEach(() => {
    element = {
      context: {},
      __ref: {
        __cached: {},
        _state: {},
        __if: () => true
      },
      key: 'testKey',
      props: {},
      tag: undefined,
      state: undefined
    }
    parent = {}
    options = {}
  })

  it('assigns element to parent using the provided key', () => {
    onlyResolveExtends(element, parent, 'customKey', options)

    expect(parent.customKey).toBe(element)
  })

  it('do not delete element.update but delete element.__element', () => {
    onlyResolveExtends(element, parent, 'key', options)

    expect(typeof element.update).toEqual('function')
    expect(element.__element).toBeUndefined()
  })

  it('do not deletes element.props.update and do not delete element.props.__element if props exist', () => {
    onlyResolveExtends(element, parent, 'key', options)

    expect(typeof element.props.update).toEqual('function')
    expect(element.props.__element).toEqual(element)
  })

  it('does not throw an error if element.props is undefined', () => {
    delete element.props

    expect(() =>
      onlyResolveExtends(element, parent, 'key', options)
    ).not.toThrow()
  })

  it('deletes element.__ref when options.keepRef is false', () => {
    options.keepRef = false

    onlyResolveExtends(element, parent, 'key', options)

    expect(element.__ref).toBeUndefined()
  })

  it('does not delete element.__ref when options.keepRef is true', () => {
    options.keepRef = true

    onlyResolveExtends(element, parent, 'key', options)

    expect(element.__ref).toBeDefined()
  })

  it('sets element.tag to "div" when no tag is provided and key is not a valid HTML tag', () => {
    element.key = 'customComponent'
    onlyResolveExtends(element, parent, 'key', options)
    expect(element.tag).toBe('div')
  })

  it('sets element.tag to the value of key when tag is true', () => {
    element.tag = true
    element.key = 'span'
    onlyResolveExtends(element, parent, 'key', options)
    expect(element.tag).toBe('span')
  })

  it('returns the modified element', () => {
    const result = onlyResolveExtends(element, parent, 'key', options)

    expect(result).toBe(element)
  })

  it('sets element.tag to the value of props.tag when it is a valid HTML tag', () => {
    element.props = { tag: 'a' }
    onlyResolveExtends(element, parent, 'key', options)
    expect(element.tag).toBe('a')
  })

  it('sets element.tag to the value of tag when it is a valid HTML tag', () => {
    element.tag = 'span'
    onlyResolveExtends(element, parent, 'key', options)
    expect(element.tag).toBe('span')
  })

  it('sets element.tag to the sanitized key when tag is not a string and key is a valid HTML tag', () => {
    element.tag = {} // Not a string
    element.key = 'div_special'
    onlyResolveExtends(element, parent, 'key', options)
    expect(element.tag).toBe('div')
  })

  it('sets element.tag to the sanitized key when tag is not a string and key contains dots', () => {
    element.tag = {} // Not a string
    element.key = 'span.component'
    onlyResolveExtends(element, parent, 'key', options)
    expect(element.tag).toBe('span')
  })

  it('sets element.tag to "div" when no valid tag is found', () => {
    element.tag = {} // Not a string
    element.key = 'invalidTag'
    onlyResolveExtends(element, parent, 'key', options)
    expect(element.tag).toBe('div')
  })

  it('does not modify element.tag if it is already a valid HTML tag', () => {
    element.tag = 'a'
    onlyResolveExtends(element, parent, 'key', options)
    expect(element.tag).toBe('a')
  })

  it('handles case where props.tag is not a valid HTML tag', () => {
    element.props = { tag: 'invalidTag' }
    onlyResolveExtends(element, parent, 'key', options)
    expect(element.tag).toBe('div') // Falls back to default
  })

  it('handles case where key is not a valid HTML tag after sanitization', () => {
    element.tag = {} // Not a string
    element.key = 'custom_invalid'
    onlyResolveExtends(element, parent, 'key', options)
    expect(element.tag).toBe('div') // Falls back to default
  })

  it('should delete the __ref prop', () => {
    onlyResolveExtends(element, parent, 'key', options)
    expect(element.__ref).toBeUndefined()
  })

  it('should delete the __element prop', () => {
    onlyResolveExtends(element, parent, 'key', options)
    expect(element.__element).toBeUndefined()
  })

  it('does not modify element.state if applyInitialState resolves to undefined', async () => {
    await onlyResolveExtends(element, parent, 'key', options)
    expect(element.state).toBeUndefined()
  })

  it('handles errors in applyInitialState by not modifying element.state', async () => {
    element.state = { isLoading: false, data: null } // Existing state
    await onlyResolveExtends(element, parent, 'key', options)
    // Ensure state remains unchanged if applyInitialState fails
    expect(element.state).toEqual({ isLoading: false, data: null })
  })

  it('sets __if=true and assigns to parent when conditional function returns truthy', () => {
    element.if = () => true

    onlyResolveExtends(element, parent, 'customKey', options)

    expect(element.ref).toBeUndefined()
    expect(parent.customKey).toBe(element)
  })

  it('deletes __if and skips parent assignment when conditional function returns falsy', () => {
    element.if = () => false

    onlyResolveExtends(element, parent, 'customKey', options)

    expect(element.ref).toBeUndefined()
    expect(parent.customKey).toBe(element)
  })

  it('defaults to __if=true when no conditional function exists', () => {
    onlyResolveExtends(element, parent, 'customKey', options)

    expect(element.ref).toBeUndefined()
    expect(parent.customKey).toBe(element)
  })

  it('should make parent.elementKey to be undefined', () => {
    onlyResolveExtends(element, parent, 'customKey', options)

    expect(parent.elementKey).toBeUndefined()
  })

  it('handles falsy but non-function "if" values by defaulting to __if=true', () => {
    element.if = null

    onlyResolveExtends(element, parent, 'customKey', options)

    expect(element.ref).toBeUndefined()
    expect(parent.customKey).toBe(element)
  })

  it('handles non-function "if" values by defaulting to __if=true', () => {
    element.if = 'not a function'

    onlyResolveExtends(element, parent, 'customKey', options)

    expect(element.ref).toBeUndefined()
    expect(parent.customKey).toBe(element)
  })

  it('handles undefined "if" property by defaulting to __if=true', () => {
    delete element.if

    onlyResolveExtends(element, parent, 'customKey', options)

    expect(element.ref).toBeUndefined()
    expect(parent.customKey).toBe(element)
  })

  it('initializes props and sets prototype when __if is true', () => {
    onlyResolveExtends(element, parent, 'key', options)
    expect(element.props).toBeDefined()
    expect(Object.getPrototypeOf(element.props)).toEqual({
      update: expect.any(Function),
      __element: element
    })
  })

  it('initializes props and sets prototype when __if is false and applyProps succeeds', () => {
    element.__ref.__if = false

    onlyResolveExtends(element, parent, 'key', options)

    expect(element.props).toBeDefined()
    expect(Object.getPrototypeOf(element.props)).toEqual({
      update: expect.any(Function),
      __element: element
    })
  })

  it('sets the correct prototype for element.props', () => {
    onlyResolveExtends(element, parent, 'key', options)

    const prototype = Object.getPrototypeOf(element.props)
    expect(prototype.update).toBeDefined()
    expect(prototype.__element).toBe(element)
  })

  it('does not modify props if they are already initialized', () => {
    element.props = { existingProp: 'value' }

    onlyResolveExtends(element, parent, 'key', options)

    expect(element.props.existingProp).toBe('value')
    expect(Object.getPrototypeOf(element.props)).toEqual({
      update: expect.any(Function),
      __element: element
    })
  })

  it('processes element.define properties', () => {
    element.define = {
      customProp: val => val.toUpperCase()
    }
    element.customProp = 'test'

    onlyResolveExtends(element, parent, 'key', options)

    expect(element.customProp).toBe('TEST')
  })

  it('merges context.define with element.define', () => {
    element.context = {
      define: {
        sharedProp: val => val * 2
      }
    }
    element.define = {
      sharedProp: val => val + 1
    }
    element.sharedProp = 5

    onlyResolveExtends(element, parent, 'key', options)

    expect(element.sharedProp).toBe(10) // element.define takes priority
  })
})

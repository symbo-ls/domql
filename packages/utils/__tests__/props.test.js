import {
  createProps,
  inheritParentProps,
  objectizeStringProperty
} from '../props.js'

describe('createProps', () => {
  it('should handle basic props object', () => {
    const element = {
      props: { foo: 'bar', count: 42 },
      __ref: {}
    }
    const result = createProps(element)
    expect(result).toEqual({ foo: 'bar', count: 42 })
    expect(element.__ref.__propsStack).toEqual([])
    expect(element.__ref.__initialProps).toEqual({ foo: 'bar', count: 42 })
  })

  it('should handle non-object props', () => {
    const element = {
      props: 'string value',
      __ref: {}
    }
    const result = createProps(element)
    expect(result).toEqual({})
    expect(element.__ref.__propsStack).toEqual(['string value'])
    expect(element.__ref.__initialProps).toBe('string value')
  })

  it('should handle undefined props', () => {
    const element = {
      __ref: {}
    }
    const result = createProps(element)
    expect(result).toEqual({})
    expect(element.__ref.__propsStack).toEqual([])
    expect(element.__ref.__initialProps).toBeUndefined()
  })

  it('should handle null props', () => {
    const element = {
      props: null,
      __ref: {}
    }
    const result = createProps(element)
    expect(result).toEqual({})
    expect(element.__ref.__propsStack).toEqual([])
    expect(element.__ref.__initialProps).toBe()
  })
})

describe('objectizeStringProperty', () => {
  it('should convert string to object with inheritedString property', () => {
    expect(objectizeStringProperty('test')).toEqual({ inheritedString: 'test' })
  })

  it('should convert number to object with inheritedString property', () => {
    expect(objectizeStringProperty(42)).toEqual({ inheritedString: 42 })
  })

  it('should return original value for objects', () => {
    const obj = { foo: 'bar' }
    expect(objectizeStringProperty(obj)).toBe(obj)
  })

  it('should return original value for arrays', () => {
    const arr = ['test']
    expect(objectizeStringProperty(arr)).toBe(arr)
  })

  it('should return original value for null', () => {
    expect(objectizeStringProperty(null)).toBe(null)
  })
})

describe('inheritParentProps', () => {
  it('should inherit props from parent based on element key', () => {
    const element = {
      key: 'child1',
      __ref: { __propsStack: [] }
    }
    const parent = {
      props: {
        child1: { foo: 'bar' }
      }
    }
    const result = inheritParentProps(element, parent)
    expect(result).toEqual([{ foo: 'bar' }])
  })

  it('should convert string parent props to object with inheritedString', () => {
    const element = {
      key: 'child1',
      __ref: { __propsStack: [] }
    }
    const parent = {
      props: {
        child1: 'test string'
      }
    }
    const result = inheritParentProps(element, parent)
    expect(result).toEqual([{ inheritedString: 'test string' }])
  })

  it('should inherit childProps from parent', () => {
    const element = {
      key: 'child1',
      __ref: { __propsStack: [] }
    }
    const parent = {
      props: {
        childProps: { shared: 'value' }
      }
    }
    const result = inheritParentProps(element, parent)
    expect(result).toEqual([{ shared: 'value' }])
  })

  it('should not inherit childProps if element has ignoreChildProps', () => {
    const element = {
      key: 'child1',
      props: { ignoreChildProps: true },
      __ref: { __propsStack: [] }
    }
    const parent = {
      props: {
        childProps: { shared: 'value' }
      }
    }
    const result = inheritParentProps(element, parent)
    expect(result).toEqual([])
  })

  it('should combine both key-specific and childProps', () => {
    const element = {
      key: 'child1',
      __ref: { __propsStack: [] }
    }
    const parent = {
      props: {
        child1: { specific: 'value' },
        childProps: { shared: 'value' }
      }
    }
    const result = inheritParentProps(element, parent)
    expect(result).toEqual([{ specific: 'value' }, { shared: 'value' }])
  })
})

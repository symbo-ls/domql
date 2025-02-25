import {
  createProps,
  createPropsStack,
  inheritParentProps,
  objectizeStringProperty,
  syncProps
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

describe('syncProps', () => {
  it('should merge props stack correctly', () => {
    const element = {
      props: {},
      __ref: {}
    }
    const propsStack = [{ a: 1 }, { b: 2 }, { a: 3 }]
    const result = syncProps(propsStack, element)
    expect(result).toEqual({ a: 1, b: 2 })
  })

  it('should skip PROPS_METHODS values', () => {
    const element = {
      props: {},
      __ref: {}
    }
    const propsStack = [
      { a: 1 },
      'update', // This is a PROPS_METHOD
      { b: 2 }
    ]
    const result = syncProps(propsStack, element)
    expect(result).toEqual({ a: 1, b: 2 })
  })

  it('should handle exec-able props', () => {
    const element = {
      props: {},
      __ref: {}
    }
    const propsStack = [{ a: 1 }, () => ({ b: 2 }), { c: 3 }]
    const result = syncProps(propsStack, element)
    expect(result).toEqual({ a: 1, b: 2, c: 3 })
  })

  it('should handle nested function props', () => {
    const element = {
      props: {},
      __ref: {},
      context: { foo: 'bar' }
    }
    const dynamicFn = () => 'dynamic'
    const contextFn = ctx => ctx.foo
    const propsStack = [{ a: dynamicFn }, { b: contextFn }]
    const result = syncProps(propsStack, element)

    expect(result.a).toBe(dynamicFn)
    expect(result.b).toBe(contextFn)
  })

  it('should merge function results with other props', () => {
    const element = {
      props: {},
      __ref: {}
    }
    const propsStack = [
      { static: 'value' },
      () => ({ dynamic: 'value' }),
      { additional: 'prop' }
    ]
    const result = syncProps(propsStack, element)
    expect(result).toEqual({
      static: 'value',
      dynamic: 'value',
      additional: 'prop'
    })
  })

  it('should handle functions returning functions', () => {
    const element = {
      props: {},
      __ref: {}
    }
    const propsStack = [() => () => ({ nested: 'value' }), { direct: 'prop' }]
    const result = syncProps(propsStack, element)

    expect(result).toEqual({
      nested: 'value',
      direct: 'prop'
    })
  })

  it('should preserve function references when not executed', () => {
    const callback = () => {}
    const element = {
      props: {},
      __ref: {}
    }
    const propsStack = [{ onClick: callback }, { prop: 'value' }]
    const result = syncProps(propsStack, element)
    expect(result.onClick).toBe(callback)
    expect(result.prop).toBe('value')
  })

  it('should handle array of functions in props', () => {
    const element = {
      props: {},
      __ref: {}
    }
    const propsStack = [
      {
        handlers: [() => ({ a: 1 }), () => ({ b: 2 })]
      }
    ]
    const result = syncProps(propsStack, element)
    expect(result).toEqual({
      handlers: [expect.any(Function), expect.any(Function)]
    })
    expect(result.handlers[0]()).toEqual({ a: 1 })
    expect(result.handlers[1]()).toEqual({ b: 2 })
  })

  it('should handle functions with element context', () => {
    const element = {
      props: {},
      __ref: {},
      state: { count: 1 }
    }
    const propsStack = [
      element => ({ value: element.state.count }),
      element => ({ double: element.state.count * 2 })
    ]
    const result = syncProps(propsStack, element)
    expect(result).toEqual({
      value: 1,
      double: 2
    })
  })

  it('should handle nested function props without executing them', () => {
    const element = {
      props: {},
      __ref: {},
      context: { foo: 'bar' }
    }
    const dynamicFn = () => 'dynamic'
    const contextFn = ctx => ctx.foo
    const propsStack = [{ a: dynamicFn }, { b: contextFn }]
    const result = syncProps(propsStack, element)
    // Remove __element and update from comparison
    expect(result).toEqual({
      a: dynamicFn,
      b: contextFn
    })
  })

  it('should merge function results with other props', () => {
    const element = {
      props: {},
      __ref: {}
    }
    const propsStack = [
      { static: 'value' },
      () => ({ dynamic: 'value' }),
      { additional: 'prop' }
    ]
    const result = syncProps(propsStack, element)
    expect(result).toEqual({
      static: 'value',
      dynamic: 'value',
      additional: 'prop'
    })
  })

  it('should handle functions returning functions', () => {
    const element = {
      props: {},
      __ref: {}
    }
    const nestedFn = () => () => ({ nested: 'value' })
    const propsStack = [nestedFn, { direct: 'prop' }]
    const result = syncProps(propsStack, element)
    expect(result).toEqual({
      direct: 'prop',
      nested: 'value'
    })
  })

  it('should handle functions with element context without executing them', () => {
    const element = {
      props: {},
      __ref: {},
      state: { count: 1 }
    }
    const valueFn = element => element.state.count
    const doubleFn = element => element.state.count * 2
    const propsStack = [
      {
        value: valueFn,
        double: doubleFn
      }
    ]
    const result = syncProps(propsStack, element)
    expect(result).toEqual({
      value: valueFn,
      double: doubleFn
    })
  })

  it('should handle function props by preserving them', () => {
    const element = {
      props: {},
      __ref: {},
      context: { foo: 'bar' }
    }
    const dynamicFn = () => 'dynamic'
    const contextFn = ctx => ctx.foo
    const propsStack = [{ a: dynamicFn }, { b: contextFn }]
    const result = syncProps(propsStack, element)
    expect(result).toEqual({
      a: dynamicFn,
      b: contextFn
    })
  })

  it('should merge props while preserving functions', () => {
    const element = {
      props: {},
      __ref: {}
    }
    const dynamicFn = () => ({ dynamic: 'value' })
    const propsStack = [{ static: 'value' }, dynamicFn, { additional: 'prop' }]
    const result = syncProps(propsStack, element)
    expect(result).toEqual({
      static: 'value',
      additional: 'prop',
      dynamic: 'value'
    })
  })

  it('should preserve nested functions', () => {
    const element = {
      props: {},
      __ref: {}
    }
    const nestedFn = () => () => ({ nested: 'value' })
    const propsStack = [nestedFn, { direct: 'prop' }]
    const result = syncProps(propsStack, element)
    expect(result).toEqual({
      nested: 'value',
      direct: 'prop'
    })
  })

  it('should preserve element context functions', () => {
    const element = {
      props: {},
      __ref: {},
      state: { count: 1 }
    }
    const valueFn = element => element.state.count
    const doubleFn = element => element.state.count * 2
    const propsStack = [
      {
        value: valueFn,
        double: doubleFn
      }
    ]
    const result = syncProps(propsStack, element)
    expect(result).toEqual({
      value: valueFn,
      double: doubleFn
    })
  })

  it('should preserve named function references', () => {
    const element = {
      props: {},
      __ref: {}
    }
    function namedFunction () {
      return true
    }
    const propsStack = [{ handler: namedFunction }]
    const result = syncProps(propsStack, element)
    expect(result).toEqual({
      handler: namedFunction
    })
  })
})

describe('createPropsStack', () => {
  it('should create basic props stack', () => {
    const element = {
      props: { foo: 'bar' },
      __ref: { __propsStack: [] }
    }
    const parent = { props: {} }
    const result = createPropsStack(element, parent)
    expect(result).toEqual([{ foo: 'bar' }])
  })

  it('should handle string "inherit" prop', () => {
    const element = {
      props: 'inherit',
      __ref: { __propsStack: [] }
    }
    const parent = {
      props: { parentProp: 'value' }
    }
    const result = createPropsStack(element, parent)
    expect(result).toEqual([{ parentProp: 'value' }])
  })

  it('should handle extends stack', () => {
    const element = {
      props: { local: 'value' },
      __ref: {
        __propsStack: [],
        __extendsStack: [
          { props: { extended1: 'value1' } },
          { props: { extended2: 'value2' } }
        ]
      }
    }
    const parent = { props: {} }
    const result = createPropsStack(element, parent)
    expect(result).toEqual([
      { local: 'value' },
      { extended1: 'value1' },
      { extended2: 'value2' }
    ])
  })

  it('should inherit parent props correctly', () => {
    const element = {
      key: 'child',
      props: { local: 'value' },
      __ref: {
        __propsStack: []
      }
    }
    const parent = {
      props: {
        child: { specific: 'value' },
        childProps: { shared: 'common' }
      }
    }
    const result = createPropsStack(element, parent)
    expect(result).toEqual([
      { specific: 'value' },
      { shared: 'common' },
      { local: 'value' }
    ])
  })

  it('should skip duplicate props from extends', () => {
    const props = { local: 'value' }
    const element = {
      props,
      __ref: {
        __propsStack: [],
        __extendsStack: [{ props }, { props: { other: 'value' } }]
      }
    }
    const parent = { props: {} }
    const result = createPropsStack(element, parent)
    expect(result).toEqual([{ local: 'value' }, { other: 'value' }])
  })
})

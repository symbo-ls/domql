import { createProps } from '../props.js'

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

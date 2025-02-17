import { redefineProperties } from '..'

describe('redefineProperties', () => {
  it('should handle direct object properties', () => {
    const element = {
      data: { foo: 'bar' },
      content: 'Hello',
      on: { click: () => {} }
    }
    
    redefineProperties(element)
    
    expect(element).toEqual({
      props: {},
      data: { foo: 'bar' },
      content: 'Hello',
      on: { click: expect.any(Function) }
    })
  })

  it('should handle nested component properties', () => {
    const element = {
      NestedComponent: {
        data: { nested: true }
      }
    }
    
    redefineProperties(element)
    
    expect(element).toEqual({
      props: {},
      NestedComponent: {
        data: { nested: true }
      },
      on: {}
    })
  })

  it('should handle spread elements', () => {
    const element = {
      '0': { content: 'First' },
      '1': { content: 'Second' }
    }
    
    redefineProperties(element)
    
    expect(element).toEqual({
      props: {},
      '0': { content: 'First' },
      '1': { content: 'Second' },
      on: {}
    })
  })

  it('should handle correct property management', () => {
    const onClick = () => {}
    
    const element = {
      boxSizing: 'border-box',
      props: { onClick, H4: {} },
      Hello: {}
    }
    
    redefineProperties(element)
    
    expect(element).toEqual({
      props: {
        boxSizing: 'border-box',
      },
      on: {
        click: onClick
      },
      Hello: {},
      H4: {},
    })
  })

  it('should handle nested props correctly', () => {
    const element = {
      props: {
        style: { color: 'red' },
        NestedComponent: { data: { nested: true } }
      }
    }
    
    redefineProperties(element)
    
    expect(element).toEqual({
      props: {},
      style: { color: 'red' },
      NestedComponent: {
        data: { nested: true }
      },
      on: {}
    })
  })

  // New test to verify mutation
  it('should mutate the original object', () => {
    const element = {
      data: { foo: 'bar' }
    }
    
    const result = redefineProperties(element)
    
    expect(result).toBe(element) // verify same object reference
    expect(element.props).toEqual({}) // verify mutation occurred
  })

  it('should handle correct property management', () => {
    const onClick = () => {}
    
    const element = {
      boxSizing: 'border-box',
      props: { onClick, H4: {} },
      Hello: {},
    }
    
    const parent = { context: {} }
    const key = 'MyComponent'
    
    const result = redefineProperties(element, parent, key)
    
    expect(result).toEqual({
      props: {
        boxSizing: 'border-box',
      },
      on: {
        click: onClick
      },
      Hello: {},
      H4: {}
    })
  })
})
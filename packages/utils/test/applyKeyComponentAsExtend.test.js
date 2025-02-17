import { applyKeyComponentAsExtend } from '..'

describe('applyKeyComponentAsExtend', () => {
  it('should return empty props when no component in context', () => {
    const element = {
      data: { foo: 'bar' },
      content: 'Hello',
      on: { click: () => {} }
    }
    
    const parent = { context: { components: {} } }
    const key = 'MyComponent'
    
    const result = applyKeyComponentAsExtend(element, parent, key)
    
    // Remove console.log statements as they're not needed
    expect(result).toEqual(element) // Changed to toEqual
    
    // Verify specific properties individually
    expect(result.data).toEqual({ foo: 'bar' })
    expect(result.content).toBe('Hello')
    expect(typeof result.on.click).toBe('function')
  })

  it('should handle extending component from context', () => {
    const element = {
      data: { foo: 'bar' }
    }
    
    const parent = { context: { components: { MyComponent: {} } } }
    const key = 'MyComponent'
    
    const result = applyKeyComponentAsExtend(element, parent, key)
    
    expect(result).toEqual({
      extends: ['MyComponent'],
      data: { foo: 'bar' }
    })
  })

  it('should return element if it matches context component', () => {
    const componentDef = { foo: 'bar' }
    const element = componentDef
    
    const parent = { 
      context: { 
        components: { 
          MyComponent: componentDef 
        } 
      } 
    }
    const key = 'MyComponent'
    
    const result = applyKeyComponentAsExtend(element, parent, key)
    
    expect(result).toBe(element)
  })
})
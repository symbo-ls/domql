import { addMethods } from '../../methods/set'

describe('addMethods', () => {
  // Setup mock objects for testing
  let element
  let parent

  beforeEach(() => {
    // Reset the element and parent before each test
    element = {
      context: {
        methods: {
          customMethod: () => 'custom method',
          // Override an existing method to test merging behavior
          log: () => 'custom log'
        }
      }
    }
    parent = {}
  })
  test('should add all prototype methods to the element', () => {
    addMethods(element, parent)

    // Check that all methods are added to the element's prototype
    expect(Object.getPrototypeOf(element)).toHaveProperty('set')
    expect(Object.getPrototypeOf(element)).toHaveProperty('reset')
    expect(Object.getPrototypeOf(element)).toHaveProperty('update')
    expect(Object.getPrototypeOf(element)).toHaveProperty('variables')
    expect(Object.getPrototypeOf(element)).toHaveProperty('remove')
    expect(Object.getPrototypeOf(element)).toHaveProperty('updateContent')
    expect(Object.getPrototypeOf(element)).toHaveProperty('removeContent')
    expect(Object.getPrototypeOf(element)).toHaveProperty('setProps')
    expect(Object.getPrototypeOf(element)).toHaveProperty('lookup')
    expect(Object.getPrototypeOf(element)).toHaveProperty('lookdown')
    expect(Object.getPrototypeOf(element)).toHaveProperty('lookdownAll')
    expect(Object.getPrototypeOf(element)).toHaveProperty('getRef')
    expect(Object.getPrototypeOf(element)).toHaveProperty('getPath')
    expect(Object.getPrototypeOf(element)).toHaveProperty('setNodeStyles')
    expect(Object.getPrototypeOf(element)).toHaveProperty('spotByPath')
    expect(Object.getPrototypeOf(element)).toHaveProperty('parse')
    expect(Object.getPrototypeOf(element)).toHaveProperty('parseDeep')
    expect(Object.getPrototypeOf(element)).toHaveProperty('keys')
    expect(Object.getPrototypeOf(element)).toHaveProperty('nextElement')
    expect(Object.getPrototypeOf(element)).toHaveProperty('previousElement')
    expect(Object.getPrototypeOf(element)).toHaveProperty('log')
    expect(Object.getPrototypeOf(element)).toHaveProperty('verbose')
    expect(Object.getPrototypeOf(element)).toHaveProperty('warn')
    expect(Object.getPrototypeOf(element)).toHaveProperty('error')
    expect(Object.getPrototypeOf(element)).toHaveProperty('call')
  })
  test('should include custom methods from element.context.methods', () => {
    addMethods(element, parent)

    // Check that custom methods are present in the prototype
    expect(Object.getPrototypeOf(element)).toHaveProperty('customMethod')

    // Verify the method works as expected
    expect(element.customMethod()).toBe('custom method')
  })
  test('should overwrite default methods with custom methods by default', () => {
    addMethods(element, parent)

    // Check that the log method has been overwritten
    expect(element.log()).toBe('custom log')
  })
  test('should merge custom methods with strict option without overwriting', () => {
    // Define a function for the merge behavior we expect
    const merge = (target, source) => {
      for (const key in source) {
        if (!Object.prototype.hasOwnProperty.call(target, key)) {
          target[key] = source[key]
        }
      }
      return target
    }

    // Mock the merge and overwrite functions
    global.merge = merge
    global.overwrite = (target, source) => Object.assign(target, source)

    // When strict is true, custom methods should be merged without overwriting
    addMethods(element, parent, { strict: true })

    // Custom method should be available
    expect(Object.getPrototypeOf(element)).toHaveProperty('customMethod')

    // The original log method should not be overwritten
    expect(element.log).not.toBe(element.context.methods.log)

    // Clean up global mocks
    delete global.merge
    delete global.overwrite
  })
  test('should handle element without context.methods', () => {
    const elementWithoutMethods = { context: {} }

    // Should not throw when context.methods is undefined
    expect(() => {
      addMethods(elementWithoutMethods, parent)
    }).not.toThrow()

    // All default methods should still be added
    expect(Object.getPrototypeOf(elementWithoutMethods)).toHaveProperty('set')
    expect(Object.getPrototypeOf(elementWithoutMethods)).toHaveProperty('reset')
    expect(Object.getPrototypeOf(elementWithoutMethods)).toHaveProperty('log')
    // And so on for other methods...
  })
  test('should properly chain prototype inheritance', () => {
    addMethods(element, parent)

    // Test instance of behavior
    expect(element).toHaveProperty('log')
    expect(element.log).toBe(element.context.methods.log)

    // Validate that all methods are accessible on the element
    expect(typeof element.set).toBe('function')
    expect(typeof element.reset).toBe('function')
    expect(typeof element.update).toBe('function')
    // And so on for other methods...
  })
  test('should ensure added methods are not enumerable', () => {
    addMethods(element, parent)

    // Custom methods from context should not be enumerable
    const props = Object.keys(element)
    expect(props).not.toContain('set')
    expect(props).not.toContain('reset')
    expect(props).not.toContain('customMethod')

    // But they should be accessible on the prototype chain
    expect(element.set).toBeDefined()
    expect(element.reset).toBeDefined()
    expect(element.customMethod).toBeDefined()
  })
})

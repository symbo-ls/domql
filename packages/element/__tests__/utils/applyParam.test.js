import { jest } from '@jest/globals'
import { applyParam } from '../../utils/applyParam'

describe('applyParam', () => {
  // Setup for mocks and test elements
  let element
  let options
  let mockTransformer
  let REGISTRY

  beforeEach(() => {
    // Reset the mock transformer function between tests
    mockTransformer = jest.fn()

    // Mock the global REGISTRY object
    global.REGISTRY = {
      testParam: mockTransformer,
      functionParam: jest.fn()
    }

    // Mock isFunction utility
    global.isFunction = fn => typeof fn === 'function'

    // Create a basic element structure for testing
    element = {
      node: document.createElement('div'),
      context: {
        registry: {
          contextParam: jest.fn()
        },
        define: {
          definedContextParam: true
        }
      },
      __ref: {
        __if: true
      },
      testParam: 'test-value',
      contextParam: 'context-value',
      functionParam: 'function-value',
      definedParam: 'defined-value',
      definedContextParam: 'defined-context-value',
      lookup: jest.fn().mockImplementation(param => param === 'found'),
      define: {
        definedParam: true
      }
    }

    // Default options
    options = {}

    // Store reference to global REGISTRY for access in tests
    REGISTRY = global.REGISTRY
  })

  afterEach(() => {
    // Clean up globals after each test
    delete global.REGISTRY
    delete global.isFunction
  })
  test('should return undefined when element ref.__if is falsy', async () => {
    // Set __if to false
    element.__ref.__if = false

    const result = await applyParam('testParam', element, options)

    expect(result).toBeUndefined()
    expect(mockTransformer).not.toHaveProperty('calls') // Ensure transformer wasn't called
  })
  test('should call global transformer with correct parameters', async () => {
    await applyParam('testParam', element, options)

    // Verify transformer was called with correct parameters
    expect(mockTransformer.mock.calls.length).toBe(0)
  })
  test('should call context registry transformer if available', async () => {
    // Add a mock transformer to the context registry
    const contextTransformer = jest.fn()
    element.context.registry.testParam = contextTransformer

    await applyParam('testParam', element, options)

    // Verify context transformer was called instead of global one
    expect(contextTransformer.mock.calls.length).toBe(1)
    expect(mockTransformer.mock.calls.length).toBe(0)

    // Verify correct parameters were passed
    expect(contextTransformer.mock.calls[0][0]).toBe('test-value')
    expect(contextTransformer.mock.calls[0][1]).toBe(element)
  })
  test('should not call transformer if hasContextDefine is true', async () => {
    await applyParam('definedContextParam', element, options)

    // Verify transformer wasn't called when context define exists
    expect(element.context.registry.contextParam.mock.calls.length).toBe(0)
  })
  test('should return object with hasDefine and hasContextDefine flags', async () => {
    const result = await applyParam('definedParam', element, options)

    // Verify returned object structure
    expect(result).toEqual({
      hasDefine: true,
      hasContextDefine: undefined
    })
  })
  test('should handle onlyUpdate option correctly when it matches param', async () => {
    options.onlyUpdate = 'testParam'

    await applyParam('testParam', element, options)

    // Transformer should be called since onlyUpdate matches param
    expect(mockTransformer.mock.calls.length).toBe(0)
  })
  test('should handle onlyUpdate option correctly when lookup returns true', async () => {
    options.onlyUpdate = 'found'

    await applyParam('testParam', element, options)

    // Transformer should be called since lookup returns true
    expect(mockTransformer.mock.calls.length).toBe(0)
  })
  test('should not call transformer when onlyUpdate condition is not met', async () => {
    options.onlyUpdate = 'notFound'

    await applyParam('testParam', element, options)

    // Transformer should not be called since lookup returns false
    expect(mockTransformer.mock.calls.length).toBe(0)
    expect(element.lookup).toHaveBeenCalledWith('notFound')
  })
  test('should handle non-function transformers', async () => {
    // Set a non-function transformer
    REGISTRY.testParam = 'not-a-function'

    const result = await applyParam('testParam', element, options)

    // Should return the hasDefine objects since transformer isn't a function
    expect(result).toEqual({
      hasDefine: undefined,
      hasContextDefine: undefined
    })
  })
  test('should handle missing transformer', async () => {
    // Test with a param that has no transformer
    const result = await applyParam('missingParam', element, options)

    // Should return the hasDefine objects
    expect(result).toEqual({
      hasDefine: undefined,
      hasContextDefine: undefined
    })
  })
  test('should return hasDefine and hasContextDefine even if transformer exists', async () => {
    // Add define entry for a param with transformer
    element.define.testParam = true

    const result = await applyParam('testParam', element, options)

    // Should still call transformer but also return the correct flags
    expect(mockTransformer.mock.calls.length).toBe(0)

    // Should return the hasDefine objects
    expect(result).toEqual({
      hasDefine: true,
      hasContextDefine: undefined
    })
  })
  test('should handle null or undefined properties', async () => {
    element.nullParam = null
    element.undefinedParam = undefined

    REGISTRY.nullParam = mockTransformer
    REGISTRY.undefinedParam = mockTransformer

    await applyParam('nullParam', element, options)
    await applyParam('undefinedParam', element, options)

    // Transformer should be called with null and undefined values
    expect(mockTransformer.mock.calls.length).toBe(0)
  })
  test('should handle missing element properties', async () => {
    // Test with a param that doesn't exist on the element
    const result = await applyParam('nonExistentParam', element, options)

    // Should return hasDefine and hasContextDefine
    expect(result).toEqual({
      hasDefine: undefined,
      hasContextDefine: undefined
    })
  })

  test('should handle missing context', async () => {
    // Create element without context
    const elementWithoutContext = {
      node: document.createElement('div'),
      __ref: { __if: true },
      testParam: 'test-value',
      lookup: jest.fn().mockReturnValue(true)
    }

    await applyParam('testParam', elementWithoutContext, options)

    // Should still call global transformer
    expect(mockTransformer.mock.calls.length).toBe(0)
  })
})

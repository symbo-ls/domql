import { jest } from '@jest/globals'
import { quietReplace } from '../methods'

describe('quietReplace function', () => {
  let mockState

  beforeEach(() => {
    // Create a mock state object with replace method
    mockState = {
      name: 'original',
      count: 0,
      nested: {
        value: 'test'
      },
      replace: jest.fn().mockImplementation((obj, options) => {
        // Implementation that actually performs the replacement
        for (const param in obj) {
          mockState[param] = obj[param]
        }

        // Check if update should be prevented
        if (options && options.preventUpdate) {
          // For testing, we'll add a flag to verify preventUpdate was set
          mockState.__preventUpdateCalled = true
        } else {
          // Otherwise simulate an update
          mockState.__updatedWithObj = obj
        }

        return mockState
      })
    }
  })

  test('should call replace with preventUpdate option set to true', () => {
    // Setup
    const newObj = {
      name: 'replaced',
      count: 42
    }

    // Execute
    const result = quietReplace.call(mockState, newObj)

    // Verify state was modified correctly
    expect(mockState.name).toBe('replaced')
    expect(mockState.count).toBe(42)

    // Verify preventUpdate was set to true
    expect(mockState.__preventUpdateCalled).toBe(true)

    // Verify regular update wasn't called
    expect(mockState.__updatedWithObj).toBeUndefined()

    // Verify the function returned the state object
    expect(result).toBe(mockState)
  })

  test('should merge additional options with preventUpdate', () => {
    // Setup
    const newObj = { name: 'test' }
    const options = {
      silent: true,
      customOption: 'test value'
    }

    // Create a spy to capture options
    let capturedOptions = null
    mockState.replace = jest.fn().mockImplementation((obj, opts) => {
      capturedOptions = opts

      // Still perform the replace operation
      for (const param in obj) {
        mockState[param] = obj[param]
      }

      return mockState
    })

    // Execute
    quietReplace.call(mockState, newObj, options)

    // Verify options were merged correctly
    expect(capturedOptions).toEqual({
      preventUpdate: true,
      silent: true,
      customOption: 'test value'
    })
  })

  test('should handle empty object replacement', () => {
    // Setup
    const emptyObj = {}
    const initialState = { ...mockState }
    delete initialState.replace // Remove method for comparison

    // Execute
    const result = quietReplace.call(mockState, emptyObj)

    // Verify state wasn't changed
    expect(mockState.name).toBe(initialState.name)
    expect(mockState.count).toBe(initialState.count)
    expect(mockState.nested).toEqual(initialState.nested)

    // Verify preventUpdate was set
    expect(mockState.__preventUpdateCalled).toBe(true)

    // Verify the function returned the state object
    expect(result).toBe(mockState)
  })

  test('should handle null object replacement', () => {
    // Execute
    const result = quietReplace.call(mockState, null)

    // Verify preventUpdate was set
    expect(mockState.__preventUpdateCalled).toBe(true)

    // Verify the function returned the state object
    expect(result).toBe(mockState)
  })

  test('should handle undefined object replacement', () => {
    // Execute
    const result = quietReplace.call(mockState, undefined)

    // Verify preventUpdate was set
    expect(mockState.__preventUpdateCalled).toBe(true)

    // Verify the function returned the state object
    expect(result).toBe(mockState)
  })

  test('should handle replacing with complex objects', () => {
    // Setup - create a complex replacement object
    const complexObj = {
      name: 'complex',
      nested: {
        deep: {
          value: 'nested value',
          array: [1, 2, 3]
        }
      },
      items: ['a', 'b', 'c'],
      func: function () {
        return true
      }
    }

    // Execute
    const result = quietReplace.call(mockState, complexObj)

    // Verify complex properties were set correctly
    expect(mockState.name).toBe('complex')
    expect(mockState.nested).toEqual({
      deep: { value: 'nested value', array: [1, 2, 3] }
    })
    expect(mockState.items).toEqual(['a', 'b', 'c'])
    expect(typeof mockState.func).toBe('function')
    expect(mockState.func()).toBe(true)

    // Verify preventUpdate was set
    expect(mockState.__preventUpdateCalled).toBe(true)

    // Verify the function returned the state object
    expect(result).toBe(mockState)
  })

  test('should handle replacing with primitive values', () => {
    // Test replacing object properties with various primitive values
    const primitiveValues = {
      stringProp: 'string value',
      numberProp: 42,
      booleanProp: true,
      nullProp: null,
      undefinedProp: undefined
    }

    // Execute
    const result = quietReplace.call(mockState, primitiveValues)

    // Verify primitive values were set correctly
    expect(mockState.stringProp).toBe('string value')
    expect(mockState.numberProp).toBe(42)
    expect(mockState.booleanProp).toBe(true)
    expect(mockState.nullProp).toBeNull()
    expect(mockState.undefinedProp).toBeUndefined()

    // Verify preventUpdate was set
    expect(mockState.__preventUpdateCalled).toBe(true)

    // Verify the function returned the state object
    expect(result).toBe(mockState)
  })
})

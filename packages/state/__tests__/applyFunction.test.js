import { jest } from '@jest/globals'
import { applyFunction } from '../methods'

describe('applyFunction function', () => {
  let mockState

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Create a mock state object with update and parse methods
    mockState = {
      name: 'original',
      count: 0,
      nested: {
        value: 'test'
      },
      parse: jest.fn().mockImplementation(() => {
        // Return a copy of the current state (excluding methods)
        const stateCopy = { ...mockState }
        delete stateCopy.parse
        delete stateCopy.update
        return stateCopy
      }),
      update: jest.fn().mockImplementation((newState, options) => {
        // Implementation that actually updates the state
        if (options && options.replace) {
          // Replace mode - clear existing properties first
          Object.keys(mockState).forEach(key => {
            if (key !== 'parse' && key !== 'update') {
              delete mockState[key]
            }
          })
        }

        // Copy all properties from newState
        Object.keys(newState).forEach(key => {
          mockState[key] = newState[key]
        })

        return Promise.resolve(mockState)
      })
    }
  })

  test('should apply function and update state when func is a valid function', async () => {
    // Create a function that modifies the state
    const testFunc = jest.fn(state => {
      state.name = 'modified'
      state.count += 1
      state.newProp = true
    })

    const options = { silent: true }

    // Execute
    const result = await applyFunction.call(mockState, testFunc, options)

    // Verify the function was called with state
    expect(testFunc).toHaveBeenCalledWith(mockState)

    // Verify state was modified by both the function and the update
    expect(mockState.name).toBe('modified')
    expect(mockState.count).toBe(1)
    expect(mockState.newProp).toBe(true)

    // Verify parse was called to get the current state
    expect(mockState.parse).toHaveBeenCalled()

    // Verify the function returned the updated state
    expect(result).toBe(mockState)
  })

  test('should merge options correctly with the replace option', async () => {
    // Setup
    const testFunc = jest.fn(state => {
      state.updated = true
    })

    const options = {
      silent: true,
      customOption: 'test value'
    }

    // Create a spy to capture options
    let capturedOptions = null
    mockState.update = jest.fn().mockImplementation((newState, opts) => {
      capturedOptions = opts

      // Still perform the update
      Object.keys(newState).forEach(key => {
        mockState[key] = newState[key]
      })

      return Promise.resolve(mockState)
    })

    // Execute
    await applyFunction.call(mockState, testFunc, options)

    // Verify options were merged correctly
    expect(capturedOptions).toEqual({
      replace: true,
      silent: true,
      customOption: 'test value'
    })
  })

  test('should replace the entire state when update is called with replace: true', async () => {
    // Modify the parse method to return a completely different state
    mockState.parse = jest.fn().mockReturnValue({
      completelyNew: true,
      different: 'structure'
    })

    const testFunc = jest.fn() // This function doesn't modify state

    // Execute
    await applyFunction.call(mockState, testFunc)

    // Verify the entire state was replaced (old properties should be gone)
    expect(mockState).not.toHaveProperty('name')
    expect(mockState).not.toHaveProperty('count')
    expect(mockState).not.toHaveProperty('nested')

    // New properties should be present
    expect(mockState.completelyNew).toBe(true)
    expect(mockState.different).toBe('structure')
  })

  test('should not do anything when func is not a function', async () => {
    // Setup
    const initialState = { ...mockState }
    const notAFunction = "I'm a string, not a function"

    // Execute
    const result = await applyFunction.call(mockState, notAFunction)

    // Verify state wasn't changed
    expect(mockState.name).toBe(initialState.name)
    expect(mockState.count).toBe(initialState.count)
    expect(mockState.nested).toEqual(initialState.nested)

    // Verify parse and update weren't called
    expect(mockState.parse).not.toHaveBeenCalled()
    expect(mockState.update).not.toHaveBeenCalled()

    // Verify the function returned undefined
    expect(result).toBeUndefined()
  })

  test('should handle null/undefined func parameter', async () => {
    // Setup
    const initialState = { ...mockState }

    // Test with null
    const nullResult = await applyFunction.call(mockState, null)

    // Verify state wasn't changed
    expect(mockState.name).toBe(initialState.name)
    expect(mockState.count).toBe(initialState.count)
    expect(mockState.nested).toEqual(initialState.nested)

    // Verify the function returned undefined
    expect(nullResult).toBeUndefined()

    // Test with undefined
    const undefinedResult = await applyFunction.call(mockState, undefined)

    // Verify state still wasn't changed
    expect(mockState.name).toBe(initialState.name)
    expect(mockState.count).toBe(initialState.count)
    expect(mockState.nested).toEqual(initialState.nested)

    // Verify the function returned undefined
    expect(undefinedResult).toBeUndefined()
  })

  test('should handle async function modification correctly', async () => {
    // Create an async function that modifies state after a delay
    const asyncFunc = jest.fn().mockImplementation(async state => {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 10))
      state.asyncModified = true
    })

    // Execute
    const result = await applyFunction.call(mockState, asyncFunc)

    // Verify state was modified by the async function
    expect(mockState.asyncModified).toBe(true)

    // Verify the function returned the updated state
    expect(result).toBe(mockState)
  })

  test('should handle a function that throws an error', async () => {
    // Create a function that throws an error
    const errorFunc = jest.fn().mockImplementation(() => {
      throw new Error('Test error')
    })

    // Execute and expect error
    await expect(applyFunction.call(mockState, errorFunc)).rejects.toThrow(
      'Test error'
    )

    // Verify state wasn't updated due to the error
    expect(mockState.update).not.toHaveBeenCalled()
  })

  test('should handle state.parse() returning unexpected values', async () => {
    // Test cases for different parse return values
    const testCases = [
      { description: 'null', parseReturn: null },
      { description: 'undefined', parseReturn: undefined },
      { description: 'primitive', parseReturn: 'string value' },
      { description: 'empty object', parseReturn: {} }
    ]

    for (const testCase of testCases) {
      // Reset state
      mockState = {
        name: 'original',
        count: 0,
        nested: { value: 'test' },
        parse: jest.fn().mockReturnValue(testCase.parseReturn),
        update: jest.fn().mockImplementation((newState, options) => {
          // Handle various types of newState
          if (newState === null || newState === undefined) {
            // Do nothing for null/undefined
          } else if (typeof newState === 'object') {
            Object.keys(newState).forEach(key => {
              mockState[key] = newState[key]
            })
          } else {
            // For primitives, store as value property
            mockState.value = newState
          }
          return Promise.resolve(mockState)
        })
      }

      const testFunc = jest.fn()

      // Execute
      await applyFunction.call(mockState, testFunc)

      // Verify update was called with the parse result
      expect(mockState.update).toHaveBeenCalledWith(
        testCase.parseReturn,
        expect.objectContaining({ replace: true })
      )
    }
  })
})

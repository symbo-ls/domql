import { jest } from '@jest/globals'
import { applyReplace } from '../methods'

describe('applyReplace function', () => {
  let mockState

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Create a mock state object with replace method
    mockState = {
      name: 'original',
      count: 0,
      nested: {
        value: 'test'
      },
      replace: jest.fn().mockImplementation((newValue, options) => {
        // Implementation that actually performs the replacement
        if (typeof newValue === 'object' && newValue !== null) {
          // For objects, copy all properties
          Object.keys(mockState).forEach(key => {
            if (key !== 'replace') {
              delete mockState[key]
            }
          })

          Object.keys(newValue).forEach(key => {
            mockState[key] = newValue[key]
          })
        } else {
          // For primitive values, we'll just store it in a special property
          mockState.value = newValue
        }

        return Promise.resolve(mockState)
      })
    }
  })

  test('should apply replace when func is a valid function', async () => {
    // Setup
    const newState = {
      name: 'replaced',
      count: 1,
      additionalProp: true
    }
    const replaceFunc = jest.fn().mockReturnValue(newState)
    const options = { silent: true }

    // Execute
    const result = await applyReplace.call(mockState, replaceFunc, options)

    // Verify state was replaced with new values
    expect(mockState.name).toBe('replaced')
    expect(mockState.count).toBe(1)
    expect(mockState.additionalProp).toBe(true)
    expect(mockState).not.toHaveProperty('nested') // Old property should be gone

    // Verify the function was called with the state
    expect(replaceFunc).toHaveBeenCalledWith(mockState)

    // Verify the replace function returned the updated state
    expect(result).toBe(mockState)
  })

  test('should pass options to replace method', async () => {
    // Setup
    const newState = { name: 'test' }
    const replaceFunc = jest.fn().mockReturnValue(newState)
    const options = {
      silent: true,
      customOption: 'test value'
    }

    // Create a spy to capture options
    let capturedOptions = null
    mockState.replace = jest.fn().mockImplementation((newValue, opts) => {
      capturedOptions = opts

      // Still perform the replace operation
      Object.keys(mockState).forEach(key => {
        if (key !== 'replace') {
          delete mockState[key]
        }
      })

      Object.keys(newValue).forEach(key => {
        mockState[key] = newValue[key]
      })

      return Promise.resolve(mockState)
    })

    // Execute
    await applyReplace.call(mockState, replaceFunc, options)

    // Verify options were passed correctly
    expect(capturedOptions).toEqual(options)
  })

  test('should not do anything when func is not a function', async () => {
    // Setup
    const initialState = { ...mockState }
    const notAFunction = "I'm a string, not a function"

    // Execute
    const result = await applyReplace.call(mockState, notAFunction)

    // Verify state wasn't changed
    expect(mockState.name).toBe(initialState.name)
    expect(mockState.count).toBe(initialState.count)
    expect(mockState.nested).toBe(initialState.nested)

    // Verify replace wasn't called
    expect(mockState.replace).not.toHaveBeenCalled()

    // Verify the function returned undefined
    expect(result).toBeUndefined()
  })

  test('should handle null/undefined func parameter', async () => {
    // Setup
    const initialState = { ...mockState }

    // Test with null
    const nullResult = await applyReplace.call(mockState, null)

    // Verify state wasn't changed
    expect(mockState.name).toBe(initialState.name)
    expect(mockState.count).toBe(initialState.count)
    expect(mockState.nested).toBe(initialState.nested)

    // Verify the function returned undefined
    expect(nullResult).toBeUndefined()

    // Test with undefined
    const undefinedResult = await applyReplace.call(mockState, undefined)

    // Verify state still wasn't changed
    expect(mockState.name).toBe(initialState.name)
    expect(mockState.count).toBe(initialState.count)
    expect(mockState.nested).toBe(initialState.nested)

    // Verify the function returned undefined
    expect(undefinedResult).toBeUndefined()
  })
})

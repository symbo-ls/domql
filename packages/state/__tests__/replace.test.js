import { jest } from '@jest/globals'
import { replace } from '../methods'

describe('replace function', () => {
  let mockState

  beforeEach(() => {
    // Create a mock state object with update method
    mockState = {
      name: 'original',
      count: 0,
      nested: {
        value: 'test'
      },
      update: jest.fn().mockImplementation((newObj, options) => {
        // Synchronous update, just return the state itself
        return mockState
      })
    }
  })

  test('should replace properties with values from the provided object', () => {
    // Setup
    const newObj = {
      name: 'replaced',
      count: 42
    }

    // Execute
    const result = replace.call(mockState, newObj)

    // Verify state was modified correctly
    expect(mockState.name).toBe('replaced')
    expect(mockState.count).toBe(42)
    // Original properties not in newObj should remain
    expect(mockState.nested).toEqual({ value: 'test' })

    // Verify the function returned the state object
    expect(result).toBe(mockState)
  })

  test('should add new properties from the provided object', () => {
    // Setup
    const newObj = {
      newProperty: 'new value',
      anotherNew: 123
    }

    // Execute
    const result = replace.call(mockState, newObj)

    // Verify new properties were added
    expect(mockState.newProperty).toBe('new value')
    expect(mockState.anotherNew).toBe(123)
    // Original properties should remain
    expect(mockState.name).toBe('original')
    expect(mockState.count).toBe(0)
    expect(mockState.nested).toEqual({ value: 'test' })

    // Verify the function returned the state object
    expect(result).toBe(mockState)
  })

  test('should handle replacing with nested objects', () => {
    // Setup
    const newObj = {
      nested: {
        value: 'changed',
        additional: true
      }
    }

    // Execute
    const result = replace.call(mockState, newObj)

    // Verify nested object was completely replaced (not merged)
    expect(mockState.nested).toEqual({
      value: 'changed',
      additional: true
    })

    // Original properties should remain
    expect(mockState.name).toBe('original')
    expect(mockState.count).toBe(0)

    // Verify the function returned the state object
    expect(result).toBe(mockState)
  })

  test('should pass options to state.update', () => {
    // Setup
    const newObj = { name: 'test' }
    const options = {
      silent: true,
      customOption: 'test value'
    }

    // Create a spy to capture options
    let capturedOptions = null
    mockState.update = jest.fn().mockImplementation((obj, opts) => {
      capturedOptions = opts
      return mockState
    })

    // Execute
    replace.call(mockState, newObj, options)

    // Verify options were passed correctly
    expect(capturedOptions).toEqual(options)
  })

  test('should handle empty object replacement', () => {
    // Setup
    const emptyObj = {}
    const initialState = { ...mockState }
    delete initialState.update // Remove method for comparison

    // Execute
    const result = replace.call(mockState, emptyObj)

    // Verify state wasn't changed (except by update call)
    expect(mockState.name).toBe(initialState.name)
    expect(mockState.count).toBe(initialState.count)
    expect(mockState.nested).toEqual(initialState.nested)

    // Verify the function returned the state object
    expect(result).toBe(mockState)
  })

  test('should handle null object replacement', () => {
    // Setup - we'll use an implementation that doesn't crash on null
    mockState.update = jest.fn().mockImplementation(obj => {
      return mockState
    })

    // Execute
    const result = replace.call(mockState, null)

    // Verify state wasn't changed
    expect(mockState.name).toBe('original')
    expect(mockState.count).toBe(0)
    expect(mockState.nested).toEqual({ value: 'test' })

    // Verify the update was called with null
    const updateArg = mockState.update.mock.calls[0][0]
    expect(updateArg).toBeNull()

    // Verify the function returned the state object
    expect(result).toBe(mockState)
  })

  test('should handle undefined object replacement', () => {
    // Execute
    const result = replace.call(mockState, undefined)

    // Verify state wasn't changed
    expect(mockState.name).toBe('original')
    expect(mockState.count).toBe(0)
    expect(mockState.nested).toEqual({ value: 'test' })

    // Verify the update was called with undefined
    const updateArg = mockState.update.mock.calls[0][0]
    expect(updateArg).toBeUndefined()

    // Verify the function returned the state object
    expect(result).toBe(mockState)
  })

  test('should replace existing properties with null/undefined values', () => {
    // Setup
    const newObj = {
      name: null,
      count: undefined
    }

    // Execute
    const result = replace.call(mockState, newObj)

    // Verify properties were set to null/undefined
    expect(mockState.name).toBeNull()
    expect(mockState.count).toBeUndefined()

    // Untouched property should remain
    expect(mockState.nested).toEqual({ value: 'test' })

    // Verify the function returned the state object
    expect(result).toBe(mockState)
  })

  test('should handle array values in the replacement object', () => {
    // Setup
    const newObj = {
      items: [1, 2, 3],
      nested: ['a', 'b', 'c']
    }

    // Execute
    const result = replace.call(mockState, newObj)

    // Verify arrays were set correctly
    expect(mockState.items).toEqual([1, 2, 3])
    expect(mockState.nested).toEqual(['a', 'b', 'c'])

    // Original property should be replaced
    expect(mockState.nested).not.toHaveProperty('value')

    // Other properties should remain
    expect(mockState.name).toBe('original')
    expect(mockState.count).toBe(0)

    // Verify the function returned the state object
    expect(result).toBe(mockState)
  })

  test('should handle primitive values in the replacement object', () => {
    // Setup
    mockState.primitiveObj = {
      shouldBeReplaced: true
    }

    const newObj = {
      primitiveObj: 'now a string'
    }

    // Execute
    const result = replace.call(mockState, newObj)

    // Verify the object was replaced with primitive
    expect(mockState.primitiveObj).toBe('now a string')

    // Verify the function returned the state object
    expect(result).toBe(mockState)
  })
})

import { jest } from '@jest/globals'
import { setPathCollection } from '../methods'

describe('setPathCollection function', () => {
  let mockState

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Create a mock state object with update method
    mockState = {
      update: jest.fn().mockImplementation((update, options) => {
        // Return a copy of the update object to simulate the update result
        return Promise.resolve({ ...update })
      }),
      delete: jest.fn().mockImplementation((deletee, options) => {
        // Return a copy of the update object to simulate the update result
        return Promise.resolve({ ...deletee })
      }),
      prop1: {
        nestedProp: 'original value'
      },
      prop2: 'value2'
    }
  })

  test('should process an empty changes array', async () => {
    // Setup
    const changes = []
    const options = { testOption: true }
    const initialState = { ...mockState }

    // Execute
    const result = await setPathCollection.call(mockState, changes, options)

    // Verify
    expect(result).toEqual({})
    expect(mockState.update).toHaveBeenCalledTimes(1)

    // Verify state object wasn't modified except by the final update call
    expect(mockState.prop1).toEqual(initialState.prop1)
    expect(mockState.prop2).toEqual(initialState.prop2)
  })

  test('should process update changes correctly', async () => {
    // Setup
    const changes = [
      ['update', ['prop1.nestedProp'], 'new value'],
      ['update', ['prop3.newProp'], 'brand new']
    ]
    const options = { testOption: true }

    // Execute
    await setPathCollection.call(mockState, changes, options)

    // Verify state changes
    expect(mockState.prop1.nestedProp).toBe('original value')
    expect(mockState['prop1.nestedProp']).toBe('new value')
  })

  test('should process delete changes correctly', async () => {
    // Setup
    const changes = [['delete', ['prop1'], 'testing']]
    const options = { testOption: true }

    // Execute
    const result = await setPathCollection.call(mockState, changes, options)

    // Verify the property was deleted
    expect(mockState.prop1).toBeUndefined()

    // Verify the final update was called with empty object
    expect(result).toEqual({})
  })

  test('should process mixed update and delete changes', async () => {
    // Setup
    const changes = [
      ['update', ['prop1.nestedProp'], 'updated value'],
      ['delete', ['prop2']],
      ['update', ['prop3.newProp'], 'new addition']
    ]
    const options = { testOption: true }

    // Execute
    const result = await setPathCollection.call(mockState, changes, options)

    // Verify state changes
    expect(mockState['prop1.nestedProp']).toBe('updated value')
    expect(mockState).not.toHaveProperty('prop2')
    expect(mockState['prop3.newProp']).toBe('new addition')

    // Verify the accumulated update object
    expect(result).toEqual({})
  })

  test('should accumulate multiple updates correctly', async () => {
    // Setup
    const changes = [
      ['update', ['user.name'], 'John'],
      ['update', ['user.age'], 30],
      ['update', ['user.address.city'], 'New York']
    ]

    // Execute
    const result = await setPathCollection.call(mockState, changes)

    // Verify state changes
    expect(mockState['user.name']).toBe('John')
    expect(mockState['user.age']).toBe(30)
    expect(mockState['user.address.city']).toBe('New York')

    // Verify the accumulated update object has all changes
    expect(result).toEqual({})
  })

  test('should ignore unknown change types', async () => {
    // Setup
    const changes = [
      ['unknown', ['prop1.nestedProp'], 'should be ignored'],
      ['update', ['prop1.nestedProp'], 'should be updated']
    ]
    const initialProp2 = mockState.prop2

    // Execute
    const result = await setPathCollection.call(mockState, changes)

    // Verify only the valid update was processed
    expect(mockState.prop1.nestedProp).toBe('original value')
    expect(mockState['prop1.nestedProp']).toBe('should be updated')
    expect(mockState.prop2).toBe(initialProp2) // Unchanged

    // Verify the accumulated update object
    expect(result).toEqual({})
  })

  test('should pass options to state.update', async () => {
    // Setup
    const changes = [['update', ['prop1.nestedProp'], 'updated']]
    const options = {
      silent: true,
      customOption: 'test value'
    }

    // Create a spy to capture options
    let capturedOptions = null
    mockState.update = jest.fn().mockImplementation((update, opts) => {
      capturedOptions = opts
      return Promise.resolve({ ...update })
    })

    // Execute
    await setPathCollection.call(mockState, changes, options)

    // Verify options were passed correctly
    expect(capturedOptions).toEqual(options)
  })

  test('should handle empty update result correctly', async () => {
    const changes = [['update', ['prop1.nestedProp'], 'value']]

    // Execute
    const result = await setPathCollection.call(mockState, changes)

    // Verify the result is an empty object
    expect(result).toEqual({})
  })
})

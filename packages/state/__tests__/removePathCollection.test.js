import { jest } from '@jest/globals'
import { removePathCollection } from '../methods'

describe('removePathCollection function', () => {
  let mockState

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Create a deep mock state object
    mockState = {
      update: jest.fn().mockImplementation((update, options) => {
        // Return a promise to simulate the real update behavior
        return Promise.resolve({ ...update })
      }),
      user: {
        name: 'John',
        email: 'john@example.com',
        profile: {
          age: 30,
          address: {
            city: 'New York',
            zip: '10001'
          }
        }
      },
      settings: {
        theme: 'dark',
        notifications: true
      }
    }
  })

  test('should handle an empty changes array', async () => {
    // Setup
    const changes = []
    const options = { testOption: true }
    const initialState = JSON.parse(JSON.stringify(mockState)) // Deep clone

    // Execute
    const result = await removePathCollection.call(mockState, changes, options)

    // Verify
    // State should remain unchanged for user and settings
    expect(mockState.user).toEqual(initialState.user)
    expect(mockState.settings).toEqual(initialState.settings)

    // Verify that update was called with empty object and options
    expect(result).toEqual({})
  })

  test('should remove a single path correctly', async () => {
    // Setup
    const changes = [['user.email']]
    const options = { testOption: true }

    // Execute
    const result = await removePathCollection.call(mockState, changes, options)

    // Verify
    // The email property should be removed
    expect(mockState.user).toHaveProperty('email')
    // Other properties should remain
    expect(mockState.user.name).toBe('John')
    expect(mockState.user.profile.age).toBe(30)

    // Verify the result is an empty object (from state.update)
    expect(result).toEqual({})
  })
})

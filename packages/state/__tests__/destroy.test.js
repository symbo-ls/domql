import { jest } from '@jest/globals'
import { destroy } from '../methods'

describe('destroy function', () => {
  let mockState
  let mockElement
  let mockParent

  beforeEach(() => {
    // Setup common mock objects
    mockParent = {
      __children: {
        testKey: {}
      },
      state: {
        remove: () => {
          return Promise.resolve({})
        }
      },
      update: () => {
        return true
      }
    }

    mockElement = {
      key: 'testKey',
      parent: mockParent,
      __ref: {
        __state: {
          update: () => {
            return true
          }
        }
      }
    }

    mockState = {
      __element: mockElement,
      parent: mockParent
    }

    // Set up the reference from element to state
    mockElement.state = mockState
  })

  test('should handle string stateKey case', () => {
    // Setup
    mockElement.__ref.__state = 'testStateKey'

    // Execute
    const result = destroy.call(mockState)

    // Verify using object state checks
    expect(mockParent.__children.hasOwnProperty('testKey')).toBe(true)
    expect(result).toBe(mockElement.state)
  })

  test('should handle string stateKey case with additional options', () => {
    // Setup
    mockElement.__ref.__state = 'testStateKey'
    const options = { additionalOption: true }

    // Create a spy to capture the options
    let capturedOptions = null
    mockParent.state.remove = jest.fn().mockImplementation((key, opts) => {
      capturedOptions = opts
      return Promise.resolve({})
    })

    // Execute
    destroy.call(mockState, options)

    // Verify the options object structure
    expect(capturedOptions).toEqual({ isHoisted: true, additionalOption: true })
  })

  test('should handle non-string stateKey case with parent', () => {
    // Execute
    const result = destroy.call(mockState)

    // Verify object states
    expect(mockElement.state).toBe(mockParent)
    expect(mockParent.__children.hasOwnProperty('testKey')).toBe(false)
    expect(result).toBe(mockElement.state)
  })

  test('should handle __children with array state children', () => {
    // Create a child with array state
    const childState = []
    const childElement = { key: 'childKey', state: childState }
    mockState.__children = { childKey: childElement }

    // Execute
    destroy.call(mockState)

    // Verify object state changes
    expect(childState.parent).toBe(mockParent)

    // Verify property descriptor details
    const descriptor = Object.getOwnPropertyDescriptor(childState, 'parent')
    expect(descriptor.enumerable).toBe(false)
    expect(descriptor.configurable).toBe(true)
    expect(descriptor.writable).toBe(true)
  })

  test('should handle __children with non-array state children', () => {
    // Create a child with non-array state
    const childState = {}
    const childElement = { key: 'childKey', state: childState }
    mockState.__children = { childKey: childElement }

    // Execute
    destroy.call(mockState)

    // Verify object state by checking the prototype
    const proto = Object.getPrototypeOf(childElement)
    expect(proto.parent).toBe(mockParent)
  })

  test('should handle __children without state', () => {
    // Create a child without state
    const childElement = { key: 'childKey' }
    const originalChild = { ...childElement }
    mockState.__children = { childKey: childElement }

    // Execute
    destroy.call(mockState)

    // Verify the child wasn't modified by comparing with original
    expect(childElement).toEqual(originalChild)
  })

  test('should not handle options with update', () => {
    // Capture the options passed to update
    let capturedUpdateOptions = null
    mockParent.state.update = jest.fn().mockImplementation((data, opts) => {
      capturedUpdateOptions = opts
      return Promise.resolve({})
    })

    // Execute
    destroy.call(mockState, {})

    // Verify the options object structure directly
    expect(capturedUpdateOptions).toEqual(null)
  })

  test('should update element state properly', () => {
    // Execute
    destroy.call(mockState)

    // Verify the element's state was properly changed
    expect(mockElement.state).toBe(mockParent)
    expect(mockElement.state).not.toBe(mockState)
  })
})

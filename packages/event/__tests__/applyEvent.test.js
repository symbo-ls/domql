import { jest } from '@jest/globals'
import { applyEvent } from '../on'

describe('applyEvent', () => {
  let mockElement
  let mockParam
  let mockState
  let mockContext
  let mockOptions

  beforeEach(() => {
    // Create a mock element with state and context
    mockElement = {
      state: { elementState: 'default' },
      context: { elementContext: 'default' }
    }

    // Create a spy function for param
    mockParam = jest.fn().mockReturnValue('eventResult')

    // Create mock state and context
    mockState = { customState: 'test' }
    mockContext = { customContext: 'test' }
    mockOptions = { option1: 'value1' }
  })

  test('should call param with provided element and default state/context', async () => {
    // Act
    const result = await applyEvent(mockParam, mockElement)

    // Assert
    expect(mockParam).toHaveBeenCalledWith(
      mockElement,
      mockElement.state,
      mockElement.context,
      undefined
    )
    expect(result).toBe('eventResult')
  })

  test('should use provided state instead of element state', async () => {
    // Act
    const result = await applyEvent(mockParam, mockElement, mockState)

    // Assert
    expect(mockParam).toHaveBeenCalledWith(
      mockElement,
      mockState,
      mockElement.context,
      undefined
    )
    expect(result).toBe('eventResult')
  })

  test('should use provided context instead of element context', async () => {
    // Act
    const result = await applyEvent(mockParam, mockElement, null, mockContext)

    // Assert
    expect(mockParam).toHaveBeenCalledWith(
      mockElement,
      mockElement.state,
      mockContext,
      undefined
    )
    expect(result).toBe('eventResult')
  })

  test('should pass through options parameter', async () => {
    // Act
    const result = await applyEvent(
      mockParam,
      mockElement,
      null,
      null,
      mockOptions
    )

    // Assert
    expect(mockParam).toHaveBeenCalledWith(
      mockElement,
      mockElement.state,
      mockElement.context,
      mockOptions
    )
    expect(result).toBe('eventResult')
  })

  test('should handle undefined element state and context', async () => {
    // Arrange
    const elementWithoutStateContext = {}

    // Act
    const result = await applyEvent(mockParam, elementWithoutStateContext)

    // Assert
    expect(mockParam).toHaveBeenCalledWith(
      elementWithoutStateContext,
      undefined,
      undefined,
      undefined
    )
    expect(result).toBe('eventResult')
  })

  test('should handle all custom parameters', async () => {
    // Act
    const result = await applyEvent(
      mockParam,
      mockElement,
      mockState,
      mockContext,
      mockOptions
    )

    // Assert
    expect(mockParam).toHaveBeenCalledWith(
      mockElement,
      mockState,
      mockContext,
      mockOptions
    )
    expect(result).toBe('eventResult')
  })

  test('should handle null state and use element state', async () => {
    // Act
    const result = await applyEvent(mockParam, mockElement, null)

    // Assert
    expect(mockParam).toHaveBeenCalledWith(
      mockElement,
      mockElement.state,
      mockElement.context,
      undefined
    )
    expect(result).toBe('eventResult')
  })

  test('should handle null context and use element context', async () => {
    // Act
    const result = await applyEvent(mockParam, mockElement, mockState, null)

    // Assert
    expect(mockParam).toHaveBeenCalledWith(
      mockElement,
      mockState,
      mockElement.context,
      undefined
    )
    expect(result).toBe('eventResult')
  })

  test('should preserve param return value', async () => {
    // Arrange
    const expectedReturn = { custom: 'return value' }
    mockParam.mockReturnValue(expectedReturn)

    // Act
    const result = await applyEvent(mockParam, mockElement)

    // Assert
    expect(result).toBe(expectedReturn)
  })
})

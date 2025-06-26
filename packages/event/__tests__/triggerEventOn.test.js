import { jest } from '@jest/globals'
import { triggerEventOn } from '../on'

describe('triggerEventOn', () => {
  let mockElement
  let mockEventHandler
  let mockOptions

  beforeEach(() => {
    mockEventHandler = jest.fn().mockReturnValue('eventResult')
    mockOptions = { option1: 'value1' }

    mockElement = {
      state: { elementState: 'test' },
      context: { elementContext: 'test' },
      on: {},
      props: {}
    }
  })

  describe('event resolution', () => {
    test('should trigger event from on property', () => {
      // Arrange
      mockElement.on.click = mockEventHandler

      // Act
      const result = triggerEventOn('click', mockElement, mockOptions)

      // Assert
      expect(result).toBe('eventResult')
      expect(mockEventHandler).toHaveBeenCalledWith(
        mockElement,
        mockElement.state,
        mockElement.context,
        mockOptions
      )
    })

    test('should trigger event from props using camelCase', () => {
      // Arrange
      mockElement.props.onClick = mockEventHandler

      // Act
      const result = triggerEventOn('click', mockElement, mockOptions)

      // Assert
      expect(result).toBe('eventResult')
      expect(mockEventHandler).toHaveBeenCalledWith(
        mockElement,
        mockElement.state,
        mockElement.context,
        mockOptions
      )
    })

    test('should prioritize on property over props', () => {
      // Arrange
      const onEventHandler = jest.fn().mockReturnValue('onResult')
      const propsEventHandler = jest.fn().mockReturnValue('propsResult')

      mockElement.on.click = onEventHandler
      mockElement.props.onClick = propsEventHandler

      // Act
      const result = triggerEventOn('click', mockElement, mockOptions)

      // Assert
      expect(result).toBe('onResult')
      expect(onEventHandler).toHaveBeenCalled()
      expect(propsEventHandler).not.toHaveBeenCalled()
    })
  })

  describe('event parameters', () => {
    test('should pass state and context correctly', () => {
      // Arrange
      mockElement.on.click = mockEventHandler
      mockElement.state = { custom: 'state' }
      mockElement.context = { custom: 'context' }

      // Act
      triggerEventOn('click', mockElement, mockOptions)

      // Assert
      expect(mockEventHandler).toHaveBeenCalledWith(
        mockElement,
        mockElement.state,
        mockElement.context,
        mockOptions
      )
    })

    test('should handle missing state and context', () => {
      // Arrange
      mockElement = {
        on: { click: mockEventHandler }
      }

      // Act
      triggerEventOn('click', mockElement, mockOptions)

      // Assert
      expect(mockEventHandler).toHaveBeenCalledWith(
        mockElement,
        undefined,
        undefined,
        mockOptions
      )
    })

    test('should handle missing options', () => {
      // Arrange
      mockElement.on.click = mockEventHandler

      // Act
      triggerEventOn('click', mockElement)

      // Assert
      expect(mockEventHandler).toHaveBeenCalledWith(
        mockElement,
        mockElement.state,
        mockElement.context,
        undefined
      )
    })
  })

  describe('event naming', () => {
    test('should handle various event names correctly', () => {
      const eventTests = [
        { input: 'mouseenter', prop: 'onMouseenter' },
        { input: 'mouseleave', prop: 'onMouseleave' },
        { input: 'submit', prop: 'onSubmit' },
        { input: 'change', prop: 'onChange' }
      ]

      for (const { input, prop } of eventTests) {
        // Arrange
        mockElement.props[prop] = mockEventHandler

        // Act
        triggerEventOn(input, mockElement, mockOptions)

        // Assert
        expect(mockEventHandler).toHaveBeenCalledWith(
          mockElement,
          mockElement.state,
          mockElement.context,
          mockOptions
        )

        // Reset for next test
        mockElement.props[prop] = undefined
        mockEventHandler.mockClear()
      }
    })
  })

  describe('edge cases', () => {
    test('should return undefined when no event handler exists', () => {
      // Act
      const result = triggerEventOn('click', mockElement, mockOptions)

      // Assert
      expect(result).toBeUndefined()
    })

    test('should handle error thrown in event handler', () => {
      // Arrange
      const error = new Error('Event handler error')
      mockElement.on.click = jest.fn(() => {
        throw error
      })

      // Act & Assert
      expect(() => triggerEventOn('click', mockElement, mockOptions)).toThrow(
        'Event handler error'
      )
    })

    test('should handle undefined element', () => {
      // Assert
      expect(() => triggerEventOn('click', undefined, mockOptions)).toThrow(
        'Element is required'
      )
    })

    test('should handle null element', () => {
      // Assert
      expect(() => triggerEventOn('click', null, mockOptions)).toThrow(
        'Element is required'
      )
    })
  })
})

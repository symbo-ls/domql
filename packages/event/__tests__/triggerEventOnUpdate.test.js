import { jest } from '@jest/globals'
import { triggerEventOnUpdate } from '../on'

describe('triggerEventOnUpdate', () => {
  let mockElement
  let mockEventHandler
  let mockUpdatedObj
  let mockOptions

  beforeEach(() => {
    mockEventHandler = jest.fn(() => 'eventResult')
    mockUpdatedObj = { updated: 'value' }
    mockOptions = { option1: 'value1' }

    mockElement = {
      state: { elementState: 'test' },
      context: { elementContext: 'test' },
      on: {},
      props: {}
    }
  })

  describe('event resolution and execution', () => {
    test('should trigger event from on property', () => {
      // Arrange
      mockElement.on.click = mockEventHandler

      // Act
      const result = triggerEventOnUpdate(
        'click',
        mockUpdatedObj,
        mockElement,
        mockOptions
      )

      // Assert
      expect(result).toBe('eventResult')
      expect(mockEventHandler).toHaveBeenCalledWith(
        mockUpdatedObj,
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
      const result = triggerEventOnUpdate(
        'click',
        mockUpdatedObj,
        mockElement,
        mockOptions
      )

      // Assert
      expect(result).toBe('eventResult')
      expect(mockEventHandler).toHaveBeenCalledWith(
        mockUpdatedObj,
        mockElement,
        mockElement.state,
        mockElement.context,
        mockOptions
      )
    })

    test('should prioritize on property over props', () => {
      // Arrange
      const onEventHandler = jest.fn(() => 'onResult')
      const propsEventHandler = jest.fn(() => 'propsResult')

      mockElement.on.click = onEventHandler
      mockElement.props.onClick = propsEventHandler

      // Act
      const result = triggerEventOnUpdate(
        'click',
        mockUpdatedObj,
        mockElement,
        mockOptions
      )

      // Assert
      expect(result).toBe('onResult')
      expect(onEventHandler).toHaveBeenCalled()
      expect(propsEventHandler).not.toHaveBeenCalled()
    })
  })

  describe('parameter handling', () => {
    test('should handle undefined state and context', () => {
      // Arrange
      mockElement = {
        on: { click: mockEventHandler }
      }

      // Act
      triggerEventOnUpdate('click', mockUpdatedObj, mockElement, mockOptions)

      // Assert
      expect(mockEventHandler).toHaveBeenCalledWith(
        mockUpdatedObj,
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
      triggerEventOnUpdate('click', mockUpdatedObj, mockElement)

      // Assert
      expect(mockEventHandler).toHaveBeenCalledWith(
        mockUpdatedObj,
        mockElement,
        mockElement.state,
        mockElement.context,
        undefined
      )
    })

    test('should handle empty updatedObj', () => {
      // Arrange
      mockElement.on.click = mockEventHandler

      // Act
      triggerEventOnUpdate('click', {}, mockElement, mockOptions)

      // Assert
      expect(mockEventHandler).toHaveBeenCalledWith(
        {},
        mockElement,
        mockElement.state,
        mockElement.context,
        mockOptions
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
        triggerEventOnUpdate(input, mockUpdatedObj, mockElement, mockOptions)

        // Assert
        expect(mockEventHandler).toHaveBeenCalledWith(
          mockUpdatedObj,
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

  describe('error handling', () => {
    test('should return undefined when no event handler exists', () => {
      // Act
      const result = triggerEventOnUpdate(
        'click',
        mockUpdatedObj,
        mockElement,
        mockOptions
      )

      // Assert
      expect(result).toBeUndefined()
    })

    test('should handle thrown error in event handler', () => {
      // Arrange
      const error = new Error('Event handler error')
      mockElement.on.click = jest.fn(() => {
        throw error
      })

      // Act & Assert
      expect(() =>
        triggerEventOnUpdate('click', mockUpdatedObj, mockElement, mockOptions)
      ).toThrow('Event handler error')
    })
  })
})

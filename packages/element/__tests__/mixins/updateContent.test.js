import { updateContent } from '../../mixins/content'

describe('updateContent', () => {
  let element
  let mockContentElement
  const contentKey = 'content'

  beforeEach(() => {
    // Set up a mock element with the required structure
    mockContentElement = {
      update: jest.fn((params, options) => {
        // Simulate the update by modifying a property
        mockContentElement.value = params.value || 'updated'
        mockContentElement.options = options
      }),
      value: 'initial',
      options: null
    }

    element = {
      __ref: {
        contentElementKey: contentKey
      }
    }

    element[contentKey] = mockContentElement

    // Bind the function to the element
    element.updateContent = updateContent
  })

  test('should update the content element with the provided parameters', () => {
    // Arrange
    const params = { value: 'new value' }
    const options = { animate: true }

    // Act
    element.updateContent(params, options)

    // Assert
    expect(mockContentElement.value).toBe('new value')
    expect(mockContentElement.options).toEqual(options)
  })

  test('should not throw error if contentElementKey exists but content element does not have update method', () => {
    // Arrange
    delete element[contentKey].update

    // Act & Assert
    expect(() => element.updateContent({}, {})).not.toThrow()
  })

  test('should do nothing if the content element does not exist', () => {
    // Arrange
    delete element[contentKey]

    // Create a spy on the element to verify no operations occur
    const spy = jest.spyOn(element, 'updateContent')

    // Act
    element.updateContent({}, {})

    // Assert
    // Verify the function was called but returned early
    expect(spy).toHaveReturnedWith(undefined)
  })

  test('should pass both parameters to the update method', () => {
    // Arrange
    const params = { id: 123 }
    const options = { delay: 500 }

    // Act
    element.updateContent(params, options)

    // Assert
    // Check that the parameters were correctly passed by examining side effects
    expect(mockContentElement.value).toBe('updated') // Default value when no params.value
    expect(mockContentElement.options).toEqual(options)
  })

  test('should find content element using the referenced contentElementKey', () => {
    // Arrange
    const alternativeContentKey = 'alternativeContent'
    const alternativeMockContent = {
      update: jest.fn(params => {
        alternativeMockContent.value = params.value || 'alternative updated'
      }),
      value: 'initial alternative'
    }

    // Set up a different content key
    element.__ref.contentElementKey = alternativeContentKey
    element[alternativeContentKey] = alternativeMockContent

    // Act
    element.updateContent({ value: 'new alternative value' })

    // Assert
    // The original content should remain unchanged
    expect(mockContentElement.value).toBe('initial')

    // The alternative content should be updated
    expect(alternativeMockContent.value).toBe('new alternative value')
  })
})

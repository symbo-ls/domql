import { assignKeyAsClassname } from '../../mixins/classList' // Adjust the import path as needed

describe('assignKeyAsClassname function', () => {
  test('should set classlist to key if element.classlist is true', () => {
    // Setup
    const element = {
      key: 'button',
      classlist: true
    }

    // Execute
    assignKeyAsClassname(element)

    // Assert
    expect(element.classlist).toBe('button')
  })

  test('should set classlist to key without underscore if key starts with single underscore', () => {
    // Setup
    const element = {
      key: '_container',
      classlist: undefined
    }

    // Execute
    assignKeyAsClassname(element)

    // Assert
    expect(element.classlist).toBe('container')
  })

  test('should not modify classlist if it already has a string value', () => {
    // Setup
    const element = {
      key: '_card',
      classlist: 'custom-card'
    }

    // Execute
    assignKeyAsClassname(element)

    // Assert
    expect(element.classlist).toBe('custom-card')
  })

  test('should not modify classlist if key does not start with underscore', () => {
    // Setup
    const element = {
      key: 'header',
      classlist: undefined
    }

    // Execute
    assignKeyAsClassname(element)

    // Assert
    expect(element.classlist).toBeUndefined()
  })

  test('should not modify classlist if key starts with double underscore', () => {
    // Setup
    const element = {
      key: '__private',
      classlist: undefined
    }

    // Execute
    assignKeyAsClassname(element)

    // Assert
    expect(element.classlist).toBeUndefined()
  })

  test('should not modify classlist if key is not a string', () => {
    // Setup
    const element = {
      key: 123,
      classlist: undefined
    }

    // Execute
    assignKeyAsClassname(element)

    // Assert
    expect(element.classlist).toBeUndefined()
  })

  test('should handle element with no classlist property', () => {
    // Setup
    const element = {
      key: '_wrapper'
    }

    // Execute
    assignKeyAsClassname(element)

    // Assert
    expect(element.classlist).toBe('wrapper')
  })

  test('should handle element with falsy classlist value that is not undefined', () => {
    // Setup
    const element = {
      key: '_section',
      classlist: null
    }

    // Execute
    assignKeyAsClassname(element)

    // Assert
    expect(element.classlist).toBe('section')
  })

  test('should handle element with empty string as classlist', () => {
    // Setup
    const element = {
      key: '_footer',
      classlist: ''
    }

    // Execute
    assignKeyAsClassname(element)

    // Assert
    expect(element.classlist).toBe('footer')
  })

  test('should handle element with no key property', () => {
    // Setup
    const element = {
      classlist: undefined
    }

    // Execute
    assignKeyAsClassname(element)

    // Assert
    expect(element.classlist).toBeUndefined()
  })
})

const { isMethod, METHODS } = require('../dist/cjs')

describe('isMethod', () => {
  test('returns true if parameter is a method', () => {
    const validMethod = 'set'
    const result = isMethod(validMethod)

    expect(result).toBe(true)
  })

  test('returns false if parameter is not a method', () => {
    const invalidMethod = 'invalidMethod'
    const result = isMethod(invalidMethod)

    expect(result).toBe(false)
  })

  test('returns false if parameter is not a string', () => {
    const invalidParam = 123
    const result = isMethod(invalidParam)

    expect(result).toBe(false)
  })

  test('returns true if parameter is a valid method in the METHODS array', () => {
    const validMethod = METHODS[0]
    const result = isMethod(validMethod)

    expect(result).toBe(true)
  })

  test('returns false if parameter is not a valid method in the METHODS array', () => {
    const invalidMethod = 'invalidMethod'
    const result = isMethod(invalidMethod)

    expect(result).toBe(false)
  })
})

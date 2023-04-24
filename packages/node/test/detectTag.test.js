const { detectTag } = require('../dist/cjs/cache')

describe('detectTag', () => {
  test('returns the tag string if it is a valid HTML tag', () => {
    const element = { tag: 'div' }
    expect(detectTag(element)).toBe('div')
  })

  test('returns the key string if the tag is a function that evaluates to true', () => {
    const element = { tag: () => true, key: 'div' }
    expect(detectTag(element)).toBe('div')
  })

  test('returns the key string if it is a valid HTML tag', () => {
    const element = { key: 'div' }
    expect(detectTag(element)).toBe('div')
  })

  test('returns "div" if the tag and key are not valid HTML tags', () => {
    const element = { tag: 'foo', key: 'bar' }
    expect(detectTag(element)).toBe('div')
  })
})

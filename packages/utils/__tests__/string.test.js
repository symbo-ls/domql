import {
  stringIncludesAny,
  trimStringFromSymbols,
  replaceLiteralsWithObjectFields,
  lowercaseFirstLetter,
  findKeyPosition,
  replaceOctalEscapeSequences,
  encodeNewlines,
  decodeNewlines,
  customEncodeURIComponent,
  customDecodeURIComponent
} from '../string'

describe('String Utils', () => {
  describe('stringIncludesAny', () => {
    it('should return true if string includes any of the characters', () => {
      expect(stringIncludesAny('hello', ['e', 'x'])).toBe(true)
      expect(stringIncludesAny('hello', ['x', 'y'])).toBe(false)
    })
  })

  describe('trimStringFromSymbols', () => {
    it('should remove specified symbols from string', () => {
      expect(trimStringFromSymbols('hello!@world', ['!', '@'])).toBe(
        'helloworld'
      )
      expect(trimStringFromSymbols('test#$test', ['#', '$'])).toBe('testtest')
    })
  })

  describe('replaceLiteralsWithObjectFields', () => {
    it('should replace {{ }} placeholders with object values', () => {
      const state = { name: 'John', age: 30 }
      expect(replaceLiteralsWithObjectFields('Hello {{name}}', state)).toBe(
        'Hello John'
      )
      expect(replaceLiteralsWithObjectFields('Age: {{age}}', state)).toBe(
        'Age: 30'
      )
    })

    it('should handle parent references', () => {
      const state = {
        name: 'Child',
        parent: { name: 'Parent' }
      }
      expect(replaceLiteralsWithObjectFields('{{../name}}', state)).toBe(
        'Parent'
      )
    })

    it('should handle triple brackets', () => {
      const state = { name: 'John' }
      expect(
        replaceLiteralsWithObjectFields('{{{name}}}', state, {
          bracketsLength: 3
        })
      ).toBe('John')
    })
  })

  describe('lowercaseFirstLetter', () => {
    it('should convert first letter to lowercase', () => {
      expect(lowercaseFirstLetter('Hello')).toBe('hello')
      expect(lowercaseFirstLetter('World')).toBe('world')
    })
  })

  describe('findKeyPosition', () => {
    it('should find key position in object string', () => {
      const str = 'const obj = {\n  name: "John",\n  age: 30\n}'
      const result = findKeyPosition(str, 'name')
      expect(result.startLineNumber).toBe(2)
      expect(result.startColumn).toBe(3)
    })
  })

  describe('replaceOctalEscapeSequences', () => {
    it('should replace octal sequences with characters', () => {
      expect(replaceOctalEscapeSequences('Hello\\040World')).toBe('Hello World')
      expect(replaceOctalEscapeSequences('\\141\\142\\143')).toBe('abc')
    })
  })

  describe('encodeNewlines and decodeNewlines', () => {
    it('should encode and decode newlines correctly', () => {
      const original = 'Hello\nWorld`$'
      const encoded = encodeNewlines(original)
      const decoded = decodeNewlines(encoded)
      expect(decoded).toBe(original)
    })
  })

  describe('customEncodeURIComponent and customDecodeURIComponent', () => {
    it('should encode and decode special characters', () => {
      const original = 'Hello @World!'
      const encoded = customEncodeURIComponent(original)
      const decoded = customDecodeURIComponent(encoded)
      expect(decoded).toBe(original)
    })
  })
})

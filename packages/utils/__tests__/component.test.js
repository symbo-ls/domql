import {
  matchesComponentNaming,
  extractComponentKeyFromElementKey,
  getCapitalCaseKeys,
  getSpreadChildren
} from '../component'

describe('Component Utils', () => {
  describe('matchesComponentNaming', () => {
    test('identifies component keys correctly', () => {
      expect(matchesComponentNaming('Button')).toBe(true)
      expect(matchesComponentNaming('button')).toBe(false)
      expect(matchesComponentNaming('123')).toBe(false)
      expect(matchesComponentNaming(null)).toBe(undefined)
    })
  })

  describe('extractComponentKeyFromElementKey', () => {
    test('extracts component key with + separator', () => {
      expect(extractComponentKeyFromElementKey('Button+Input')).toEqual([
        'Button',
        'Input'
      ])
    })

    test('extracts component key with _ separator', () => {
      expect(extractComponentKeyFromElementKey('Button_primary')).toEqual([
        'Button'
      ])
    })

    test('extracts component key with . separator', () => {
      expect(extractComponentKeyFromElementKey('Button.label')).toEqual([
        'Button'
      ])
      expect(extractComponentKeyFromElementKey('Button.Label')).toEqual([
        'Button.Label'
      ])
    })

    test('returns original key if no separator', () => {
      expect(extractComponentKeyFromElementKey('Button')).toEqual(['Button'])
    })
  })

  describe('getCapitalCaseKeys', () => {
    test('returns keys starting with capital letters', () => {
      const obj = {
        Button: {},
        input: {},
        Modal: {},
        text: {}
      }
      expect(getCapitalCaseKeys(obj)).toEqual(['Button', 'Modal'])
    })
  })

  describe('getSpreadChildren', () => {
    test('returns numeric keys', () => {
      const obj = {
        0: 'first',
        1: 'second',
        key: 'value',
        2: 'third'
      }
      expect(getSpreadChildren(obj)).toEqual(['0', '1', '2'])
    })
  })
})

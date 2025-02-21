import {
  checkIfKeyIsComponent,
  extractComponentKeyFromElementKey,
  getCapitalCaseKeys,
  getSpreadChildren,
  getChildrenComponentsByKey,
  applyKeyComponentAsExtend,
  applyComponentFromContext
} from '../component'
import { addCaching, addRef } from '../element'

describe('Component Utils', () => {
  describe('checkIfKeyIsComponent', () => {
    test('identifies component keys correctly', () => {
      expect(checkIfKeyIsComponent('Button')).toBe(true)
      expect(checkIfKeyIsComponent('button')).toBe(false)
      expect(checkIfKeyIsComponent('123')).toBe(false)
      expect(checkIfKeyIsComponent(null)).toBe(undefined)
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

  describe('getChildrenComponentsByKey', () => {
    test('finds component by key', () => {
      const element = {
        key: 'Button'
      }
      addRef(element)
      addCaching(element, {
        __ref: {}
      })
      expect(getChildrenComponentsByKey('Button', element)).toBe(element)
    })

    test('finds component by extends', () => {
      const element = {
        extends: 'Button'
      }
      addRef(element)
      addCaching(element, {
        __ref: {}
      })
      expect(getChildrenComponentsByKey('Button', element)).toBe(element)
    })

    test('finds component by array extends', () => {
      const element = {
        extends: ['Button', 'Input']
      }
      addRef(element)
      addCaching(element, {
        __ref: {}
      })
      expect(getChildrenComponentsByKey('Button', element)).toBe(element)
    })

    test('finds component by parent childExtends', () => {
      const element = {
        parent: {
          childExtends: 'Button'
        }
      }
      addRef(element)
      addCaching(element, {
        __ref: {}
      })
      expect(getChildrenComponentsByKey('Button', element)).toBe(element)
    })

    test('finds component by parent array childExtends', () => {
      const element = {
        parent: {
          childExtends: ['Button', 'Input']
        }
      }
      addRef(element)
      addCaching(element, {
        __ref: {}
      })
      expect(getChildrenComponentsByKey('Button', element)).toBe(element)
      expect(getChildrenComponentsByKey('Input', element)).toBe(element)
      expect(getChildrenComponentsByKey('Modal', element)).toBeUndefined()
    })
  })

  describe('applyKeyComponentAsExtend', () => {
    test('applies component extend from key', () => {
      const parent = {
        context: {
          components: {
            Button: { type: 'button' }
          }
        }
      }
      const element = { className: 'test' }
      const result = applyKeyComponentAsExtend(element, parent, 'Button')
      expect(result).toHaveProperty('className', 'test')
    })
  })

  describe('applyComponentFromContext', () => {
    test('applies string extend from context', () => {
      const element = {
        extends: 'Button',
        context: {
          components: {
            Button: { type: 'button' }
          }
        }
      }
      applyComponentFromContext(element, null, { verbose: false })
      expect(element.extends).toEqual({ type: 'button' })
    })

    test('applies array extend from context', () => {
      const element = {
        extends: ['Button'],
        context: {
          components: {
            Button: { type: 'button' }
          }
        }
      }
      applyComponentFromContext(element, null, { verbose: false })
      expect(element.extends).toEqual({ type: 'button' })
    })

    test('handles non-existent components', () => {
      const element = {
        extends: 'NonExistent',
        context: {
          components: {}
        }
      }
      applyComponentFromContext(element, null, { verbose: false })
      expect(element.extends).toEqual({})
    })
  })
})

import { jest } from '@jest/globals'
import { createValidDomqlObjectFromSugar } from '../../utils/component'

describe('createValidDomqlObjectFromSugar', () => {
  it('initializes newElem with empty props and define', () => {
    const el = {}
    const result = createValidDomqlObjectFromSugar(el)
    expect(result.props).toEqual({})
    expect(result.define).toEqual({})
  })

  it('adds component keys (starting with uppercase) to newElem directly', () => {
    const el = { Header: 'HeaderComponent', Button: () => {} }
    const result = createValidDomqlObjectFromSugar(el)
    expect(result).toHaveProperty('Header', 'HeaderComponent')
    expect(result).toHaveProperty('Button', el.Button)
    expect(result.props).not.toHaveProperty('Header')
    expect(result.props).not.toHaveProperty('Button')
  })

  describe('allowed keys', () => {
    const allowedKeys = ['data', 'state', 'attr', 'if']
    allowedKeys.forEach(key => {
      it(`adds "${key}" key to newElem directly`, () => {
        const value = { test: 'value' }
        const result = createValidDomqlObjectFromSugar({ [key]: value })
        expect(result[key]).toEqual(value)
        expect(result.props[key]).toBeUndefined()
      })
    })
  })

  it('adds keys in DOMQ_PROPERTIES to newElem directly', () => {
    const el = { domqKey: 'test-value' }
    const result = createValidDomqlObjectFromSugar(el)
    expect(result.domqKey).toBeUndefined()
    expect(result.props.domqKey).toEqual('test-value')
  })

  it('adds non-component, non-allowed, non-DOMQ keys to props', () => {
    const el = {
      className: 'container',
      onClick: jest.fn(),
      'data-test': '123',
      42: 'numeric-key'
    }
    const result = createValidDomqlObjectFromSugar(el)
    expect(result.props.className).toBe('container')
    expect(result.props.onClick).toBe(el.onClick)
    expect(result.props['data-test']).toBe('123')
    expect(result.props[42]).toBe('numeric-key')
    expect(result).not.toHaveProperty('className')
    expect(result).not.toHaveProperty('onClick')
  })

  it('handles numeric keys by adding them to props', () => {
    const el = { 0: 'zero', 1: 'one' }
    const result = createValidDomqlObjectFromSugar(el)
    expect(result.props[0]).toBe('zero')
    expect(result.props[1]).toBe('one')
    expect(result).not.toHaveProperty('0')
  })
})

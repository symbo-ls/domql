import { parseDeep } from '../../methods/v2'

describe('parseDeep', () => {
  it('parses nested objects recursively', () => {
    const element = {
      name: 'parent',
      child: { name: 'child' }
    }

    const result = parseDeep.call(element)
    expect(result).toEqual({
      name: 'parent',
      child: { name: 'child' }
    })
  })

  it('applies exclusion list to all levels', () => {
    const element = {
      secret: 'top',
      nested: {
        secret: 'middle',
        child: {
          secret: 'bottom',
          public: 'data'
        }
      }
    }

    const result = parseDeep.call(element, ['secret'])
    expect(result).toEqual({
      nested: {
        child: {
          public: 'data'
        }
      }
    })
  })

  it('handles non-object values', () => {
    const element = {
      number: 42,
      string: 'text',
      boolean: true,
      nullValue: null,
      undefinedValue: undefined
    }

    const result = parseDeep.call(element)
    expect(result).toEqual({
      number: 42,
      string: 'text',
      boolean: true,
      nullValue: null
    })
  })

  it('returns empty object for empty input', () => {
    const result = parseDeep.call({})
    expect(result).toEqual({})
  })

  it('should not ignore inherited properties', () => {
    const parent = { inherited: 'value' }
    const element = Object.create(parent)
    element.own = 'property'

    const result = parseDeep.call(element)
    expect(result).toEqual({ inherited: 'value', own: 'property' })
  })

  it('handles complex nested structures', () => {
    const element = {
      meta: {
        author: {
          name: 'John',
          contact: {
            email: 'john@example.com',
            _internal: 'private'
          }
        }
      },
      _version: 2
    }

    const result = parseDeep.call(element, ['_internal', '_version'])
    expect(result).toEqual({
      meta: {
        author: {
          name: 'John',
          contact: {
            email: 'john@example.com'
          }
        }
      }
    })
  })

  it('preserves array structures', () => {
    const element = {
      items: [
        { id: 1, value: 'test' },
        { id: 2, value: 'demo' }
      ]
    }

    // Assuming array handling is enabled
    const result = parseDeep.call(element, ['id'])
    expect(result).toEqual({
      items: {
        0: { value: 'test' },
        1: { value: 'demo' }
      }
    })
  })

  it('handles circular references safely', () => {
    const parent = {}
    const child = { parent }
    parent.child = child

    const result = parseDeep.call(parent)
    expect(result.child.parent).toBeUndefined() // Circular reference broken
  })

  it('skips processing for non-object-like values', () => {
    const element = {
      date: new Date(),
      buffer: Buffer.from('test'),
      func: () => {}
    }

    const result = parseDeep.call(element)
    expect(result.date instanceof Date).toBe(false)
    expect(result.buffer instanceof Buffer).toBe(false)
    expect(typeof result.func).toBe('function')
  })
})

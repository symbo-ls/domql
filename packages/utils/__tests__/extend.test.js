import {
  generateHash,
  getHashedExtend,
  setHashedExtend,
  getExtendStackRegistry,
  extractArrayExtend,
  deepExtend,
  flattenExtend,
  deepMergeExtend,
  cloneAndMergeArrayExtend,
  fallbackStringExtend,
  jointStacks,
  getExtendStack,
  addExtend,
  applyAdditionalExtend,
  getExtendsInElement
} from '../extend.js'

describe('Hash functions', () => {
  test('generateHash returns string', () => {
    expect(typeof generateHash()).toBe('string')
    expect(generateHash()).not.toBe(generateHash())
  })

  test('setHashedExtend and getHashedExtend', () => {
    const extend = {}
    const stack = ['item1', 'item2']
    setHashedExtend(extend, stack)
    expect(extend.__hash).toBeDefined()
    expect(getHashedExtend(extend)).toEqual(stack)
  })

  test('getExtendStackRegistry with hashed extend', () => {
    const extend = {}
    const initialStack = ['item1']
    const hashedStack = ['item2', 'item3']

    // Setup a hashed extend
    setHashedExtend(extend, hashedStack)

    // Test getting the registry with hashed extend
    const result = getExtendStackRegistry(extend, initialStack)
    expect(result).toEqual(initialStack.concat(hashedStack))
  })

  test('getExtendStackRegistry with non-hashed extend', () => {
    const extend = { prop: 'value' }
    const stack = ['item1', 'item2']

    // Test getting the registry with non-hashed extend
    const result = getExtendStackRegistry(extend, stack)
    expect(result).toBe(stack)
    expect(extend.__hash).toBeDefined()
  })
})

describe('Extend stacking', () => {
  test('extractArrayExtend handles array of extends', () => {
    const extend = [{ prop: 1 }, { prop: 2 }]
    const stack = []
    extractArrayExtend(extend, stack)
    expect(stack).toEqual(extend)
  })

  test('deepExtend processes nested extends', () => {
    const extend = { extends: { prop: 'value' } }
    const stack = []
    deepExtend(extend, stack)
    expect(stack).toEqual([{ prop: 'value' }])
  })

  test('flattenExtend handles various input types', () => {
    const stack = []
    expect(flattenExtend(null, stack)).toEqual(stack)
    expect(flattenExtend([{ prop: 1 }], stack)).toEqual([{ prop: 1 }])
    expect(flattenExtend({ prop: 'value' }, [])).toEqual([{ prop: 'value' }])
  })
})

describe('Merge operations', () => {
  test('deepMergeExtend merges objects correctly', () => {
    const element = { a: 1, b: { c: 2 } }
    const extend = { b: { d: 3 }, e: 4 }
    const result = deepMergeExtend(element, extend)
    expect(result).toEqual({ a: 1, b: { c: 2, d: 3 }, e: 4 })
  })

  test('cloneAndMergeArrayExtend merges array of objects', () => {
    const stack = [{ a: 1 }, { b: 2 }]
    const result = cloneAndMergeArrayExtend(stack)
    expect(result).toEqual({ a: 1, b: 2 })
  })
})

describe('String extend handling', () => {
  test('fallbackStringExtend handles component strings', () => {
    const context = {
      components: {
        test: { prop: 'value' }
      }
    }
    expect(fallbackStringExtend('test', context)).toEqual({ prop: 'value' })
    expect(fallbackStringExtend('nonexistent', context)).toEqual({})
  })
})

describe('Stack operations', () => {
  test('jointStacks combines stacks correctly', () => {
    const stack1 = [1, 2, 3]
    const stack2 = [4, 5, 6]
    expect(jointStacks(stack1, stack2)).toEqual([1, 4, 2, 3, 5, 6])
  })

  test('getExtendStack processes extends correctly', () => {
    const extend = { prop: 'value' }
    expect(getExtendStack(extend)).toEqual([extend])
  })
})

describe('Additional extend operations', () => {
  test('addExtend combines extends', () => {
    const result = addExtend({ a: 1 }, { b: 2 })
    expect(result).toEqual([{ a: 1 }, { b: 2 }])
  })

  test('applyAdditionalExtend adds extends to element', () => {
    const element = { extends: { a: 1 } }
    const newExtend = { b: 2 }
    const result = applyAdditionalExtend(newExtend, element)
    expect(result.extends).toEqual([{ b: 2 }, { a: 1 }])
  })

  test('getExtendsInElement finds all extends', () => {
    const obj = {
      Component: true,
      extends: 'BaseComponent',
      nested: {
        OtherComponent: true,
        extends: ['Component1', 'Component2']
      }
    }
    const result = getExtendsInElement(obj)
    expect(result).toContain('Component')
    expect(result).toContain('BaseComponent')
    expect(result).toContain('OtherComponent')
    expect(result).toContain('Component1')
    expect(result).toContain('Component2')
  })
})

describe('Complex extend scenarios', () => {
  test('handles deeply nested extends', () => {
    const extend = {
      extends: {
        extends: {
          extends: { prop: 'deepValue' }
        }
      }
    }
    const stack = []
    deepExtend(extend, stack)
    expect(stack).toEqual([
      {
        prop: 'deepValue'
      }
    ])
  })

  test('handles multiple levels of array extends', () => {
    const extend = [
      { a: 1 },
      [{ b: 2 }, { c: 3 }],
      { extends: [{ d: 4 }, { e: 5 }] }
    ]
    const stack = []
    flattenExtend(extend, stack)

    // Should flatten all nested arrays and extends without duplicating objects
    expect(stack).toEqual([{ a: 1 }, { b: 2 }, { c: 3 }, { d: 4 }, { e: 5 }])
  })

  test('merges complex nested structures', () => {
    const element = {
      a: 1,
      b: { c: 2, d: { e: 3 } },
      f: [1, 2, { g: 3 }]
    }
    const extend = {
      b: { d: { h: 4 }, i: 5 },
      f: [4, { j: 5 }],
      k: 6
    }
    const result = deepMergeExtend(element, extend)
    expect(result).toEqual({
      a: 1,
      b: { c: 2, d: { e: 3, h: 4 }, i: 5 },
      f: [1, 2, { g: 3 }, 4, { j: 5 }],
      k: 6
    })
  })

  test('handles mixed string and object extends in context', () => {
    const context = {
      components: {
        Base: { base: true },
        'Base.variant': { variant: true },
        'smbls.Button': { button: true }
      }
    }
    const extends1 = ['Base', { custom: true }]
    const extends2 = ['Base.variant', 'smbls.Button']

    const stack1 = []
    const stack2 = []
    flattenExtend(extends1, stack1, context)
    flattenExtend(extends2, stack2, context)

    expect(stack1).toEqual([{ base: true }, { custom: true }])
    expect(stack2).toEqual([{ variant: true }, { button: true }])
  })

  test('correctly processes complex getExtendStack scenarios', () => {
    const baseExtend = {
      extends: [{ common: true }, { extends: { nested: true } }]
    }
    const childExtend = {
      extends: baseExtend
    }

    const stack = getExtendStack(childExtend)
    expect(stack).toContainEqual({ common: true })
    expect(stack).toContainEqual({ nested: true })
  })

  test('handles circular references in extends', () => {
    const extendA = { name: 'A', value: 1 }
    const extendB = { name: 'B', value: 2 }
    const extendC = { name: 'C', value: 3 }

    // Create circular reference chain: A -> B -> C -> A
    extendA.extends = extendB
    extendB.extends = extendC
    extendC.extends = extendA

    const stack = []
    flattenExtend(extendA, stack)

    // Should process each extend exactly once
    expect(stack).toHaveLength(3)
    expect(stack).toEqual([
      { name: 'C', value: 3 },
      { name: 'B', value: 2 },
      { name: 'A', value: 1 }
    ])
  })

  test('complex component inheritance chain', () => {
    const context = {
      components: {
        BaseComponent: { base: true, method: () => {} },
        ExtendedComponent: {
          extends: 'BaseComponent',
          extended: true
        },
        FinalComponent: {
          extends: ['ExtendedComponent', { custom: true }],
          final: true
        }
      }
    }

    const result = getExtendStack('FinalComponent', context)
    expect(result).toEqual([
      { base: true, method: expect.any(Function) },
      { extended: true },
      { custom: true },
      { final: true }
    ])
  })
})

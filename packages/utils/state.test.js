import {
  getRootStateInKey,
  getParentStateInKey,
  getChildStateInKey,
  findInheritedState,
  createInheritedState,
  checkIfInherits,
  isState,
  createNestedObjectByKeyPath
} from './state.js'

describe('getRootStateInKey', () => {
  it('should return root state when key contains "~/"', () => {
    const parentState = { root: { foo: 'bar' } }
    expect(getRootStateInKey('~/some/path', parentState)).toEqual({
      foo: 'bar'
    })
  })

  it('should return undefined when key does not contain "~/"', () => {
    const parentState = { root: { foo: 'bar' } }
    expect(getRootStateInKey('some/path', parentState)).toBeUndefined()
  })

  it('should handle multiple root references', () => {
    const parentState = {
      root: {
        deep: { nested: { value: 42 } },
        array: [1, 2, 3]
      }
    }
    expect(getRootStateInKey('~/deep/nested/value', parentState)).toEqual(
      parentState.root
    )
    expect(getRootStateInKey('~/array/0', parentState)).toEqual(
      parentState.root
    )
  })
})

describe('getParentStateInKey', () => {
  it('should traverse up parent states according to "../" count', () => {
    const state3 = { value: 3, parent: null }
    const state2 = { value: 2, parent: state3 }
    const state1 = { value: 1, parent: state2 }

    expect(getParentStateInKey('../path', state1)).toBe(state2)
    expect(getParentStateInKey('../../path', state1)).toBe(state3)
  })

  it('should handle deep parent traversal with mixed paths', () => {
    const state4 = { value: 4, parent: null }
    const state3 = { value: 3, parent: state4 }
    const state2 = { value: 2, parent: state3 }
    const state1 = { value: 1, parent: state2 }

    expect(getParentStateInKey('../../../value', state1)).toBe(state4)
    expect(getParentStateInKey('../../../../value', state1)).toBeNull()
  })

  it('should handle non-existent parent gracefully', () => {
    const state = { value: 1 }
    expect(getParentStateInKey('../path', state)).toBeNull()
  })
})

describe('getChildStateInKey', () => {
  it('should traverse down state tree and create missing objects', () => {
    const parentState = {}
    const result = getChildStateInKey('a/b/c', parentState)
    expect(parentState).toEqual({ a: { b: { c: {} } } })
  })

  it('should protect against prototype pollution', () => {
    const parentState = {}
    const result = getChildStateInKey('__proto__/polluted', parentState)
    expect(result).toBeUndefined()
  })

  it('should handle array indices in paths', () => {
    const parentState = { items: [] }
    const result = getChildStateInKey('items/0/name', parentState)
    expect(parentState.items[0]).toEqual({ name: {} })
  })

  it('should handle complex nested paths', () => {
    const parentState = {}
    getChildStateInKey('users/123/posts/456/comments/789', parentState)
    expect(parentState.users['123'].posts['456'].comments['789']).toEqual({})
  })

  it('should preserve existing values', () => {
    const parentState = { existing: { value: 42 } }
    getChildStateInKey('existing/nested', parentState)
    expect(parentState.existing.value).toBe(42)
    expect(parentState.existing.nested).toEqual({})
  })
})

describe('createNestedObjectByKeyPath', () => {
  it('should create nested object structure from path', () => {
    const result = createNestedObjectByKeyPath('a/b/c', 'value')
    expect(result).toEqual({ a: { b: { c: 'value' } } })
  })

  it('should return empty object when no path provided', () => {
    expect(createNestedObjectByKeyPath()).toEqual({})
  })
})

describe('isState', () => {
  it('should identify valid state objects', () => {
    const validState = {
      update: () => {},
      parse: () => {},
      clean: () => {},
      create: () => {},
      parent: {},
      destroy: () => {},
      rootUpdate: () => {},
      parentUpdate: () => {},
      keys: [],
      values: [],
      toggle: () => {},
      replace: () => {},
      quietUpdate: () => {},
      quietReplace: () => {},
      add: () => {},
      apply: () => {},
      applyReplace: () => {},
      setByPath: () => {},
      setPathCollection: () => {},
      removeByPath: () => {},
      removePathCollection: () => {},
      getByPath: () => {},
      applyFunction: () => {},
      __element: {},
      __children: []
    }
    expect(isState(validState)).toBe(true)
  })

  it('should reject invalid state objects', () => {
    expect(isState({})).toBe(false)
    expect(isState(null)).toBe(false)
    expect(isState(undefined)).toBe(false)
  })
})

describe('checkIfInherits', () => {
  it('should identify inheritable elements', () => {
    const element = { __ref: { __state: 'some/path' } }
    expect(checkIfInherits(element)).toBe(true)
  })

  it('should reject non-inheritable elements', () => {
    const element = { __ref: {} }
    expect(checkIfInherits(element)).toBe(false)
  })
})

describe('createInheritedState and findInheritedState', () => {
  const parent = {
    state: {
      foo: { bar: { value: 'test' } },
      root: { rootValue: 'root' }
    }
  }

  it('should create inherited state for object paths', () => {
    const element = {
      __ref: { __state: 'foo/bar' },
      state: {}
    }
    const result = createInheritedState(element, parent)
    expect(result).toEqual({ value: 'test' })
  })

  it('should handle root state references', () => {
    const element = {
      __ref: { __state: '~/rootValue' },
      state: {}
    }
    const inherited = findInheritedState(element, parent)
    expect(inherited).toBe('root')
  })
})

describe('findInheritedState', () => {
  const complexParent = {
    state: {
      users: {
        admin: { permissions: ['read', 'write'] },
        guest: { permissions: ['read'] }
      },
      settings: {
        theme: { dark: true },
        language: 'en'
      },
      root: {
        globalConfig: { version: '1.0.0' }
      },
      parent: {
        settings: {
          theme: { dark: false }
        }
      }
    }
  }

  // Set up proper parent reference
  complexParent.state.parent = complexParent.state

  it('should handle deep inheritance chains', () => {
    const element = {
      __ref: { __state: 'users/admin/permissions' }
    }
    const result = findInheritedState(element, complexParent)
    expect(result).toEqual(['read', 'write'])
  })

  it('should handle mixed path types', () => {
    const element = {
      __ref: { __state: '../settings/theme' },
      state: {}
    }
    // Create proper context for relative path resolution
    const contextParent = {
      state: {
        someContext: {},
        parent: complexParent.state
      }
    }
    const result = findInheritedState(element, contextParent)
    expect(result).toEqual({ dark: true })
  })

  it('should handle root path references', () => {
    const element = {
      __ref: { __state: '~/globalConfig' },
      state: {}
    }
    const result = findInheritedState(element, complexParent)
    expect(result).toEqual({ version: '1.0.0' })
  })
})

describe('createInheritedState', () => {
  const parent = {
    state: {
      foo: { bar: { value: 'test' } },
      root: { rootValue: 'root' }
    }
  }

  it('should create inherited state for object paths', () => {
    const element = {
      __ref: { __state: 'foo/bar' },
      state: {}
    }
    const result = createInheritedState(element, parent)
    expect(result).toEqual({ value: 'test' })
  })

  it('should handle root state references', () => {
    const element = {
      __ref: { __state: '~/rootValue' },
      state: {}
    }
    const inherited = findInheritedState(element, parent)
    expect(inherited).toBe('root')
  })

  it('should handle primitive type inheritance', () => {
    const parent = {
      state: {
        numbers: {
          count: 42,
          enabled: true,
          name: 'test'
        }
      }
    }

    const numberElement = {
      __ref: { __state: 'numbers/count' },
      state: {}
    }
    expect(createInheritedState(numberElement, parent)).toEqual({ value: 42 })

    const boolElement = {
      __ref: { __state: 'numbers/enabled' },
      state: {}
    }
    expect(createInheritedState(boolElement, parent)).toEqual({ value: true })
  })

  it('should properly clone nested arrays', () => {
    const parent = {
      state: {
        data: {
          matrix: [
            [1, 2],
            [3, 4]
          ],
          items: [{ id: 1 }, { id: 2 }]
        }
      }
    }

    const element = {
      __ref: { __state: 'data' },
      state: {}
    }

    const result = createInheritedState(element, parent)
    expect(result.matrix).toEqual([
      [1, 2],
      [3, 4]
    ])
    expect(result.items).toEqual([{ id: 1 }, { id: 2 }])
    // Verify deep clone
    result.matrix[0][0] = 999
    expect(parent.state.data.matrix[0][0]).toBe(1)
  })
})

describe('performance tests', () => {
  it('should handle large nested state structures', () => {
    const deepState = {}
    let current = deepState
    for (let i = 0; i < 100; i++) {
      current.child = {}
      current = current.child
    }

    const path = Array(100).fill('child').join('/')
    const result = getChildStateInKey(path, deepState)
    expect(result).toEqual({})
  })

  it('should handle multiple concurrent state operations', () => {
    const parent = { state: { root: {} } }
    const operations = Array(1000)
      .fill(0)
      .map((_, i) => ({
        __ref: { __state: `~/path${i}` },
        state: {}
      }))

    const start = performance.now()
    operations.forEach(element => {
      createInheritedState(element, parent)
    })
    const end = performance.now()
    expect(end - start).toBeLessThan(1000) // Should complete in less than 1 second
  })
})

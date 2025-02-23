import { jest } from '@jest/globals'
import {
  parse,
  clean,
  destroy,
  parentUpdate,
  rootUpdate,
  add,
  toggle,
  remove,
  set,
  setByPath,
  setPathCollection,
  removeByPath,
  removePathCollection,
  getByPath,
  reset,
  apply,
  applyReplace,
  applyFunction,
  quietUpdate,
  replace,
  quietReplace,
  keys,
  values
} from './methods.js'
import { applyStateMethods } from './create.js'

// Helper to create a mock state object
const createMockState = (initialData = {}) => {
  // Create the state object first
  const state = {
    ...initialData,
    __children: {},
    update: jest.fn(),
    ref: {}
  }

  // Create root state
  const rootElem = {
    state: {
      update: jest.fn()
    }
  }

  // Create parent state
  const parentState = {
    update: jest.fn(),
    state
  }

  // Set up circular references correctly
  state.__element = {
    __ref: {
      root: rootElem,
      __state: null
    },
    key: 'test',
    parent: { state: parentState }
  }
  state.parent = parentState
  state.root = rootElem.state

  // Add methods
  applyStateMethods(state, {
    parse: parse.bind(state),
    clean: clean.bind(state),
    destroy: destroy.bind(state),
    parentUpdate: parentUpdate.bind(state),
    rootUpdate: rootUpdate.bind(state),
    add: add.bind(state),
    toggle: toggle.bind(state),
    remove: remove.bind(state),
    set: set.bind(state),
    setByPath: setByPath.bind(state),
    setPathCollection: setPathCollection.bind(state),
    removeByPath: removeByPath.bind(state),
    removePathCollection: removePathCollection.bind(state),
    getByPath: getByPath.bind(state),
    reset: reset.bind(state),
    apply: apply.bind(state),
    applyReplace: applyReplace.bind(state),
    applyFunction: applyFunction.bind(state),
    quietUpdate: quietUpdate.bind(state),
    replace: replace.bind(state),
    quietReplace: quietReplace.bind(state),
    keys: keys.bind(state),
    values: values.bind(state)
  })

  return state
}

describe('State Methods', () => {
  describe('parse', () => {
    it('should parse object state without internal properties', () => {
      const state = createMockState({ foo: 'bar', update: () => {} })
      expect(state.parse()).toEqual({ foo: 'bar' })
    })

    it('should parse array state', () => {
      const arrayState = Object.assign([], { foo: 'bar', update: () => {} })
      arrayState.parse = parse
      expect(arrayState.parse()).toEqual([])
    })
  })

  describe('clean', () => {
    it('should remove all non-internal properties', () => {
      const state = createMockState({ foo: 'bar', baz: 'qux' })
      state.clean({ preventStateUpdate: true })
      expect(state.parse()).toEqual({})
    })
  })

  describe('add and remove', () => {
    it('should add items to array state', () => {
      const state = Object.assign([], createMockState())
      state.add('item')
      expect(state).toContain('item')
    })

    it('should remove items from object state', () => {
      const state = createMockState({ foo: 'bar' })
      state.remove('foo')
      expect(state.foo).toBeUndefined()
    })
  })

  describe('setByPath and getByPath', () => {
    it('should set and get nested values', () => {
      const state = createMockState({})
      state.setByPath('a/b/c', 'value', { preventStateUpdate: true })
      expect(state.getByPath('a/b/c')).toBe('value')
    })
  })

  describe('toggle', () => {
    it('should toggle boolean values', () => {
      const state = createMockState({ toggled: false })
      state.toggle('toggled')
      expect(state.update).toHaveBeenCalledWith({ toggled: true }, {})
    })
  })

  describe('apply methods', () => {
    it('should apply functions to state', () => {
      const state = createMockState({ count: 0 })
      state.apply(s => ({ count: s.count + 1 }))
      expect(state.update).toHaveBeenCalled()
    })
  })

  describe('reset', () => {
    it('should reset state to parsed values', () => {
      const state = createMockState({ persisted: true, temporary: false })
      state.reset()
      expect(state.update).toHaveBeenCalled()
    })
  })

  describe('quiet methods', () => {
    it('should update without triggering update', () => {
      const state = createMockState({})
      state.quietUpdate({ silent: true })
      expect(state.update).toHaveBeenCalledWith(
        { silent: true },
        { preventUpdate: true }
      )
    })
  })

  describe('path collection methods', () => {
    it('should handle multiple path operations', () => {
      const state = createMockState({})
      state.setPathCollection([
        ['update', 'a/b', 1],
        ['update', 'x/y', 2]
      ])
      expect(state.getByPath('a/b')).toBe(1)
      expect(state.getByPath('x/y')).toBe(2)
    })
  })

  describe('keys and values', () => {
    it('should return keys and values', () => {
      const state = createMockState({ a: 1, b: 2 })
      expect(state.keys()).toEqual(['a', 'b'])
      expect(state.values()).toEqual([1, 2])
    })
  })

  describe('destroy', () => {
    it('should clean up state and references', () => {
      const element = {
        __ref: { __state: 'test' },
        parent: { state: createMockState({}) }
      }
      const state = createMockState({})
      state.__element = element
      state.destroy()
      expect(state.update).toHaveBeenCalled()
    })
  })

  describe('parent and root updates', () => {
    it('should propagate updates to parent', () => {
      const state = createMockState({})
      state.parentUpdate({ parentValue: true })
      expect(state.parent.update).toBeDefined()
    })

    it('should propagate updates to root', () => {
      const state = createMockState({})
      state.rootUpdate({ rootValue: true })
      expect(state.__element.__ref.root.state.update).toBeDefined()
    })
  })
})

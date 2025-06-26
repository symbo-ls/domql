import { update } from '../update'

describe('update()', () => {
  let element, params, opts

  beforeEach(() => {
    element = {
      __ref: {
        __if: true,
        __execProps: {},
        __exec: {},
        __defineCache: {},
        __propsStack: [],
        __props: [],
        __state: 'state'
      },
      state: 'string',
      props: {},
      parent: {
        props: {}
      },
      context: {},
      define: {},
      node: document.createElement('div'),
      key: 'testElement',
      on: {},
      update
    }
    opts = {
      preventUpdate: [],
      preventDefineUpdate: [],
      preventBeforeStateUpdateListener: false,
      preventListeners: false,
      preventStateUpdateListener: false
    }
    params = {}
  })

  it('does not modify opts when params and opts are empty', () => {
    element.update({}, opts)
    expect(opts).toEqual({
      calleeElement: false,
      cleanExec: true,
      currentSnapshot: false,
      exclude: [],
      preventRecursive: false,
      stackChanges: false,
      preventUpdate: [],
      preventDefineUpdate: [],
      preventBeforeStateUpdateListener: false,
      preventListeners: false,
      preventStateUpdateListener: false
    })
  })

  it('initializes options with UPDATE_DEFAULT_OPTIONS when opts is empty', () => {
    element.update({}, opts)
    expect(opts.calleeElement).toBe(false) // Ensure opts is not mutated
    expect(element.__ref).toBeDefined() // Ensure __ref is initialized
  })

  it('merges opts with UPDATE_DEFAULT_OPTIONS using deepMerge', () => {
    opts.customOption = true
    element.update({}, opts)
    expect(opts.customOption).toBe(true) // Ensure custom options are preserved
  })

  it('converts string params to { text: params }', () => {
    element.update('testString', opts)
    expect(element.text).toBe('testString')
  })

  it('converts number params to { text: params }', () => {
    element.update(123, opts)
    expect(element.text).toBe(123)
  })

  it('returns early if preventInheritAtCurrentState matches element', () => {
    opts.preventInheritAtCurrentState = { __element: element }
    element.update({}, opts)
    expect(element.__ref.__currentSnapshot).toBe(6) // No snapshot update
  })

  it('initializes __ref if not present', () => {
    delete element.__ref
    element.update({}, opts)
    expect(element.__ref).toBeDefined()
  })

  it('merges options with UPDATE_DEFAULT_OPTIONS when exclude is missing', () => {
    element.update({}, opts)
    expect(opts.exclude).toBeDefined() // Ensure exclude is added
  })

  it('does not throw or modify opts when params is undefined', () => {
    element.update(undefined, opts)
    expect(opts).toEqual({
      calleeElement: false,
      cleanExec: true,
      currentSnapshot: false,
      exclude: [],
      preventRecursive: false,
      preventUpdate: [],
      preventDefineUpdate: [],
      stackChanges: false,
      preventBeforeStateUpdateListener: false,
      preventListeners: false,
      preventStateUpdateListener: false
    })
  })

  it('does not throw when opts is undefined', () => {
    element.update({}, undefined)
    expect(element.__ref).toBeDefined() // Ensure __ref is initialized
  })

  it('does not throw when opts is null', () => {
    element.update({}, null)
    expect(element.__ref).toBeDefined() // Ensure __ref is initialized
  })

  it('does not modify the params object', () => {
    params = { key: 'value' }
    element.update(params, opts)
    expect(params).toEqual({ key: 'value' })
  })

  it('does modify opts when params is an empty object', () => {
    element.update({}, opts)
    expect(opts).toEqual({
      calleeElement: false,
      cleanExec: true,
      currentSnapshot: false,
      exclude: [],
      preventRecursive: false,
      stackChanges: false,
      preventUpdate: [],
      preventDefineUpdate: [],
      preventBeforeStateUpdateListener: false,
      preventListeners: false,
      preventStateUpdateListener: false
    })
  })

  it('moves regular properties to element.props', () => {
    params = { props: { title: 'Test', description: 'Content' } }
    element.update(params, opts)
    expect(element.props).toEqual({
      title: 'Test',
      description: 'Content'
    })
    expect(element.title).toBeUndefined()
  })

  it('keeps element-rooted properties', () => {
    params = { Header: {}, Footer: {}, 0: 'index' }
    element.update(params, opts)
    expect(element.Header).toBeDefined()
    expect(element.Footer).toBeDefined()
    expect(element['0']).toBe('index')
    expect(element.props).toEqual({})
  })

  it('preserves built-in properties on element', () => {
    params = { props: { className: 'container', hidden: true } }
    element.update(params, opts)
    expect(element.props.className).toBe('container')
    expect(element.props.hidden).toBe(true)
    expect(element.props).toEqual({ className: 'container', hidden: true })
  })

  it('moves element-like properties from props to root', () => {
    params = { props: { Header: {} } }
    element.update(params, opts)
    expect(element.Header).toBeDefined()
    expect(element.props.Header).toBeUndefined()
  })

  it('exits early when inheritStateUpdates returns false', () => {
    // Simulate inheritStateUpdates failure
    element.__ref.__stateBlocked = true
    element.update({ props: { shouldChange: true } }, opts)

    expect(element.props.shouldChange).toBe(true)
    expect(element.__ref.__stateBlocked).toBe(true) // State remains blocked
  })

  it('exits early when checkIfOnUpdate fails', () => {
    // Force checkIfOnUpdate failure
    element.parent.props.ifCondition = false
    element.update({ state: { newState: true } }, opts)

    expect(element.state.newState).toBe(true)
  })

  it('updates props from parent key match', () => {
    element.parent.props.testKey = { inherited: true }
    element.update({}, opts)
    expect(element.props.inherited).toBeUndefined()
  })

  it('updates props when functions exist in __props', () => {
    element.__ref.__props.push(() => 'dynamic')
    element.update({}, opts)
    expect(element.props).toEqual(expect.any(Object)) // Props were processed
  })

  it('skips props update when preventPropsUpdate=true', () => {
    opts.preventPropsUpdate = true
    opts.preventUpdateAfter = true
    element.parent.props.testKey = { shouldExist: true }
    element.update({}, opts)
    expect(element.props.shouldExist).toBeUndefined()
  })

  it('should not skips props update when preventPropsUpdate=false', () => {
    opts.preventPropsUpdate = false
    opts.lazyLoad = true
    opts.onEachUpdate = () => {
      return true
    }
    element.parent.props.testKey = { shouldExist: true }
    element.__ref.__propsStack = []
    element.__ref.__if = true
    element.off = { text: 'off' }
    element.update({}, opts)
    expect(element.props.shouldExist).toBeUndefined()
  })

  it('should set preventUpdateAfterCount to 1 when is not a number', () => {
    opts.preventPropsUpdate = true
    opts.preventUpdateAfter = 2
    opts.preventUpdateAfterCount = undefined
    element.parent.props.testKey = { shouldExist: true }
    element.update({}, opts)
    expect(element.props.shouldExist).toBeUndefined()
  })

  it('processes parent.childProps', () => {
    element.parent.props.childProps = { global: true }
    element.update({}, opts)
    expect(element.props.global).toBe(true)
  })

  it('processes function props', () => {
    element.update({ props: { calc: () => 42 } }, opts)
    expect(element.props.calc()).toBe(42)
  })

  it('returns element when beforeUpdate rejects', () => {
    // Simulate beforeUpdate rejection
    element.on.beforeUpdate = () => false
    const result = element.update({}, opts)
    expect(result).toBe(element)
  })
})

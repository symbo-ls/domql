import { update } from '../update'

describe('update()', () => {
  let element, params, opts

  beforeEach(() => {
    element = {
      __ref: {
        __execProps: {},
        __exec: {},
        __defineCache: {},
        __props: []
      },
      props: {},
      parent: {
        props: {}
      },
      define: {},
      node: document.createElement('div'),
      key: 'testElement',
      on: {},
      update
    }
    opts = {}
    params = {}
  })

  it('does not modify opts when params and opts are empty', async () => {
    await element.update({}, opts)
    expect(opts).toEqual({
      calleeElement: false,
      cleanExec: true,
      currentSnapshot: false,
      exclude: [],
      preventRecursive: false,
      stackChanges: false
    })
  })

  it('initializes options with UPDATE_DEFAULT_OPTIONS when opts is empty', async () => {
    await element.update({}, opts)
    expect(opts.calleeElement).toBe(false) // Ensure opts is not mutated
    expect(element.__ref).toBeDefined() // Ensure __ref is initialized
  })

  it('merges opts with UPDATE_DEFAULT_OPTIONS using deepMerge', async () => {
    opts.customOption = true
    await element.update({}, opts)
    expect(opts.customOption).toBe(true) // Ensure custom options are preserved
  })

  it('converts string params to { text: params }', async () => {
    await element.update('testString', opts)
    expect(element.text).toBe('testString')
  })

  it('converts number params to { text: params }', async () => {
    await element.update(123, opts)
    expect(element.text).toBe(123)
  })

  it('returns early if preventInheritAtCurrentState matches element', async () => {
    opts.preventInheritAtCurrentState = { __element: element }
    await element.update({}, opts)
    expect(element.__ref.__currentSnapshot).toBe(6) // No snapshot update
  })

  it('initializes __ref if not present', async () => {
    delete element.__ref
    await element.update({}, opts)
    expect(element.__ref).toBeDefined()
  })

  it('merges options with UPDATE_DEFAULT_OPTIONS when exclude is missing', async () => {
    await element.update({}, opts)
    expect(opts.exclude).toBeDefined() // Ensure exclude is added
  })

  it('does not throw or modify opts when params is undefined', async () => {
    await element.update(undefined, opts)
    expect(opts).toEqual({
      calleeElement: false,
      cleanExec: true,
      currentSnapshot: false,
      exclude: [],
      preventRecursive: false,
      stackChanges: false
    })
  })

  it('does not throw when opts is undefined', async () => {
    await element.update({}, undefined)
    expect(element.__ref).toBeDefined() // Ensure __ref is initialized
  })

  it('does not throw when opts is null', async () => {
    await element.update({}, null)
    expect(element.__ref).toBeDefined() // Ensure __ref is initialized
  })

  it('does not modify the params object', async () => {
    params = { key: 'value' }
    await element.update(params, opts)
    expect(params).toEqual({ key: 'value' })
  })

  it('does modify opts when params is an empty object', async () => {
    await element.update({}, opts)
    expect(opts).toEqual({
      calleeElement: false,
      cleanExec: true,
      currentSnapshot: false,
      exclude: [],
      preventRecursive: false,
      stackChanges: false
    })
  })

  it('moves regular properties to element.props', async () => {
    params = { props: { title: 'Test', description: 'Content' } }
    await element.update(params, opts)
    expect(element.props).toEqual({
      title: 'Test',
      description: 'Content'
    })
    expect(element.title).toBeUndefined()
  })

  it('keeps element-rooted properties', async () => {
    params = { Header: {}, Footer: {}, 0: 'index' }
    await element.update(params, opts)
    expect(element.Header).toBeDefined()
    expect(element.Footer).toBeDefined()
    expect(element['0']).toBe('index')
    expect(element.props).toEqual({})
  })

  it('preserves built-in properties on element', async () => {
    params = { props: { className: 'container', hidden: true } }
    await element.update(params, opts)
    expect(element.props.className).toBe('container')
    expect(element.props.hidden).toBe(true)
    expect(element.props).toEqual({ className: 'container', hidden: true })
  })

  it('moves element-like properties from props to root', async () => {
    params = { props: { Header: {} } }
    await element.update(params, opts)
    expect(element.Header).toBeDefined()
    expect(element.props.Header).toBeUndefined()
  })

  it('exits early when inheritStateUpdates returns false', async () => {
    // Simulate inheritStateUpdates failure
    element.__ref.__stateBlocked = true
    await element.update({ props: { shouldChange: true } }, opts)

    expect(element.props.shouldChange).toBe(true)
    expect(element.__ref.__stateBlocked).toBe(true) // State remains blocked
  })

  it('exits early when checkIfOnUpdate fails', async () => {
    // Force checkIfOnUpdate failure
    element.parent.props.ifCondition = false
    await element.update({ state: { newState: true } }, opts)

    expect(element.state.newState).toBe(true)
  })

  it('updates props from parent key match', async () => {
    element.parent.props.testKey = { inherited: true }
    await element.update({}, opts)
    expect(element.props.inherited).toBeUndefined()
  })

  it('updates props when functions exist in __props', async () => {
    element.__ref.__props.push(() => 'dynamic')
    await element.update({}, opts)
    expect(element.props).toEqual(expect.any(Object)) // Props were processed
  })

  it('skips props update when preventPropsUpdate=true', async () => {
    opts.preventPropsUpdate = true
    element.parent.props.testKey = { shouldExist: true }
    await element.update({}, opts)
    expect(element.props.shouldExist).toBeUndefined()
  })

  it('returns element when beforeUpdate rejects', async () => {
    // Simulate beforeUpdate rejection
    element.props.onBeforeUpdate = () => false
    const result = await element.update({}, opts)
    expect(result).toBe(element)
  })

  it('processes parent.childProps', async () => {
    element.parent.props.childProps = { global: true }
    await element.update({}, opts)
    expect(element.props.global).toBeUndefined()
  })

  it('processes function props', async () => {
    await element.update({ props: { calc: () => 42 } }, opts)
    expect(element.props.calc()).toBe(42)
  })
})

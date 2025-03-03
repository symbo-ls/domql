import { update } from '../update'

describe('update() with inheritStateUpdates', () => {
  let element, options

  beforeEach(() => {
    element = {
      __ref: {
        __state: null,
        __hasRootState: false,
        __execProps: {},
        __props: []
      },
      state: {
        calculated: 42,
        set: () => {
          return true
        }
      },
      parent: {
        state: { baseState: true },
        props: {}
      },
      props: {},
      key: 'testKey'
    }
    options = {}
  })

  // Test 1: Continue update when state inheritance succeeds
  it('processes full update flow when state is inherited', async () => {
    await update.call(element, { props: { newProp: true } }, options)
    expect(element.props.newProp).toBe(true)
    expect(element.state.baseState).toBe(true) // Inherited from parent
  })

  // Test 2: Preserve existing state when inheritance blocked
  it('maintains state when preventInheritedStateUpdate=true', async () => {
    options.preventInheritedStateUpdate = true
    element.state = { existing: 'state' }

    await update.call(element, {}, options)
    expect(element.state).toEqual({ baseState: true })
  })

  // Test 3: Execute state functions when forced
  it('overwrites state with function result', async () => {
    element.__ref.__state = () => ({ calculated: 42 })
    options.execStateFunction = true
    options.stateFunctionOverwrite = true

    await update.call(element, {}, options)
    expect(element.state.calculated).toEqual(42)
  })

  // Test 4: Block updates via beforeStateUpdate event
  it('preserves state when beforeStateUpdate rejects', async () => {
    element.props.onBeforeStateUpdate = () => false
    await update.call(element, { props: { shouldChange: true } }, options)
    expect(element.state).toEqual({ baseState: true })
    expect(element.props.shouldChange).toBe(true)
  })

  // Test 5: Handle parent state changes
  it('reflects parent state updates', async () => {
    element.parent.state = { updatedParentState: true }
    await update.call(element, {}, options)
    expect(element.state.updatedParentState).toBe(true)
  })

  // Test 6: Maintain local state when root state exists
  it('preserves local state when __hasRootState=true', async () => {
    element.__ref.__hasRootState = true
    element.state = { local: 'data' }

    await update.call(element, {}, options)
    expect(element.state.local).toBe('data')
  })
})

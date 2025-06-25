import { updateState } from '../updateState'

describe('updateState', () => {
  let state
  const sampleObj = { foo: 'bar', eventCalled: true }

  beforeEach(() => {
    state = {
      __element: {
        context: 'testContext',
        on: {},
        parent: {
          state: {
            update: (obj, opts) => {
              return obj
            }
          }
        },
        __ref: {
          __state: 'testState'
        },
        update: (obj, opts) => {
          return obj
        }
      },
      parse: () => {
        return { foo: 'bar' }
      }
    }
  })

  it('calls onEach with element, state, context, and options when provided', async () => {
    let receivedArgs = {}
    const options = {
      onEach: (element, stateArg, context, opts) => {
        receivedArgs = { element, stateArg, context, opts }
      }
    }

    await updateState.call(state, sampleObj, options)

    expect(receivedArgs.element).toBe(state.__element)
    expect(receivedArgs.stateArg).toBe(state)
    expect(receivedArgs.context).toBe('testContext')
    expect(receivedArgs.opts).toEqual(options)
  })

  it('sets options.preventInheritAtCurrentState to state when true', async () => {
    const options = { preventInheritAtCurrentState: true }
    await updateState.call(state, sampleObj, options)
    expect(options.preventInheritAtCurrentState).toBe(state)
  })

  it('returns early and skips onEach when preventInheritAtCurrentState is truthy (not true)', async () => {
    let onEachCalled = false
    const options = {
      preventInheritAtCurrentState: {}, // Truthy value
      onEach: () => {
        onEachCalled = true
      }
    }

    await updateState.call(state, sampleObj, options)
    expect(onEachCalled).toBe(true)
  })

  it('returns the state object in all cases', async () => {
    const result = await updateState.call(state, sampleObj)
    expect(result).toBe(state)
  })

  it('executes full flow when preventInheritAtCurrentState is true', async () => {
    let onEachCalled = false
    const options = {
      preventInheritAtCurrentState: true,
      onEach: () => {
        onEachCalled = true
      }
    }

    await updateState.call(state, sampleObj, options)
    expect(onEachCalled).toBe(true)
    expect(options.preventInheritAtCurrentState).toBe(state)
  })

  it('maintains default options when none are provided', async () => {
    const originalState = { ...state }
    const result = await updateState.call(state, sampleObj)

    expect(result).toBe(state)
    expect(result.__element).toEqual(originalState.__element)
  })

  it('does not call onEach when options are not provided', async () => {
    let onEachCalled = false
    state = {
      ...state,
      onEach: () => {
        onEachCalled = true
      }
    }

    await updateState.call(state, sampleObj)
    expect(onEachCalled).toBe(false)
  })

  it('processes options with preventInheritAtCurrentState set to false', async () => {
    let onEachCalled = false
    const options = {
      preventInheritAtCurrentState: false,
      onEach: () => {
        onEachCalled = true
      }
    }

    await updateState.call(state, sampleObj, options)
    expect(onEachCalled).toBe(true)
  })

  it('does not modify options.preventInheritAtCurrentState when not true', async () => {
    const options = { preventInheritAtCurrentState: 'someValue' }
    await updateState.call(state, sampleObj, options)
    expect(options.preventInheritAtCurrentState).toBe('someValue')
  })

  it('returns element when beforeStateUpdate returns false', async () => {
    state.__element.beforeStateUpdate = () => false
    const result = await updateState.call(state, sampleObj)
    expect(result.__element.__ref.__state).toBe('testState')
    expect(typeof result.__element.beforeStateUpdate).toBe('function')
    expect(result.__element.context).toBe('testContext')
    expect(result.__element.on).toEqual({})
    expect(typeof result.__element.parent.state.update).toBe('function')
    expect(typeof result.__element.update).toBe('function')
    expect(typeof result.parse).toBe('function')
  })

  it('proceeds with update when beforeStateUpdate returns non-false', async () => {
    state.__element.beforeStateUpdate = () => true
    const result = await updateState.call(state, sampleObj)
    expect(result).toBe(state)
  })

  it('skips beforeStateUpdate when preventBeforeStateUpdateListener=true', async () => {
    let called = false
    state.__element.beforeStateUpdate = () => {
      called = true
    }

    await updateState.call(state, sampleObj, {
      preventBeforeStateUpdateListener: true
    })

    expect(called).toBe(false)
  })

  it('modifies state through overwriteState when overwrite=true', async () => {
    await updateState.call(state, sampleObj, { overwrite: true })
    expect(state.foo).toBe('bar')
  })

  it('propagates state to parent when hoisting conditions met', async () => {
    const parentState = {
      update: (obj, opts) => {
        return obj
      }
    }
    state.__element.parent.state = parentState

    await updateState.call(state, sampleObj, {
      stopStatePropagation: false,
      replace: true
    })

    expect(parentState.testState).toBeDefined()
  })

  it('does NOT propagate state when stopStatePropagation=true', async () => {
    const parentState = {}
    state.__element.parent.state = parentState

    await updateState.call(state, sampleObj, {
      stopStatePropagation: true
    })

    expect(parentState.testState).toBeUndefined()
  })

  it('modifies state through overwriteState with merge strategy', async () => {
    state.existing = 'prop'
    await updateState.call(state, { new: 'value' }, { overwrite: 'merge' })
    expect(state).toEqual(
      expect.objectContaining({ existing: 'prop', new: 'value' })
    )
  })

  it('executes deep overwrite when overwrite=true', async () => {
    state.nested = { prop: 'old' }
    await updateState.call(
      state,
      { nested: { prop: 'new' } },
      { overwrite: true }
    )
    expect(state.nested.prop).toBe('new')
  })

  it('calls element.update with default options when preventUpdate=false', async () => {
    await updateState.call(state, sampleObj, { preventUpdate: false })
    expect.objectContaining({ updateByState: true })
  })

  it('handles recursive preventUpdate in element.update', async () => {
    await updateState.call(state, sampleObj, { preventUpdate: 'recursive' })
    expect.objectContaining({
      isHoisted: false,
      preventUpdate: true,
      updateByState: true
    })
  })

  it('prevents stateUpdate event with preventStateUpdateListener', async () => {
    let eventCalled = false
    state.__element.stateUpdate = () => {
      eventCalled = true
    }

    await updateState.call(state, sampleObj, {
      preventStateUpdateListener: true
    })
    expect(eventCalled).toBe(false)
  })
})

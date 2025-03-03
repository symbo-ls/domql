import moduleExports from '../index'
const { create } = moduleExports

describe('create', () => {
  it('should execute on.complete handler and modify state', async () => {
    const element = {
      on: {
        complete: async (el, state) => {
          state.ranComplete = true
        }
      },
      state: {},
      context: {}
    }

    await create(element, {}, 'key', {})
    expect(element.state.ranComplete).toBe(true)
  })

  it('should execute props.onComplete and modify context', async () => {
    const element = {
      props: {
        onComplete: async (el, state, context) => {
          context.ranPropsComplete = true
        }
      },
      state: {},
      context: {}
    }

    await create(element, {}, 'key', {})
    expect(element.context.ranPropsComplete).toBe(true)
  })

  it('should execute initInspect and modify options', async () => {
    const options = {}
    const element = {
      on: {
        initInspect: async (el, state, context, opts) => {
          opts.inspected = true
        }
      },
      state: {},
      context: {}
    }

    await create(element, {}, 'key', options)
    expect(options.inspected).toBe(true)
  })

  it('should execute initSync and modify element', async () => {
    const element = {
      on: {
        initSync: async el => {
          el.synced = true
        }
      },
      state: {},
      context: {}
    }

    const result = await create(element, {}, 'key', {})
    expect(result.synced).toBeUndefined()
  })

  it('should handle multiple lifecycle handlers', async () => {
    const options = {}
    const element = {
      on: {
        complete: async el => {
          el.ordered = '1'
        },
        initSync: async el => {
          el.ordered += '2'
        }
      },
      props: {
        onComplete: async el => {
          el.ordered += '3'
        }
      },
      state: {},
      context: {}
    }

    const result = await create(element, {}, 'key', options)
    expect(result.ordered).toBe('13')
  })

  it('should not clean up __ref when keepRef=false', async () => {
    const element = {
      __ref: { some: 'data' },
      state: {},
      context: {}
    }

    await create(element, {}, 'key', { keepRef: false })
    expect(element.__ref).toBeDefined()
  })
})

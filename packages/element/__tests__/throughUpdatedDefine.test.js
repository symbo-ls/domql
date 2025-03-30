import { throughUpdatedDefine } from '../iterate'

describe('throughUpdatedDefine', () => {
  let element, ref

  beforeEach(() => {
    ref = {
      __exec: {},
      __defineCache: {}
    }
    element = {
      __ref: ref,
      define: {},
      state: { testState: true },
      context: { testContext: true }
    }
  })

  it('should merge local and global define objects', async () => {
    element.define = { localProp: () => 'local' }
    element.context.define = { globalProp: () => 'global' }

    await throughUpdatedDefine(element)

    expect(element.localProp).toBe('local')
    expect(element.globalProp).toBe('global')
  })

  it('should update element properties using cached exec functions', async () => {
    ref.__exec.testProp = () => 'cached value'
    element.define.testProp = cached => `updated ${cached}`

    await throughUpdatedDefine(element)

    expect(element.testProp).toBe('updated cached value')
    expect(ref.__defineCache.testProp).toBe('cached value')
  })

  it('should handle non-function cached values', async () => {
    ref.__defineCache.testProp = 'static value'
    element.define.testProp = cached => `updated ${cached}`

    await throughUpdatedDefine(element)

    expect(element.testProp).toBe('updated static value')
  })

  it('should skip updates for undefined or null results', async () => {
    ref.__exec.testProp = () => 'cached value'
    element.define.testProp = () => null
    element.testProp = 'original value'

    await throughUpdatedDefine(element)

    expect(element.testProp).toBe('original value')
  })

  it('should handle empty define objects', async () => {
    const originalElement = { ...element }

    await throughUpdatedDefine(element)

    expect(element).toEqual(originalElement)
  })

  it('should pass correct arguments to define functions', async () => {
    element.define.testProp = (cached, el, state, context) => ({
      cachedMatch: cached === 'cached value',
      elMatch: el === element,
      stateMatch: state === element.state,
      contextMatch: context === element.context
    })
    ref.__defineCache.testProp = 'cached value'

    await throughUpdatedDefine(element)

    expect(element.testProp).toEqual({
      cachedMatch: true,
      elMatch: true,
      stateMatch: true,
      contextMatch: true
    })
  })

  it('should return an empty changes object', async () => {
    element.define.testProp = () => 'updated value'

    const changes = await throughUpdatedDefine(element)

    expect(changes).toEqual({})
  })
})

import { throughInitialDefine } from '../iterate'

describe('throughInitialDefine', () => {
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

  it('should merge local and global define objects', () => {
    element.define = { localProp: () => 'local' }
    element.context.define = { globalProp: () => 'global' }

    throughInitialDefine(element)

    expect(element.localProp).toBe('local')
    expect(element.globalProp).toBe('global')
  })

  it('should cache and execute define functions', () => {
    element.define.testProp = value => 'defined value'
    element.testProp = () => 'initial value'

    throughInitialDefine(element)

    expect(element.testProp).toBe('defined value')
    expect(ref.__exec.testProp).toBeInstanceOf(Function)
    expect(ref.__defineCache.testProp).toBe('initial value')
  })

  it('should skip execution for method properties', () => {
    element.define.update = value => 'should not execute'
    element.update = () => 'built-in method'

    throughInitialDefine(element)

    expect(ref.__exec).not.toHaveProperty('update')
    expect(ref.__defineCache).not.toHaveProperty('update')
  })

  it('should handle parse method in execution result', () => {
    element.define.testProp = () => ({ parse: () => 'parsed value' })
    element.testProp = () => 'initial value'

    throughInitialDefine(element)

    expect(ref.__defineCache.testProp).toBe('initial value')
  })

  it('should pass correct arguments to define functions', () => {
    element.define.testProp = (value, el, state, context) => ({
      valueMatch: value === 'initial value',
      elMatch: el === element,
      stateMatch: state === element.state,
      contextMatch: context === element.context
    })
    element.testProp = 'initial value'

    throughInitialDefine(element)

    expect(element.testProp).toEqual({
      valueMatch: true,
      elMatch: true,
      stateMatch: true,
      contextMatch: true
    })
  })

  it('should handle non-function element properties', () => {
    element.define.testProp = value => 'defined value'
    element.testProp = 'non-function value'

    throughInitialDefine(element)

    expect(element.testProp).toBe('defined value')
  })

  it('should handle empty define objects', () => {
    throughInitialDefine(element)

    expect(element).toEqual({
      ...element,
      __ref: ref
    })
  })

  it('should handle null or undefined define properties', () => {
    element.define.testProp = () => null
    element.testProp = 'initial value'

    throughInitialDefine(element)

    expect(element.testProp).toBe('initial value')
  })
})

import { throughInitialExec } from '../iterate'

describe('throughInitialExec', () => {
  let element, ref

  beforeEach(() => {
    ref = { __exec: {} }
    element = {
      __ref: ref,
      state: { testState: true },
      context: { testContext: true },
      // Default non-method function
      customFn: () => 'executed'
    }
  })

  it('should process non-method functions and update element properties', async () => {
    await throughInitialExec(element)

    expect(element.customFn).toBe('executed')
    expect(ref.__exec.customFn).toBeInstanceOf(Function)
  })

  it('should skip excluded parameters', async () => {
    element.excludedFn = () => 'should not execute'
    await throughInitialExec(element, { excludedFn: true })

    expect(element.excludedFn).toBeInstanceOf(Function)
    expect(ref.__exec).not.toHaveProperty('excludedFn')
  })

  it('should skip methods from METHODS array', async () => {
    element.update = () => 'built-in method'
    await throughInitialExec(element)

    expect(element.update).toBeInstanceOf(Function)
    expect(ref.__exec).not.toHaveProperty('update')
  })

  it('should skip methods from context.methods', async () => {
    element.context.methods = { contextMethod: true }
    element.contextMethod = () => 'context method'
    await throughInitialExec(element)

    expect(element.contextMethod).toBeInstanceOf(Function)
    expect(ref.__exec).not.toHaveProperty('contextMethod')
  })

  it('should leave non-function properties unchanged', async () => {
    element.stringProp = 'text'
    await throughInitialExec(element)

    expect(element.stringProp).toBe('text')
    expect(ref.__exec).not.toHaveProperty('stringProp')
  })

  it('should store original functions in __exec', async () => {
    const originalFn = () => 'original'
    element.testFn = originalFn
    await throughInitialExec(element)

    expect(ref.__exec.testFn).toBe(originalFn)
    expect(element.testFn).toBe('original')
  })

  it('should execute functions with correct arguments', async () => {
    element.argChecker = (el, state, context) => ({
      elIsElement: el === element,
      stateMatch: state === element.state,
      contextMatch: context === element.context
    })

    await throughInitialExec(element)

    expect(element.argChecker).toEqual({
      elIsElement: true,
      stateMatch: true,
      contextMatch: true
    })
  })

  it('should handle empty exclude object', async () => {
    element.fn1 = () => 'one'
    element.fn2 = () => 'two'
    await throughInitialExec(element, {})

    expect(element.fn1).toBe('one')
    expect(element.fn2).toBe('two')
    expect(ref.__exec).toHaveProperty('fn1')
    expect(ref.__exec).toHaveProperty('fn2')
  })
})

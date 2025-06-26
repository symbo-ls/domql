import { throughUpdatedExec } from '../iterate'

describe('throughUpdatedExec', () => {
  let element, ref

  beforeEach(() => {
    ref = {
      __exec: {},
      __defineCache: {}
    }
    element = {
      __ref: ref,
      state: { testState: true },
      context: { testContext: true }
    }
  })

  it('should skip execution for params in __defineCache', async () => {
    ref.__defineCache.cachedParam = true
    ref.__exec.cachedParam = () => 'should not execute'
    element.cachedParam = 'original'

    const changes = await throughUpdatedExec(element)

    expect(element.cachedParam).toBe('original')
    expect(changes).toEqual({})
  })

  it('should update element properties when newExec differs from current value', async () => {
    ref.__exec.testParam = () => 'new value'
    element.testParam = 'old value'

    const changes = await throughUpdatedExec(element)

    expect(element.testParam).toBe('new value')
    expect(changes).toEqual({ testParam: 'old value' })
  })

  it('should overwrite text property for nodes when exec returns string or number', async () => {
    const node = { node: true, text: 'old text' }
    ref.__exec.testParam = () => 'new text'
    element.testParam = node

    const changes = await throughUpdatedExec(element)

    expect(element.testParam.text).toBe('new text')
    expect(changes).toEqual({})
  })

  it('should handle component naming matches and overwrite with context component', async () => {
    const contextComponent = { extends: 'Component', prop: 'value' }
    element.context.components = { TestComponent: contextComponent }
    ref.__exec.TestComponent = () => contextComponent
    element.TestComponent = { oldProp: 'oldValue' }

    const changes = await throughUpdatedExec(element)

    expect(element.TestComponent).toEqual({
      oldProp: 'oldValue',
      prop: 'value'
    })
    expect(changes).toEqual({})
  })

  it('should not update element properties when newExec matches current value', async () => {
    ref.__exec.testParam = () => 'same value'
    element.testParam = 'same value'

    const changes = await throughUpdatedExec(element)

    expect(element.testParam).toBe('same value')
    expect(changes).toEqual({})
  })

  it('should handle non-string/non-number exec returns for non-node properties', async () => {
    const newValue = { complex: 'object' }
    ref.__exec.testParam = () => newValue
    element.testParam = 'old value'

    const changes = await throughUpdatedExec(element)

    expect(element.testParam).toBe(newValue)
    expect(changes).toEqual({ testParam: 'old value' })
  })

  it('should return an empty changes object when no updates occur', async () => {
    ref.__exec.testParam = () => 'same value'
    element.testParam = 'same value'

    const changes = await throughUpdatedExec(element)

    expect(changes).toEqual({})
  })

  it('should handle multiple properties and return correct changes', async () => {
    ref.__exec.param1 = () => 'new value 1'
    ref.__exec.param2 = () => 'new value 2'
    element.param1 = 'old value 1'
    element.param2 = 'old value 2'

    const changes = await throughUpdatedExec(element)

    console.log(element)
    expect(element.param1).toBe('new value 1')
    expect(element.param2).toBe('new value 2')
    expect(changes).toEqual({
      param1: 'old value 1',
      param2: 'old value 2'
    })
  })
})

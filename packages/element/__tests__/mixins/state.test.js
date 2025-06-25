import { state } from '../../mixins/state'

describe('state', () => {
  let element, node

  beforeEach(() => {
    element = {
      state: {}
    }
    node = {}
  })

  it('returns the element if params is not an object', async () => {
    const result = await state(null, element, node)
    expect(result).toBe(element)
    expect(element.state).toEqual({})

    const result2 = await state(123, element, node)
    expect(result2).toBe(element)
    expect(element.state).toEqual({})

    const result3 = await state('invalid', element, node)
    expect(result3).toBe(element)
    expect(element.state).toEqual({})
  })

  it('does not modify element.state if params is not an object', async () => {
    await state(null, element, node)
    expect(element.state).toEqual({})

    await state(123, element, node)
    expect(element.state).toEqual({})

    await state('invalid', element, node)
    expect(element.state).toEqual({})
  })

  it('skips non-own properties', async () => {
    const params = Object.create({ inherited: 'value' })
    params.own = 'property'

    await state(params, element, node)

    expect(params).toEqual({
      own: 'property'
    })
    expect(element.state.inherited).toBeUndefined()
  })

  it('preserves existing properties in element.state not overwritten by params', async () => {
    element.state = {
      id: 123,
      name: 'Alice'
    }

    const params = {
      name: 'Bob'
    }

    await state(params, element, node)

    expect(element.state).toEqual({
      id: 123,
      name: 'Alice'
    })
  })

  it('handles empty params object', async () => {
    await state({}, element, node)
    expect(element.state).toEqual({})
  })

  it('does not modify the node object', async () => {
    const params = {
      name: 'John'
    }

    await state(params, element, node)

    expect(node).toEqual({})
  })
})

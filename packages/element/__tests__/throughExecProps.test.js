import { throughExecProps } from '../iterate'

describe('throughExecProps', () => {
  let element, ref

  beforeEach(() => {
    ref = {
      __execProps: {}
    }
    element = {
      __ref: ref,
      props: {},
      state: { test: 'state' },
      context: { test: 'context' }
    }
  })

  it('should cache and execute define-prefixed function props', () => {
    element.props.isActive = () => true
    element.props.hasFeature = (el, state) => state.test === 'state'

    throughExecProps(element)

    expect(element.props.isActive).toBe(true)
    expect(element.props.hasFeature).toBe(true)
    expect(ref.__execProps).toEqual({
      isActive: expect.any(Function),
      hasFeature: expect.any(Function)
    })
  })

  it('should execute cached functions from previous runs', () => {
    ref.__execProps.value = () => 'cached'
    element.props.value = 'current'

    throughExecProps(element)

    expect(element.props.value).toBe('cached')
  })

  it('should leave non-function props unchanged', () => {
    element.props.title = 'static text'
    element.props.disabled = false

    throughExecProps(element)

    expect(element.props.title).toBe('static text')
    expect(element.props.disabled).toBe(false)
    expect(ref.__execProps).toEqual({})
  })

  it('should handle mixed define-prefixed and regular props', () => {
    element.props.useHelper = () => 'helper'
    element.props.color = 'blue'

    throughExecProps(element)

    expect(element.props.useHelper).toBe('helper')
    expect(element.props.color).toBe('blue')
    expect(ref.__execProps).toHaveProperty('useHelper')
  })

  it('should preserve existing cache entries', () => {
    ref.__execProps.existing = () => 'prior'
    element.props.existing = 'new'

    throughExecProps(element)

    expect(element.props.existing).toBe('prior')
    expect(ref.__execProps.existing).toBeInstanceOf(Function)
  })

  it('should pass correct execution context', () => {
    element.props.checkContext = function (el, state, context) {
      return (
        this === element &&
        state === element.state &&
        context === element.context
      )
    }

    throughExecProps(element)

    expect(typeof element.props.checkContext).toBe('function')
  })
})

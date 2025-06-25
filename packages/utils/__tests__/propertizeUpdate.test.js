import { jest } from '@jest/globals'
import { propertizeUpdate } from '../props'

describe('propertizeUpdate', () => {
  it('should handle empty parameters', () => {
    const element = {
      on: {},
      props: {}
    }

    const result = propertizeUpdate.call(element)

    expect(result).toEqual({
      on: {},
      props: {}
    })
  })

  it('should merge with default on and props objects', () => {
    const element = {
      on: {},
      props: {}
    }

    const params = {
      style: { color: 'red' },
      normalProp: 'value'
    }

    const result = propertizeUpdate.call(element, params)

    expect(result).toEqual({
      style: { color: 'red' },
      on: {},
      props: {
        normalProp: 'value'
      }
    })
  })

  it('should handle event handlers correctly', () => {
    const handler = () => {}
    const element = {
      on: {},
      props: {}
    }

    const params = {
      onClick: handler,
      normalProp: 'value'
    }

    const result = propertizeUpdate.call(element, params)

    expect(result).toEqual({
      on: {
        click: handler
      },
      props: {
        normalProp: 'value'
      }
    })
  })

  it('should process beforeUpdate events if present', () => {
    const beforeUpdateHandler = jest.fn()
    const element = {
      props: {}
    }

    const params = {
      onBeforeUpdate: beforeUpdateHandler,
      style: { color: 'red' }
    }

    const result = propertizeUpdate.call(element, params)

    // Since propertizeUpdate doesn't process beforeUpdate events directly,
    // we just check that it properly preserves the event handler
    expect(result).toEqual({
      style: { color: 'red' },
      on: {
        beforeUpdate: beforeUpdateHandler
      },
      props: {}
    })
  })

  it('should handle component properties correctly', () => {
    const element = {
      on: {},
      props: {}
    }

    const params = {
      NestedComponent: { content: 'test' },
      style: { margin: '10px' }
    }

    const result = propertizeUpdate.call(element, params)

    expect(result).toEqual({
      NestedComponent: { content: 'test' },
      style: { margin: '10px' },
      on: {},
      props: {}
    })
  })

  it('should handle existing props and on objects in params', () => {
    const element = {
      on: { existing: () => {} },
      props: { existing: 'value' }
    }

    const params = {
      on: { new: () => {} },
      props: { new: 'value' },
      style: { color: 'blue' }
    }

    const result = propertizeUpdate.call(element, params)

    expect(result).toEqual({
      style: { color: 'blue' },
      on: {
        new: expect.any(Function)
      },
      props: {
        new: 'value'
      }
    })
  })

  it('should correctly merge with complex nested structures', () => {
    const element = {
      on: {},
      props: {},
      define: {
        customProp: { type: 'string' }
      }
    }

    const params = {
      customProp: 'test',
      NestedComponent: {
        props: {
          innerProp: 'value'
        }
      }
    }

    const result = propertizeUpdate.call(element, params)

    expect(result).toEqual({
      customProp: 'test',
      NestedComponent: {
        props: {
          innerProp: 'value'
        }
      },
      on: {},
      props: {}
    })
  })
})

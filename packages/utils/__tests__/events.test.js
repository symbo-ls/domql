import { jest } from '@jest/globals'
import { addEventFromProps } from '../events.js'

describe('addEventFromProps', () => {
  test('should add event handler from props to on object', () => {
    const element = {
      on: {},
      props: {
        onClick: () => 'clicked'
      }
    }

    addEventFromProps.call(element, 'onClick', element)

    expect(element.on).toBeDefined()
    expect(typeof element.on.click).toBe('function')
    expect(element.on.click()).toBe('clicked')
  })

  test('should combine existing and new event handlers', async () => {
    const handler1Called = jest.fn()
    const handler2Called = jest.fn()

    const element = {
      on: {
        click: handler1Called
      },
      props: {
        onClick: handler2Called
      }
    }

    addEventFromProps.call(element, 'onClick', element)
    await element.on.click()

    expect(handler1Called).toHaveBeenCalled()
    expect(handler2Called).toHaveBeenCalled()
  })

  test('should not call new handler if existing returns false', async () => {
    const handler2Called = jest.fn()

    const element = {
      on: {
        click: () => false
      },
      props: {
        onClick: handler2Called
      }
    }

    addEventFromProps.call(element, 'onClick', element)
    await element.on.click()

    expect(handler2Called).not.toHaveBeenCalled()
  })
})

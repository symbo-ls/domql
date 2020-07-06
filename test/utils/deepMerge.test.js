import { deepMerge } from '../../src/utils'

test('should set prototype from a original to a new element', () => {
  var proto = {
    tag: 'button',
    style: {
      backgroundColor: 'white',
      color: 'black',
      outline: 0
    },
    icon: {
      style: {
        fill: 'black'
      }
    },
    text: 'Button'
  }

  var element = {
    style: {
      backgroundColor: 'green',
      color: 'white'
    },
    text: 'Submit'
  }

  deepMerge(element, proto)

  expect(element).toStrictEqual({
    tag: 'button',
    style: {
      backgroundColor: 'green',
      color: 'white',
      outline: 0
    },
    icon: {
      style: {
        fill: 'black'
      }
    },
    text: 'Submit'
  })
})

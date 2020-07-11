import { overwrite } from '../../src/utils'

test('should overwrite object with new properties', () => {
  var element = {
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

  var update = {
    style: {
      backgroundColor: 'green',
      color: 'white'
    },
    text: 'Submit'
  }

  overwrite(element, update)

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

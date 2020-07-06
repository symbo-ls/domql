import { deepClone } from '../../src/utils'

var obj = {
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

var cloned = deepClone(obj)

test('should clone the object', () => {
  expect(cloned).toStrictEqual(obj)
})

test('should clone use child references', () => {
  expect(cloned.style).not.toBe(obj.style)
})

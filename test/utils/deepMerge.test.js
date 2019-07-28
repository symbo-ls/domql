import deepMerge from '../../src/utils/deepMerge'

test('should set prototype from a original to a new element', () => {
  var proto = {
    tag: 'button',
    style: {
      backgroundColor: 'white',
      color: 'black',
      outline: 0
    }
  }

  var submit = {
    style: {
      backgroundColor: 'green',
      color: 'white'
    },
    text: 'Submit'
  }

  deepMerge(submit, proto)

  expect(submit).toStrictEqual({
    tag: 'button',
    style: {
      backgroundColor: 'green',
      color: 'white',
      outline: 0
    },
    text: 'Submit'
  })
})
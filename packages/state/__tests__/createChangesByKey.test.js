import { createNestedObjectByKeyPath } from '../inherit'

test('createNestedObjectByKeyPath should create nested object with value', () => {
  const path = 'test/2/4/6'
  const value = { foo: 'bar' }
  const expected = {
    test: {
      2: {
        4: {
          6: value
        }
      }
    }
  }
  expect(createNestedObjectByKeyPath(path, value)).toEqual(expected)
})

test('createNestedObjectByKeyPath should create nested object with empty object if value is not provided', () => {
  const path = 'test/2/4/6'
  const expected = {
    test: {
      2: {
        4: {
          6: {}
        }
      }
    }
  }
  expect(createNestedObjectByKeyPath(path)).toEqual(expected)
})

test('createNestedObjectByKeyPath should return empty object if path is empty', () => {
  const path = ''
  const value = { foo: 'bar' }
  const expected = { foo: 'bar' }
  expect(createNestedObjectByKeyPath(path, value)).toEqual(expected)
})

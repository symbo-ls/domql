import isObject from '../../src/utils/isObject'

test('should check whether plain object is object and not object-like', () => {
  expect(isObject({})).toBeTruthy()
  expect(isObject([])).toBeFalsy()
  expect(isObject(() => {})).toBeFalsy()
})

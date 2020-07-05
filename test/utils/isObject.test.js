import { isObject } from '../../src/utils'

test('should check whether plain object is object and not object-like', () => {
  expect(isObject({})).toBeTruthy()
  expect(isObject([])).toBeFalsy()
  expect(isObject(() => {})).toBeFalsy()
  expect(isObject(1)).toBeFalsy()
})

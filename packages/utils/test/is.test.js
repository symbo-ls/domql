const { isObject, isObjectLike, isFunction, isArray } = require('../dist/cjs')

test('check if it\'s truly an array', () => {
  expect(isArray({})).toBeFalsy()
  expect(isArray([])).toBeTruthy()
  expect(isArray(() => {})).toBeFalsy()
  expect(isArray(1)).toBeFalsy()
})

test('check if it\'s truly an object', () => {
  expect(isObject({})).toBeTruthy()
  expect(isObject([])).toBeFalsy()
  expect(isObject(() => {})).toBeFalsy()
  expect(isObject(1)).toBeFalsy()
})

test('check if it\'s truly a function', () => {
  expect(isFunction({})).toBeFalsy()
  expect(isFunction([])).toBeFalsy()
  expect(isFunction(() => {})).toBeTruthy()
  expect(isFunction(1)).toBeFalsy()
})

test('check if it\'s an object-like', () => {
  expect(isObjectLike({})).toBeTruthy()
  expect(isObjectLike([])).toBeTruthy()
  expect(isObjectLike(() => {})).toBeFalsy()
  expect(isObjectLike(1)).toBeFalsy()
})

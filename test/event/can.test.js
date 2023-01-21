'use strict'

import { can } from '../../src/event'

test('checks with valid tags', () => {
  expect(can.render({ })).toBeTruthy()
  expect(can.render({ tag: 'div' })).toBeTruthy()
  expect(can.render({ tag: 'fragment' })).toBeTruthy()
  expect(can.render({ tag: 'asd' })).toBeInstanceOf(global.Error)
})

'use strict'

import { tree } from '@domql/tree'
import { extendElement } from '..'

describe('Should extend other element', () => {
  const extended = extendElement({
    ref: {},
    extend: {
      test2: 'test2'
    },
    test: 123
  }, tree)

  test('should extent an object element', () => {
    expect(extended).toEqual({
      ref: {
        extend: [{
          __hash: extended.ref.extends[0].__hash,
          test2: 'test2'
        }]
      },
      test: 123,
      test2: 'test2'
    })
  })

  test('should extent a nested object', () => {
    const extended2 = extendElement({
      ref: {},
      extend: extended,
      test3: { text: 'test3' }
    }, tree)
    expect(extended2).toEqual({
      ref: {
        extend: [{
          __hash: extended2.ref.extends[0].__hash,
          test: 123,
          test2: 'test2',
          ref: {
            extend: [{
              __hash: extended.ref.extends[0].__hash,
              test2: 'test2'
            }]
          }
        }]
      },
      test: 123,
      test2: 'test2',
      test3: { text: 'test3' }
    })
  })
})

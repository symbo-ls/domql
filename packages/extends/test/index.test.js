'use strict'

import { tree } from '@domql/tree'
import { extendElement } from '..'

describe('Should extend other element', () => {
  const protoed = extendElement({
    ref: {},
    extends: {
      test2: 'test2'
    },
    test: 123
  }, tree)

  test('should extent an object element', () => {
    expect(protoed).toEqual({
      ref: {
        extends: [{
          __hash: protoed.ref.extends[0].__hash,
          test2: 'test2'
        }]
      },
      test: 123,
      test2: 'test2'
    })
  })

  test('should extent a nested object', () => {
    const protoed2 = extendElement({
      ref: {},
      extends: protoed,
      test3: { text: 'test3' }
    }, tree)
    expect(protoed2).toEqual({
      ref: {
        extends: [{
          __hash: protoed2.ref.extends[0].__hash,
          test: 123,
          test2: 'test2',
          ref: {
            extends: [{
              __hash: protoed.ref.extends[0].__hash,
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

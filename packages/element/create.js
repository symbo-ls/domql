'use strict'

import { root } from '@domql/tree'
import { createID } from '@domql/id'
import { isNumber, isString, isNode } from '@domql/utils'

/**
 * Creating a domQL element using passed parameters
 */

const init = (element) => {
  // if element is STRING
  if (isString(element) || isNumber(element)) {
    return {
      ref: {},
      props: {
        value: element
      }
    }
  }
  if (!element.ref) element.ref = {}
  return {}
}

const assignKey = (element, key) => {
  if (element.key) return
  element.key = key || createID.next().value
}

const applyParent = (element, key) => {
  const { parent } = element
  if (isNode(parent)) {
    element.parent = root[`${key}_parent`] = { node: parent }
  }
  if (!element.parent) {
    element.parent = root
  }
}

export const create = (element, parent, key, options = {}) => {
  if (element === undefined) { element = {} }

  [
    init,
    assignKey,
    applyParent
  ].reduce(
    (prev, currentCall, element) => currentCall.call(prev, key, options)
  )

  console.log(element)
}

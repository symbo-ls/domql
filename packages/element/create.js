'use strict'

import { root } from '@domql/tree'
import { createId } from '@domql/id'
import { isNumber, isString, isNode } from '@domql/utils'
import { assignClass } from '../mixins'

const OPTIONS = {}

/**
 * Creating a domQL element using passed parameters
 */

const init = (element, key) => {
  const ref = {}
  if (isObject(element)) {
    if (!element.ref) element.ref = {}
    return element
  }
  if (isString(element) || isNumber(element)) {
    return {
      key,
      ref,
      props: {
        value: element
      }
    }
  }
  // if (element.ref) element.ref = {}
  if (!element) return { ref }
  return element
}

const assignKey = (element, key) => {
  if (element.key) return element
  element.key = key || createId.next().value
  return element
}

const applyParent = (element, key) => {
  const { ref } = element
  const { parent } = ref
  if (isNode(parent)) {
    ref.parent = root.ref[`parent`] = { node: parent }
  }
  if (!parent) ref.parent = root
  return element
}

const applyClass = (element, key) => {
  assignClass
}

export const create = (element, parent, key, options = {}) => {
  // if (element === undefined) { element = {} }

  [
    init,
    assignKey,
    applyParent,
    applyClass
  ].reduce((prev, current) => current(prev, key, options), element)

  console.log(element)

  return element
}

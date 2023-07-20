'use strict'

import { create } from '..'
import {
  exec,
  isString,
  replaceLiteralsWithObjectFields
} from '@domql/utils'

/**
 * Creates a text node and appends into
 * an original one as a child
 */
export const asd = (param, element, node) => {
  const prop = exec(param, element)
  if (element.tag === 'string') {
    node.nodeValue = prop
  } else if (param !== undefined || param !== null) {
    if (element.__text && element.__text.text !== prop) return
    element.__text.text = prop
    if (element.__text.node) element.__text.node.nodeValue = prop
    else create({ tag: 'string', text: prop }, element, '__text')
  }
}

export default (param, element, node) => {
  let prop = exec(param, element)
  if (isString(prop) && prop.includes('{{')) {
    prop = replaceLiteralsWithObjectFields(prop, element.state)
  }
  if (element.tag === 'string') {
    if (element.text === prop) return
    node.nodeValue = prop
  } else if (param !== undefined || param !== null) {
    if (element.__text) {
      if (element.__text.text === prop) return
      element.__text.text = prop
      if (element.__text.node) element.__text.node.nodeValue = prop
    } else create({ tag: 'string', text: prop }, element, '__text')
  }
}

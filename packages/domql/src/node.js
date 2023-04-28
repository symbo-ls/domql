'use strict'

import { exec, isFunction, isObject } from '@domql/utils'
import { applyEventsOnNode, triggerEventOn } from '@domql/event'
import { isMethod } from '@domql/methods'
import { cacheNode } from '@domql/node'

import create from './create'

import {
  throughInitialDefine,
  throughInitialExec
} from './iterate'
import { registry } from './mixins'
import { applyParam } from './applyParam'
// import { defineSetter } from './methods'

const ENV = process.env.NODE_ENV

export const createNode = (element, options) => {
  // create and assign a node
  let { node, tag, __ref } = element

  let isNewNode

  if (!node) {
    isNewNode = true

    if (!__ref.__if) return element

    if (tag === 'shadow') {
      node = element.node = element.parent.node.attachShadow({ mode: 'open' })
    } else node = element.node = cacheNode(element)

    // trigger `on.attachNode`
    triggerEventOn('attachNode', element)
  }

  // node.dataset // .key = element.key

  if (ENV === 'test' || ENV === 'development' || options.alowRefReference) {
    node.ref = element
    if (isFunction(node.setAttribute)) node.setAttribute('key', element.key)
  }

  if (!__ref.__if) return element

  // iterate through all given params
  if (element.tag !== 'string' || element.tag !== 'fragment') {
    // iterate through define
    throughInitialDefine(element)

    // iterate through exec
    throughInitialExec(element)

    // apply events
    if (isNewNode && isObject(element.on)) applyEventsOnNode(element)

    for (const param in element) {
      const prop = element[param]

      if (isMethod(param) || isObject(registry[param]) || prop === undefined) continue

      const isElement = applyParam(param, element, options)
      if (isElement) {
        const { hasDefine, hasContextDefine } = isElement
        if (element[param] && !hasDefine && !hasContextDefine) {
          create(exec(prop, element), element, param, options)
        }
      }
    }
  }

  // node.dataset.key = key
  return element
}

export default createNode

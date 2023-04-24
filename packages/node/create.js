'use strict'

import { isFunction, isObject } from '@domql/utils'
import { on } from '@domql/event'
import { defaultMethods } from '@domql/mixins'
import { cacheNode } from './cache'
// import { defineSetter } from './methods'
import { create } from '@domql/create'
import { isMethod } from '@domql/methods'
import { throughInitialDefine, throughInitialExec } from '@domql/iterate'
import { applyEventsOnNode } from '@domql/event/on'

const ENV = process.env.NODE_ENV

export const createNode = (element) => {
  let { node, tag } = element

  let isNewNode

  if (!node) {
    isNewNode = true

    if (tag === 'shadow') {
      node = element.node = element.parent.node.attachShadow({ mode: 'open' })
    } else node = element.node = cacheNode(element)

    // run `on.attachNode`
    if (element.on && isFunction(element.on.attachNode)) {
      on.attachNode(element.on.attachNode, element, element.state)
    }
  }

  // node.dataset // .key = element.key

  if (ENV === 'test' || ENV === 'development') {
    node.ref = element
    if (isFunction(node.setAttribute)) node.setAttribute('key', element.key)
  }

  // iterate through all given params
  if (element.tag !== 'string' || element.tag !== 'fragment') {
    // iterate through define
    if (isObject(element.define)) throughInitialDefine(element)

    // iterate through exec
    throughInitialExec(element)

    // apply events
    if (isNewNode && isObject(element.on)) applyEventsOnNode(element)

    for (const param in element) {
      const prop = element[param]

      if (isMethod(param) || isObject(defaultMethods[param]) || prop === undefined) continue

      const hasDefined = element.define && element.define[param]
      const ourMethod = defaultMethods[param]

      if (ourMethod) { // Check if param is in our method defaultMethods
        if (isFunction(ourMethod)) ourMethod(prop, element, node)
      } else if (element[param] && !hasDefined) {
        create(prop, element, param) // Create element
      }
    }
  }

  // node.dataset.key = key
  return element
}

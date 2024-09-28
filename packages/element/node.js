'use strict'

import { exec, isFunction, isObject, isUndefined } from '@domql/utils'
import { applyEventsOnNode, triggerEventOn } from '@domql/event'
import { cacheNode } from '@domql/render'
import { isMethod } from './methods'

import create from './create'

import {
  throughInitialDefine,
  throughInitialExec
} from './iterate'
import { registry } from './mixins'
import { applyParam } from './utils/applyParam'
import { isVariant } from './utils'
import { propagateEventsFromProps } from './utils/propEvents'
import { applyAnimationFrame } from '../event/on'
// import { defineSetter } from './methods'

const ENV = process.env.NODE_ENV

export const createNode = (element, options) => {
  // create and assign a node
  let { node, tag, __ref: ref } = element

  let isNewNode

  if (!node) {
    isNewNode = true

    if (!ref.__if) return element

    if (tag === 'shadow') {
      node = element.node = element.parent.node.attachShadow({ mode: 'open' })
    } else node = element.node = cacheNode(element)

    // trigger `on.attachNode`
    triggerEventOn('attachNode', element, options)
  }

  // node.dataset // .key = element.key

  if (ENV === 'test' || ENV === 'development' || options.alowRefReference) {
    node.ref = element
    if (isFunction(node.setAttribute)) node.setAttribute('key', element.key)
  }

  // iterate through define
  throughInitialDefine(element)

  // iterate through exec
  throughInitialExec(element)

  if (element.tag !== 'string' && element.tag !== 'fragment') {
    propagateEventsFromProps(element)

    // apply events
    applyAnimationFrame(element, options)

    if (isNewNode && isObject(element.on)) {
      applyEventsOnNode(element, options)
    }
  }

  for (const param in element) {
    const value = element[param]

    if (!Object.hasOwnProperty.call(element, param)) continue

    if (
      isUndefined(value) ||
      isMethod(param) ||
      isVariant(param) ||
      isObject(registry[param])
    ) continue

    const isElement = applyParam(param, element, options)
    if (isElement) {
      const { hasDefine, hasContextDefine } = isElement
      if (element[param] && !hasDefine && !hasContextDefine) {
        const createAsync = () => {
          create(exec(value, element), element, param, options)
        }

        if ((element.props && element.props.lazyLoad) || options.lazyLoad) {
          window.requestAnimationFrame(() => createAsync())
        } else createAsync()
      }
    }
  }

  // node.dataset.key = key
  return element
}

export default createNode

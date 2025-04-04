'use strict'

import {
  exec,
  isFunction,
  isObject,
  isUndefined,
  isVariant
} from '@domql/utils'
import { applyEventsOnNode, triggerEventOn } from '@domql/event'
import { cacheNode } from '@domql/render'
import { isMethod } from './methods/index.js'
import { create } from './create.js'

import {
  throughExecProps,
  throughInitialDefine,
  throughInitialExec
} from './iterate.js'
import { REGISTRY } from './mixins/index.js'
import { applyParam } from './utils/applyParam.js'
import { propagateEventsFromProps } from './utils/propEvents.js'
import { isNotProduction } from '@domql/utils/env.js'
// import { defineSetter } from './methods'

const ENV = process.env.NODE_ENV

export const createNode = async (element, options) => {
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
    await triggerEventOn('attachNode', element, options)
  }
  // node.dataset // .key = element.key

  if (isNotProduction(ENV) || options.alowRefReference) {
    node.ref = element
    if (isFunction(node.setAttribute)) node.setAttribute('key', element.key)
  }

  // iterate through exec props
  throughExecProps(element)

  // iterate through define
  throughInitialDefine(element)

  // iterate through exec
  throughInitialExec(element)

  if (element.tag !== 'string' && element.tag !== 'fragment') {
    propagateEventsFromProps(element)

    if (isNewNode && isObject(element.on)) {
      applyEventsOnNode(element, options)
    }
  }

  for (const param in element) {
    const value = element[param]

    if (!Object.hasOwnProperty.call(element, param)) continue

    if (
      isUndefined(value) ||
      isMethod(param, element) ||
      isVariant(param) ||
      isObject(REGISTRY[param])
    )
      continue

    const isElement = await applyParam(param, element, options)
    if (isElement) {
      const { hasDefine, hasContextDefine } = isElement
      if (element[param] && !hasDefine && !hasContextDefine) {
        const createAsync = async () => {
          await create(exec(value, element), element, param, options)
        }

        if ((element.props && element.props.lazyLoad) || options.lazyLoad) {
          window.requestAnimationFrame(async () => {
            await createAsync()
            // handle lazy load
            if (!options.preventUpdateListener) {
              await triggerEventOn('lazyLoad', element, options)
            }
          })
        } else await createAsync()
      }
    }
  }

  // node.dataset.key = key
  return element
}

export default createNode

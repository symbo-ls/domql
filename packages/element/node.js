'use strict'

import { isFunction, isMethod, isObject, isUndefined } from '@domql/utils'
import { applyEventsOnNode, triggerEventOn } from '@domql/event'
import { cacheNode } from '@domql/render'
import { create } from './create.js'

import {
  throughExecProps,
  throughInitialDefine,
  throughInitialExec
} from './iterate.js'
import { REGISTRY } from './mixins/index.js'
import { applyParam } from './utils/applyParam.js'
import setChildren from './children.js'
import { setContent } from './set.js'
// import { defineSetter } from './methods'

const ENV = process.env.NODE_ENV

export const createNode = (element, opts) => {
  // create and assign a node
  let { node, tag, __ref: ref } = element

  if (!ref.__if) return element

  let isNewNode

  if (!node) {
    isNewNode = true

    if (tag === 'shadow') {
      node = element.node = element.parent.node.attachShadow({ mode: 'open' })
    } else node = element.node = cacheNode(element)

    // trigger `on.attachNode`
    return triggerEventOn('attachNode', element, opts).then(() => {
      return continueCreateNode(element, opts, isNewNode, node)
    })
  }
  // node.dataset // .key = element.key

  if (ENV === 'test' || ENV === 'development' || opts.alowRefReference) {
    node.ref = element
    if (isFunction(node.setAttribute)) node.setAttribute('key', element.key)
  }

  // If node already exists, continue without attachNode event
  return continueCreateNode(element, opts, isNewNode, node)
}

// Helper to handle the rest of the logic with .then() chaining
function continueCreateNode (element, opts, isNewNode, node) {
  if (ENV === 'test' || ENV === 'development' || opts.alowRefReference) {
    node.ref = element
    if (isFunction(node.setAttribute)) node.setAttribute('key', element.key)
  }

  // throughExecProps
  return throughExecProps(element)
    .then(() => {
      return throughInitialDefine(element)
    })
    .then(() => {
      return throughInitialExec(element)
    })
    .then(() => {
      return applyEventsOnNode(element, { isNewNode, ...opts })
    })
    .then(() => {
      // for...in loop with promise chaining
      let chain = Promise.resolve()
      for (const param in element) {
        const value = element[param]
        if (
          !Object.hasOwnProperty.call(element, param) ||
          isUndefined(value) ||
          isMethod(param, element) ||
          isObject(REGISTRY[param])
        ) {
          continue
        }
        chain = chain.then(() => {
          return applyParam(param, element, opts).then(isElement => {
            if (isElement) {
              const { hasDefine, hasContextDefine } = isElement
              if (element[param] && !hasDefine && !hasContextDefine) {
                // handle lazy load
                if (
                  (element.props && element.props.lazyLoad) ||
                  opts.lazyLoad
                ) {
                  window.requestAnimationFrame(() => {
                    create(value, element, param, opts).then(() => {
                      if (!opts.preventUpdateListener) {
                        triggerEventOn('lazyLoad', element, opts)
                      }
                    })
                  })
                } else {
                  return create(value, element, param, opts)
                }
              }
            }
          })
        })
      }
      return chain
    })
    .then(() => {
      // setChildren
      let contentPromise
      if (element.children) {
        contentPromise = setChildren(element.children, element, opts)
      } else {
        contentPromise = Promise.resolve(element.content || element.content)
      }
      return contentPromise.then(content => {
        if (content) {
          return setContent(content, element, opts)
        }
      })
    })
    .then(() => {
      // node.dataset.key = key
      return element
    })
}

export default createNode

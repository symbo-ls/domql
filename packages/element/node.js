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

export const createNode = async (element, opts) => {
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
    await triggerEventOn('attachNode', element, opts)
  }
  // node.dataset // .key = element.key

  if (ENV === 'test' || ENV === 'development' || opts.alowRefReference) {
    node.ref = element
    if (isFunction(node.setAttribute)) node.setAttribute('key', element.key)
  }

  // iterate through exec props
  await throughExecProps(element)

  // iterate through define
  await throughInitialDefine(element)

  // iterate through exec
  await throughInitialExec(element)

  await applyEventsOnNode(element, { isNewNode, ...opts })

  const content = element.children
    ? await setChildren(element.children, element, opts)
    : element.content || element.content

  if (content) {
    await setContent(content, element, opts)
  }

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

    const isElement = await applyParam(param, element, opts)
    if (isElement) {
      const { hasDefine, hasContextDefine } = isElement
      if (element[param] && !hasDefine && !hasContextDefine) {
        const createAsync = async () => {
          await create(value, element, param, opts)
        }

        // TODO: test this with promise
        // handle lazy load
        if ((element.props && element.props.lazyLoad) || opts.lazyLoad) {
          window.requestAnimationFrame(async () => {
            await createAsync()
            if (!opts.preventUpdateListener) {
              await triggerEventOn('lazyLoad', element, opts)
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

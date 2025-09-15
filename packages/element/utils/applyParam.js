'use strict'

import { exec, isFunction } from '@domql/utils'
import { REGISTRY } from '../mixins/index.js'

export const applyParam = async (param, element, options) => {
  const { node, context, __ref: ref } = element
  const prop = await exec(element[param], element)

  const { onlyUpdate } = options

  const DOMQLProperty = REGISTRY[param]

  const DOMQLPropertyFromContext =
    context && context.registry && context.registry[param]
  const isGlobalTransformer = DOMQLPropertyFromContext || DOMQLProperty

  const hasDefine = element.define && element.define[param]
  const hasContextDefine = context && context.define && context.define[param]

  if (!ref.__if) return

  // Treat event-like keys (e.g., onClick, onRender) as events, not child elements
  if (
    typeof param === 'string' &&
    param.startsWith('on') &&
    param.length > 2 &&
    param[2] === param[2].toUpperCase()
  ) {
    // Normalize into element.on map so downstream event system can attach
    if (!element.on) element.on = {}
    const eventName = param.slice(2, 3).toLowerCase() + param.slice(3)
    if (element.on[eventName] === undefined) {
      element.on[eventName] = element[param]
    }
    // Avoid creating/processing a child element for this param
    return
  }

  // Reject pseudo selectors at element level (e.g., ':hover', '::before').
  // These are CSS targets, not DomQL element keys. Today we don't support
  // auto-generating CSS rules for pseudos. We fail fast to avoid creating
  // ghost elements that can cause render storms.
  if (typeof param === 'string' && param.charAt(0) === ':') {
    if (element?.warn) element.warn('UnsupportedPseudoSelector', { key: param, path: element.__ref?.path })
    return // Treat as handled; prevent child element creation
  }

  const hasOnlyUpdate = onlyUpdate
    ? onlyUpdate === param || element.lookup(onlyUpdate)
    : true

  // Heuristic: Detect CSS-like properties used at element level and ignore them
  // to prevent creating child elements out of style keys. In the future we may
  // auto-route these into `style` mixin here.
  // NOTE: We intentionally do NOT set styles here yet.
  const styleObj = node && node.style
  if (styleObj && typeof param === 'string') {
    const camel = param.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    const looksLikeCssKey = camel in styleObj || param in styleObj
    if (looksLikeCssKey) {
      const value = element[param]
      const isPrimitiveCssValue =
        typeof value === 'string' || typeof value === 'number'
      // Only treat as CSS-at-top-level if it's clearly a primitive CSS value
      // and there is no transformer/define that would handle this key
      if (
        isPrimitiveCssValue &&
        !isGlobalTransformer &&
        !hasDefine &&
        !hasContextDefine
      ) {
        // Optional: guidance once per element could be added via element.warn
        // element.warn?.('CSSPropertyAtTopLevelIgnored', { key: param, path: element.__ref?.path })
        return // Prevent child element creation for CSS props
      }
    }
  }

  if (isGlobalTransformer && !hasContextDefine && hasOnlyUpdate) {
    if (isFunction(isGlobalTransformer)) {
      const s = element.state || {}
      if (s.value === undefined) s.value = {}
      if (s.key === undefined && element?.key !== undefined) s.key = element.key
      if (s.parent === undefined) s.parent = element?.parent?.state || s.parent || {}
      await isGlobalTransformer(prop, element, node, { ...options, state: s })
    }
    return
  }

  return { hasDefine, hasContextDefine }
}

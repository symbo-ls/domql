'use strict'

import {
  concatAddExtends,
  deepClone,
  exec,
  getChildStateInKey,
  isArray,
  isNot,
  isNumber,
  isObject,
  isObjectLike,
  isState,
  isString
} from '@domql/utils'

/**
 * Apply data parameters on the DOM nodes
 * this should only work if `showOnNode: true` is passed
 */
export async function children (param, element, node) {
  const { __ref: ref, state } = element
  const { childrenAs, childExtends } = element.props || {}
  const children =
    (param && (await exec(param, element, state))) ||
    (element.props.children &&
      (await exec(element.props.children, element, state)))

  const childrenAsDefault = childrenAs

  if (children) {
    if (isObject(children)) {
      if (children.$$typeof) {
        return element.call('renderReact', children, element)
      }
      param = deepClone(children)
      param = Object.keys(param).map(v => {
        const val = param[v]
        return concatAddExtends(v, val)
      })
    } else if (isArray(children)) {
      param = deepClone(children)
      if (childrenAsDefault || childrenAsDefault !== 'element') {
        param = param.map(v => ({
          extends: childExtends,
          [childrenAsDefault]:
            (isObjectLike(v) && v) || childrenAsDefault === 'state'
              ? { value: v }
              : { text: v }
        }))
      }
    } else if (isString(children) || isNumber(children)) {
      element.removeContent()
      element.content = { text: param }
      return
    }
  }

  if (!param) return

  const filterReact = param.filter(v => !v.$$typeof)
  if (filterReact.length !== param.length) {
    const extractedReactComponents = param.filter(v => v.$$typeof)
    element.call('renderReact', extractedReactComponents, element)
  }
  param = filterReact

  if (isString(param)) {
    if (param === 'state') param = state.parse()
    else param = getChildStateInKey(param, state)
  }
  if (isState(param)) param = param.parse()
  if (isNot(param)('array', 'object')) return

  param = deepClone(param)

  if (ref.__childrenCache) {
    const equals = JSON.stringify(param) === JSON.stringify(ref.__childrenCache)
    if (equals) {
      ref.__noCollectionDifference = true
      return
    } else {
      ref.__childrenCache = deepClone(param)
      delete ref.__noCollectionDifference
    }
  } else {
    ref.__childrenCache = deepClone(param)
  }

  const obj = {
    tag: 'fragment',
    ignoreChildProps: true,
    childProps: element.props && element.props.childProps
  }

  for (const key in param) {
    const value = param[key]
    if (value) obj[key] = isObjectLike(value) ? value : { value }
  }

  element.removeContent()
  element.content = obj
}

export default children

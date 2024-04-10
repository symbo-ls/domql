'use strict'

import { isDefined, isFunction, isObjectLike, isProduction } from '@domql/utils'
import { TREE } from '../tree'
import { parseFilters, registry } from '../mixins'

// TODO: update these files
export const spotByPath = function (path) {
  const element = this
  const arr = [].concat(path)
  let active = TREE[arr[0]]

  if (!arr || !arr.length) return console.log(arr, 'on', element.key, 'is undefined')

  while (active.key === arr[0]) {
    arr.shift()
    if (!arr.length) break
    active = active[arr[0]]
    if (!active) return
  }

  return active
}

// TODO: update these files
export const lookup = function (key) {
  const element = this
  let { parent } = element

  while (parent.key !== key) {
    if (parent[key]) return parent[key]
    parent = parent.parent
    if (!parent) return
  }

  return parent
}

export const remove = function (params) {
  const element = this
  if (isFunction(element.node.remove)) element.node.remove()
  else if (!isProduction()) {
    console.warn('This item cant be removed')
    element.log()
  }
  delete element.parent[element.key]
}

export const get = function (param) {
  const element = this
  return element[param]
}

export const setProps = function (param, options) {
  const element = this
  if (!param || !element.props) return
  element.update({ props: param }, options)
  return element
}

// export const set = function () {
// }

// export const update = function () {
// }

export const defineSetter = (element, key, get, set) =>
  Object.defineProperty(element, key, { get, set })

export const keys = function () {
  const element = this
  const keys = []
  for (const param in element) {
    if (registry[param] && !parseFilters.elementKeys.includes(param)) { continue }
    keys.push(param)
  }
  return keys
}

export const parse = function (excl = []) {
  const element = this
  const obj = {}
  const keyList = keys.call(element)
  keyList.forEach(v => {
    if (excl.includes(v)) return
    const val = element[v]
    if (v === 'state') {
      if (element.__ref && !element.__ref.__hasRootState) return
      const parsedVal = isFunction(val && val.parse) ? val.parse() : val
      obj[v] = isFunction(parsedVal) ? parsedVal : JSON.parse(JSON.stringify(parsedVal || {}))
    } else if (v === 'scope') {
      if (element.__ref && !element.__ref.__hasRootScope) return
      obj[v] = JSON.parse(JSON.stringify(val || {}))
    } else if (v === 'props') {
      const { __element, update, ...props } = element[v]
      obj[v] = props
    } else if (isDefined(val)) obj[v] = val
  })
  return obj
}

export const parseDeep = function (excl = []) {
  const element = this
  const obj = parse.call(element, excl)
  for (const v in obj) {
    if (excl.includes(v)) return
    if (isObjectLike(obj[v])) { obj[v] = parseDeep.call(obj[v], excl) }
  }
  return obj
}

export const log = function (...args) {
  const element = this
  const { __ref } = element
  console.group(element.key)
  if (args.length) {
    args.forEach(v => console.log(`%c${v}:\n`, 'font-weight: bold', element[v]))
  } else {
    console.log(__ref.path)
    const keys = element.keys()
    keys.forEach(v => console.log(`%c${v}:\n`, 'font-weight: bold', element[v]))
  }
  console.groupEnd(element.key)
  return element
}

export const nextElement = function () {
  const element = this
  const { key, parent } = element
  const { __children } = parent.__ref

  const currentIndex = __children.indexOf(key)
  const nextChild = __children[currentIndex + 1]

  return parent[nextChild]
}

export const previousElement = function (el) {
  const element = el || this
  const { key, parent } = element
  const { __children } = parent.__ref

  if (!__children) return

  const currentIndex = __children.indexOf(key)
  return parent[__children[currentIndex - 1]]
}

export const METHODS = [
  'set',
  'update',
  'remove',
  'updateContent',
  'removeContent',
  'lookup',
  'spotByPath',
  'keys',
  'parse',
  'setProps',
  'parseDeep',
  'if',
  'log',
  'nextElement',
  'previousElement'
]

export const isMethod = function (param) {
  return METHODS.includes(param)
}

'use strict'

import { TREE } from '@domql/tree'
import { isFunction, isObject, isObjectLike } from '@domql/utils'
import { DEFAULT_METHODS } from '@domql/registry'
import { isProduction } from '@domql/env'

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
    if (!isObject(DEFAULT_METHODS[param])) {
      keys.push(param)
    }
  }
  return keys
}

export const parse = function () {
  const element = this
  const obj = {}
  const keys = element.keys()
  keys.forEach(v => (obj[v] = element[v]))
  return obj
}

export const parseDeep = function (param) {
  const element = this
  const orig = param || element
  const obj = {}
  const keys = orig.keys && orig.keys()
  if (!keys) return
  keys.forEach(v => {
    const prop = orig[v]
    if (isObjectLike(prop)) parseDeep(prop)
    else obj[v] = prop
  })
  return obj
}

export const log = function (...args) {
  const element = this
  console.group(element.key)
  if (args.length) {
    args.forEach(v => console.log(`%c${v}:\n`, 'font-weight: bold', element[v]))
  } else {
    console.log(element.path)
    const keys = element.keys()
    keys.forEach(v => console.log(`%c${v}:\n`, 'font-weight: bold', element[v]))
  }
  console.groupEnd(element.key)
  return element
}

export const METHODS = [
  'set',
  'update',
  'remove',
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

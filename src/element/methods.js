'use strict'

import { isDefined, isObjectLike } from '@domql/utils'
import { parseFilters, registry } from './mixins'

export const set = function () {
}

export const update = function () {
}

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

export const parse = function () {
  const element = this
  const obj = {}
  const keyList = keys.call(element)
  keyList.forEach(v => {
    let val = element[v]
    if (v === 'state' && val.parse) val = val.parse()
    if (v === 'props' && val.parse) {
      const { __element, update, ...props } = obj[v]
      obj[v] = props
    }
    if (isDefined(val)) obj[v] = val
  })
  return obj
}

export const parseDeep = function () {
  const element = this
  const obj = parse.call(element)
  for (const v in obj) {
    if (v === 'state' && obj[v].parse) obj[v] = obj[v].parse()
    else if (v === 'props') {
      const { __element, update, ...props } = obj[v]
      obj[v] = props
    } else if (isObjectLike(obj[v])) { obj[v] = parseDeep.call(obj[v]) }
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
  console.log(nextChild)

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

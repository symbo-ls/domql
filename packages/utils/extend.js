'use strict'

import { joinArrays } from './array.js'
import { checkIfKeyIsComponent } from './component.js'
import { isArray } from './types.js'

export const addExtend = (newExtend, elementExtend) => {
  if (!newExtend) return elementExtend
  const originalArray = isArray(elementExtend) ? elementExtend : [elementExtend]
  const receivedArray = isArray(newExtend) ? newExtend : [newExtend]
  return joinArrays(receivedArray, originalArray)
}

export const applyAdditionalExtend = (
  newExtend,
  element,
  extendKey = 'extends'
) => {
  if (!newExtend) return element
  const elementExtend = element[extendKey]
  const originalArray = isArray(elementExtend) ? elementExtend : [elementExtend]
  const receivedArray = isArray(newExtend) ? newExtend : [newExtend]
  const extend = joinArrays(receivedArray, originalArray)
  return { ...element, extends: extend }
}

export const getExtendsInElement = obj => {
  let result = []

  function traverse (o) {
    for (const key in o) {
      if (Object.hasOwnProperty.call(o, key)) {
        // Check if the key starts with a capital letter and exclude keys like @mobileL, $propsCollection
        if (checkIfKeyIsComponent(key)) {
          result.push(key)
        }

        // Check if the key is "extend" and it's either a string or an array
        if (key === 'extends') {
          // Add the value of the extend key to the result array
          if (typeof o[key] === 'string') {
            result.push(o[key])
          } else if (Array.isArray(o[key])) {
            result = result.concat(o[key])
          }
        }

        // If the property is an object, traverse it
        if (typeof o[key] === 'object' && o[key] !== null) {
          traverse(o[key])
        }
      }
    }
  }

  traverse(obj)
  return result
}

'use strict'

import { isArray, isNumber, isString } from './types'

export const arrayContainsOtherArray = (arr1, arr2) => {
  return arr2.every(val => arr1.includes(val))
}

export const removeFromArray = (arr, index) => {
  if (isString(index)) index = parseInt(index)
  if (isNumber(index)) {
    if (index < 0 || index >= arr.length || isNaN(index)) {
      throw new Error('Invalid index')
    }
    arr.splice(index, 1)
  } else if (isArray(index)) {
    index.forEach(idx => removeFromArray(arr, idx))
  } else {
    throw new Error('Invalid index')
  }
  return arr
}

export const swapItemsInArray = (arr, i, j) => {
  [arr[i], arr[j]] = [arr[j], arr[i]]
}

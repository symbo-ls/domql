'use strict'

import { matchesComponentNaming } from '@domql/utils'
import { REGISTRY } from '../mixins/index.js'

export const createValidDomqlObjectFromSugar = (el, parent, key, options) => {
  const newElem = {
    props: {},
    define: {}
  }

  const allowedKeys = ['data', 'state', 'attr', 'if']

  for (const k in el) {
    const value = el[k]
    const isComponent = matchesComponentNaming(k)
    const isRegistry = REGISTRY[k]
    if (isComponent || isRegistry || allowedKeys.includes(k)) {
      newElem[k] = value
    } else {
      newElem.props[k] = value
    }
  }
  return newElem
}

'use strict'

import { lowercaseFirstLetter } from './string.js'
import { isFunction } from './types.js'

export function addEventFromProps (key, obj) {
  const { props, on } = obj
  const eventName = lowercaseFirstLetter(key.split('on')[1])
  const origEvent = on[eventName]
  const funcFromProps = props[key]
  if (isFunction(origEvent)) {
    on[eventName] = async (...args) => {
      const originalEventRetunrs = await origEvent(...args)
      if (originalEventRetunrs !== false) await funcFromProps(...args)
    }
  } else on[eventName] = funcFromProps
}

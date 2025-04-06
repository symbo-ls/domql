'use strict'

import { isFunction, lowercaseFirstLetter } from '@domql/utils'

export const propagateEventsFromProps = (element) => {
  const { props, on } = element
  const eventKeysFromProps = Object.keys(props).filter(key => key.startsWith('on'))
  eventKeysFromProps.forEach(v => {
    const eventName = lowercaseFirstLetter(v.split('on')[1])
    const origEvent = on[eventName]
    const funcFromProps = props[v]
    if (isFunction(origEvent)) {
      on[eventName] = (...args) => {
        const originalEventRetunrs = origEvent(...args)
        if (originalEventRetunrs !== false) return funcFromProps(...args)
      }
    } else on[eventName] = funcFromProps
  })
}

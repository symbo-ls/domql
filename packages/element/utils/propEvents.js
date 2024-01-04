'use strict'

import { lowercaseFirstLetter } from '@domql/utils'

export const propagateEventsFromProps = (element) => {
  const { props, on } = element
  const eventKeysFromProps = Object.keys(props).filter(key => key.startsWith('on'))
  eventKeysFromProps.forEach(v => {
    const eventName = lowercaseFirstLetter(v.split('on')[1])
    if (on[eventName]) {
      on[eventName] = (...args) => {
        on[eventName](...args)
        props[v](...args)
      }
    } else on[eventName] = props[v]
  })
}

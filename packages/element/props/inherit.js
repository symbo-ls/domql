'use strict'

import { exec, is, isString } from '@domql/utils'

const objectizeStringProperty = propValue => {
  if (is(propValue)('string', 'number')) {
    return { inheritedString: propValue }
  }
  return propValue
}

export const inheritParentProps = (element, parent) => {
  let propsStack = []
  const parentProps = exec(parent, parent.state).props

  const matchParent = parent.props && parentProps[element.key]
  const matchParentIsString = isString(matchParent)
  const matchParentChildProps = parentProps && parentProps.childProps

  if (matchParent) {
    if (matchParentIsString) {
      const inheritedStringExists = propsStack.filter(v => v.inheritedString)[0]
      if (inheritedStringExists) inheritedStringExists.inheritedString = matchParent
      else {
        propsStack = [].concat(objectizeStringProperty(matchParent), propsStack)
      }
    } else {
      propsStack.push(objectizeStringProperty(matchParent))
    }
  }
  if (matchParentChildProps) propsStack.push(matchParentChildProps)

  return propsStack
}

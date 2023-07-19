'use strict'

export const updateProps = (newProps, element, parent) => {
  const { __ref } = element
  let propsStack = __ref.__props

  const parentProps = inheritParentProps(element, parent)
  if (parentProps) propsStack = __ref.__props = [].concat(parentProps, propsStack)
  if (newProps) propsStack = __ref.__props = [].concat(newProps, propsStack)

  if (propsStack) syncProps(propsStack, element)

  return element
}

function update (props, options) {
  const element = this.__element
  element.update({ props }, options)
}

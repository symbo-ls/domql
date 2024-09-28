'use strict'

import {
  isObject,
  isString,
  overwriteDeep,
  checkIfKeyIsComponent,
  addAdditionalExtend,
  hasVariantProp,
  isVariant
} from '@domql/utils'

import { applyExtend } from '../extend'
import { registry } from '../mixins'

const replaceOnKeys = key => key.replace(/on\w+/g, match => match.substring(2))

export const createValidDomqlObjectFromSugar = (el, parent, key, options) => {
  const newElem = {
    props: {},
    on: {}
  }
  for (const k in el) {
    const prop = el[k]
    const isEvent = k.startsWith('on')
    if (isEvent) {
      const onKey = replaceOnKeys(prop)
      newElem.on[onKey] = prop
    // } else if (!isMethod && checkIfKeyIsProperty(k)) {
    }

    const isComponent = checkIfKeyIsComponent(k)
    const isRegistry = registry[k]
    if (isComponent || isRegistry) {
      newElem[k] = prop
    } else {
      newElem.props[k] = prop
    }
  }
  return newElem
}

export const overwriteVariant = (element, variant, variantProps) => {
  let variantElement = element[variant]
  if (!variantElement) return
  const props = isObject(variantProps) ? variantProps : {}
  if (isString(variantElement)) {
    variantElement = {
      extend: [{ props }, variantElement]
    }
  } else if (variantElement.extend) {
    variantElement = addAdditionalExtend({ props }, variantElement)
  }
  const extendedVariant = applyExtend(variantElement, element.parent)
  const { parent, ...rest } = extendedVariant
  return overwriteDeep(element, rest) // TODO: check why string is not working
  // return overwriteDeep(element, applyExtend(variantElement, element.parent)) // TODO: check why string is not working
}

export const applyVariant = (element) => {
  const { props } = element
  if (!hasVariantProp(element)) return element
  const { variant } = props
  overwriteVariant(element, `.${variant}`)

  const elKeys = Object.keys(element).filter((key) => isVariant(key))
  elKeys.forEach((variant) => {
    const slicedVariantElementKey = variant.slice(1)
    const variantElementProps = props[slicedVariantElementKey]
    if (variantElementProps) overwriteVariant(element, variant, variantElementProps)
  })

  return element
}

'use strict'

import {
  isObject,
  isString,
  overwriteDeep,
  checkIfKeyIsComponent,
  applyAdditionalExtend,
  hasVariantProp,
  isVariant
} from '@domql/utils'

import { applyExtend } from '../extend.js'
import { REGISTRY } from '../mixins/index.js'

export const createValidDomqlObjectFromSugar = (el, parent, key, options) => {
  const newElem = {
    props: {},
    define: {}
  }

  const allowedKeys = ['data', 'state', 'attr', 'if']

  for (const k in el) {
    const value = el[k]
    const isComponent = checkIfKeyIsComponent(k)
    const isRegistry = REGISTRY[k]
    if (isComponent || isRegistry || allowedKeys.includes(k)) {
      newElem[k] = value
    } else {
      newElem.props[k] = value
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
  } else if (variantElement.extends) {
    variantElement = applyAdditionalExtend({ props }, variantElement)
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

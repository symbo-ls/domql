'use strict'

import { checkIfKeyIsComponent } from './component.js'
import { HTML_TAGS } from './tags.js'
import { is } from './types.js'

const ENV = process.env.NODE_ENV

export const returnValueAsText = (element, parent, key) => {
  const childExtendsTag = parent.childExtends && parent.childExtends.tag
  const childPropsTag = parent.props.childProps && parent.props.childProps.tag
  const isKeyValidHTMLTag = HTML_TAGS.body.indexOf(key) > -1 && key
  return {
    text: element,
    tag: childExtendsTag || childPropsTag || isKeyValidHTMLTag || 'string'
  }
}

export const createBasedOnType = (element, parent, key) => {
  // if ELEMENT is not given
  if (element === undefined) {
    if (ENV === 'test' || ENV === 'development') {
      console.warn(
        key,
        'element is undefined in',
        parent && parent.__ref && parent.__ref.path
      )
    }
    return {}
  }

  if (element === null) return
  if (element === true) return {}

  if (is(element)('string', 'number')) {
    return returnValueAsText(element, parent, key)
  }

  // if element is extend
  if (element.__hash) {
    return { extends: [element] }
  }

  return element
}

export const addCaching = (element, parent) => {
  const { __ref: ref, key } = element
  let { __ref: parentRef } = parent

  // enable CACHING
  if (!ref.__cached) ref.__cached = {}
  if (!ref.__defineCache) ref.__defineCache = {}

  // enable EXEC
  if (!ref.__exec) ref.__exec = {}
  if (!ref.__execProps) ref.__execProps = {}

  // enable CLASS CACHING
  if (!ref.__class) ref.__class = {}
  if (!ref.__classNames) ref.__classNames = {}

  // enable CLASS CACHING
  if (!ref.__attr) ref.__attr = {}

  // enable CHANGES storing
  if (!ref.__changes) ref.__changes = []

  // enable CHANGES storing
  if (!ref.__children) ref.__children = []

  if (checkIfKeyIsComponent(key)) {
    ref.__componentKey = key.split('_')[0].split('.')[0].split('+')[0]
  }

  // Add _root element property
  const hasRoot = parent && parent.key === ':root'
  if (!ref.root) ref.root = hasRoot ? element : parentRef.root

  // set the PATH array
  // if (ENV === 'test' || ENV === 'development') {
  if (!parentRef) parentRef = parent.ref = {}
  if (!parentRef.path) parentRef.path = []
  ref.path = parentRef.path.concat(element.key)
  // }
}

export const addRef = (element, parent) => {
  if (element.__ref) element.__ref.origin = element
  else element.__ref = { origin: element }
  return element.__ref
}

'use strict'

import React, { useRef } from 'react'

// import React, { useEffect, useRef } from 'react'

import { create } from '@domql/element'
import { isArray, isString, merge } from '@domql/utils'
// import { clone } from '@domql/utils'

const createText = (text) => ({
  type: 'fragment',
  children: text
})

const createReactText = (text) => {
  return React.createElement(React.Fragment, null, text)
}

export const transformReact = (element, key) => {
  const { ref } = element
  const { tag, props, ...rest } = ref
  let children = ref.children
  if (rest.class) props.className = rest.class
  if (isArray(children)) {
    children = children.map(child => child.ref.transform.react).filter(x => x !== undefined)
  }
  if (element.text) {
    if (isArray(children)) children.push(element.ref.text)
    else children = [element.ref.text]
  }
  if (key) props.key = key
  return {
    type: tag,
    props,
    children
  }
}

const deepCreate = (element, key) => {
  const { children } = element
  const type = (element.type === 'fragment' || element.type === 'text') ? React.Fragment : element.type

  if (isArray(children)) {
    element.children = children.map(deepCreate)
    return React.createElement(type, element.props, ...element.children)
  }
}

const renderReact = (element, key) => {
  const { ref } = element
  const { props, transform } = ref
  const { react } = transform
  props.ref = useRef(ref)
  return <React.StrictMode>{ deepCreate(react) }</React.StrictMode>
}

export const DOMQLReact = (component, props, state) => {
  const element = create({
    extends: component,
    props,
    state
  }, null, null, {
    transform: { react: transformReact }
  })
  const ReactElement = renderReact(element, element.key)
  return ReactElement
}

// const onEachAvailable = (element, key) => {
//   return transformReact(element, key)
// }

// const createCompoonent = (extnds, props, state) => {
//   return create({extends: extnds, props, state}, {
//     transform: {
//       react: transformReact
//     },
//     onEachAvailable
//   })
// }

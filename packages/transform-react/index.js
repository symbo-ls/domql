'use strict'

import React, { useRef } from 'react'

// import React, { useEffect, useRef } from 'react'

import { create } from '@domql/element'
import { merge } from '@domql/utils'
// import { clone } from '@domql/utils'

export const transformReact = (element, key) => {
  const { ref } = element
  const { tag, props, ...rest } = ref
  let children = ref.children
  if (children && children.length) { children = children.map(child => child.ref.transform.react) }
  if (rest.class) props.className = rest.class
  return {
    type: tag,
    props,
    children
  }
}

const renderReact = (element, key) => {
  const { ref } = element
  const { props, transform } = ref
  const { react } = transform
  props.ref = useRef(ref)
  return <React.StrictMode>
    { React.createElement(react.type, react.props, react.props.children) }
  </React.StrictMode>
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

export const DOMQLReact = (component, props, state) => {
  const element = create({
    extends: component,
    props,
    state
  }, null, null, { transform: { react: transformReact } })
  const ReactElement = renderReact(element, element.key)
  return ReactElement
}

'use strict'

import React, { useRef } from 'react'

// import React, { useEffect, useRef } from 'react'

import { create } from '@domql/element'
import { merge } from '@domql/utils'
// import { clone } from '@domql/utils'

// export function DOMQLRenderer (component, ref, receivedProps, receivedState) {
//   const { current } = ref
//   const { DOMQLElement } = current
//   const { children, ...p } = receivedProps

//   const props = clone(p)
//   const state = clone(receivedState)

//   if (!DOMQLElement) {
//     const el = create({
//       proto: component,
//       node: current.DOMQLElement,
//       state: state,
//       props: props,
//       content: (el) => {
//         // const portal = ReactDOM.createPortal(receivedProps.children, el.node)
//         return {
//           node: ReactDOM.createPortal(receivedProps.children, el.node)
//         }
//       }
//     }, current)
//     // }, current, undefined, { insertAfter: true })
//     current.DOMQLElement = el.node
//     // ref.current.remove()
//   } else {
//     // const { ref } = DOMQLElement
//     // ref.props = props
//     // ref.set(el => {
//     //   ReactDOM.render(children, el.node)
//     //   return { tag: 'fragment' }
//     // })
//     //   .update({
//     //     props,
//     //     state
//     //   })
//   }
// }

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

  console.warn('transform react:')
  console.log(react)
  return React.createElement(react.type, react.props, Object.assign(react.props.children, react.children))
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
  console.warn('create react:')
  console.log(element)
  console.log(ReactElement)
  return ReactElement
  // return ({
  //   useEffect(() => {
  //     createCompoonent(component, props, state)
  //   })
  // })
}

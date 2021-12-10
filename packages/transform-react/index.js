'use strict'

import React, { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'

import { create } from '@domql/element'
import { clone } from '@domql/utils'

export function DOMQLRenderer (component, ref, receivedProps, receivedState) {
  const { current } = ref
  const { DOMQLElement } = current
  const { children, ...p } = receivedProps

  const props = clone(p)
  const state = clone(receivedState)

  if (!DOMQLElement) {
    const el = create({
      proto: component,
      node: current.DOMQLElement,
      state: state,
      props: props,
      content: (el) => {
        // const portal = ReactDOM.createPortal(receivedProps.children, el.node)
        return {
          node: ReactDOM.createPortal(receivedProps.children, el.node)
        }
      }
    }, current)
    // }, current, undefined, { insertAfter: true })
    current.DOMQLElement = el.node
    // ref.current.remove()
  } else {
    // const { ref } = DOMQLElement
    // ref.props = props
    // ref.set(el => {
    //   ReactDOM.render(children, el.node)
    //   return { tag: 'fragment' }
    // })
    //   .update({
    //     props,
    //     state
    //   })
  }
}

export const transformReact = (element, key) => {
  const { ref } = element
  const { tag, props, children, ...rest } = ref
  return {
    type: tag,
    props,
    children
  }
}

const onEachAvailable = (element, key) => {
  return transformReact(element, key)
}

const createCompoonent = (extnds, props, state) => {
  return create({extends: extnds, props, state}, {
    transform: {
      react: transformReact
    },
    onEachAvailable
  })
}

export const DOMQLReact = (component, props, state) => {
  return createCompoonent(component, props, state)
  // return ({
  //   useEffect(() => {
  //     createCompoonent(component, props, state)
  //   })
  // })
}

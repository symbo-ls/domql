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

export const reactTransformer = (component, props, state) => {
  const ref = useRef(null)
  return (
    <span ref={ref}>
      {
        useEffect(() => {
          DOMQLRenderer(component, ref, props, state)
        })
      }
    </span>
  )
}

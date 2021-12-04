'use strict'

import React, { useEffect, useRef } from 'react'
import { create } from '@domql/element'
import { clone } from '@domql/utils'

export function DOMQLRenderer (component, parent, props, node) {
  create({
    proto: component,
    node,
    props: clone(props)
  }, parent)
}

export const reactTransformer = (component, props, state) => {
  const ref = useRef(null)
  let node
  return (
    <span ref={ref}>
      {props.text}
      {
        useEffect(() => {
          DOMQLRenderer(component, ref.current, props, node)
        })
      }
    </span>
  )
}

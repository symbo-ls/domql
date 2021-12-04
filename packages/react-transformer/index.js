'use strict'

import React, { useEffect, useRef } from 'react'
import { create } from '@domql/element'
import { clone } from '@domql/utils'

export function DOMQLRenderer (component, parent, props) {
  create({
    proto: component,
    props: clone(props)
  }, parent)
}

export const reactTransformer = (component, props, state) => {
  const ref = useRef(null)
  return (
    <React.Fragment ref={ref}>
      {props.text}
      {
        useEffect(() => {
          DOMQLRenderer(component, ref.current, props)
        })
      }
    </React.Fragment>
  )
}

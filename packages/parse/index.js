'use strict'

<<<<<<<< HEAD:packages/element/parse.js
import { assignNode } from '@domql/render'
import create from './create'
========
import { create } from '@domql/create'
import { assignNode } from '@domql/render'
>>>>>>>> feature/v2:packages/parse/index.js

export const parse = (element) => {
  const virtualTree = {
    node: document.createElement('div')
  }

  if (element && element.node) assignNode(element, virtualTree)
  else create(element, virtualTree)

  return virtualTree.node.innerHTML
}

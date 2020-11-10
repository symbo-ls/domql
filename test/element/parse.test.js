'use strict'

import 'regenerator-runtime/runtime'
import { create, parse } from '../../src/element'

const element = create({ tag: 'header', text: 'asd' })

test('should UPDATE element', () => {
  const html = parse(element)
  expect(html).toBe('<header>asd</header>')

  // var equal = element.node.isEqualNode(create({
  //   text: 'test'
  // }).node)
  // expect(equal).toBeTruthy()
})

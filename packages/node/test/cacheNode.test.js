const { cacheNode } = require('../dist/cjs/cacheNode')

describe('cacheNode', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('returns a cloned cached node for a valid element', () => {
    const element = { tag: 'div' }
    const expectedNode = document.createElement('div')

    const actualNode = cacheNode(element)
    expect(actualNode).not.toBe(expectedNode)
    expect(actualNode.tagName).toBe(expectedNode.tagName)
  })

  test('returns a cloned cached text node for an element with a "string" tag', () => {
    const element = { tag: 'string', text: 'hello world' }
    const expectedNode = document.createTextNode('hello world')

    const actualNode = cacheNode(element)
    expect(actualNode).not.toBe(expectedNode)
    expect(actualNode.nodeValue).toBe(expectedNode.nodeValue)
  })
})

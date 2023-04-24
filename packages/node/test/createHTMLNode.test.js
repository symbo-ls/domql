const { createHTMLNode } = require('../dist/cjs/cache')

describe('createHTMLNode', () => {
  test('returns a text node when passed an element with a "string" tag', () => {
    const element = { tag: 'string', text: 'hello world' }
    const node = createHTMLNode(element)
    expect(node.nodeType).toBe(window.Node.TEXT_NODE)
    expect(node.textContent).toBe('hello world')
  })

  test('returns a document fragment when passed an element with a "fragment" tag', () => {
    const element = { tag: 'fragment' }
    const node = createHTMLNode(element)
    expect(node.nodeType).toBe(window.Node.DOCUMENT_FRAGMENT_NODE)
  })

  test('returns an SVG element when passed an element with a "svg" tag', () => {
    const element = { tag: 'svg' }
    const node = createHTMLNode(element)
    expect(node.tagName).toBe('svg')
    expect(node.namespaceURI).toBe('http://www.w3.org/2000/svg')
  })

  test('returns an SVG element when passed an element with a "path" tag', () => {
    const element = { tag: 'path' }
    const node = createHTMLNode(element)
    expect(node.tagName).toBe('path')
    expect(node.namespaceURI).toBe('http://www.w3.org/2000/svg')
  })

  test('returns an element with the specified tag when passed an element with a valid tag', () => {
    const element = { tag: 'div' }
    const node = createHTMLNode(element)
    expect(node.tagName).toBe('DIV')
  })
})

import { ROOT, TREE } from '../tree'

describe('ROOT/TREE initialization and report()', () => {
  // Test 1: ROOT object structure
  it('initializes ROOT with :root key and document.body node', () => {
    expect(ROOT.key).toBe(':root')
    expect(ROOT.node).toBe(document.body) // Works in JSDOM
  })

  // Test 2: TREE === ROOT
  it('assigns TREE to reference ROOT', () => {
    expect(TREE).toBe(ROOT)
    expect(TREE.node).toBe(document.body)
  })
})

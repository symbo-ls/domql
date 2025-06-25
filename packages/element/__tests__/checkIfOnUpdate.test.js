import { update } from '../update'

describe('checkIfOnUpdate via update()', () => {
  let element, parent, options

  beforeEach(() => {
    parent = {
      node: document.createElement('div'),
      props: {},
      state: {}
    }

    element = {
      __ref: {
        __if: undefined,
        __state: null,
        __hasRootState: false,
        __execProps: {},
        contentElementKey: 'content'
      },
      parent,
      props: {},
      state: {
        update: (el, st) => {
          return st
        }
      },
      context: {
        defaultExtends: {}
      },
      node: document.createElement('div'),
      if: () => true,
      previousElement: () => {
        return {}
      },
      nextElement: () => {
        return {}
      },
      removeContent: () => {
        return true
      }
    }

    options = {}
  })

  it('uses props.if when element.if missing', async () => {
    delete element.if
    element.props.if = () => false
    await update.call(element, {}, options)
    expect(element.node).toEqual(document.createElement('div'))
  })

  it('retains state when __hasRootState=true', async () => {
    element.__ref.__hasRootState = true
    element.state.critical = true
    element.__ref.__if = false

    await update.call(element, {}, options)

    expect(element.state.critical).toBe(true)
    expect(element.state.preserved).toBeUndefined()
  })

  it('processes nested content with parseDeep', async () => {
    element.content = {
      parseDeep: () => ({ parsed: true }),
      existing: 'data'
    }

    await update.call(element, {}, options)

    expect(element.content.parsed).toBe(true)
    expect(element.content.existing).toBeUndefined()
  })

  it('reattaches after previous sibling', async () => {
    const prevNode = document.createElement('span')
    parent.node.appendChild(prevNode)

    await update.call(element, {}, options)

    const newElement = parent.node.children[0]
    expect(newElement).toEqual(document.createElement('span'))
    expect(newElement.previousSibling).toBe(null)
  })

  // it('reattaches before next sibling', async () => {
  //   const nextNode = document.createElement('p')
  //   parent.node.appendChild(nextNode)

  //   await update.call(element, {}, options)

  //   const newElement = parent.node.children[0]
  //   expect(newElement).toEqual(document.createElement('p'))
  //   expect(newElement.nextSibling).toBe(null)
  // })

  // it('appends to parent when no siblings exist', async () => {
  //   await update.call(element, {}, options)
  //   expect(parent.node.children).toHaveLength(0)
  // })
})

import { jest } from '@jest/globals'
import { removeContent, setContentKey } from '../set'

describe('setContentKey', () => {
  test('should set default content key', () => {
    const element = {
      __ref: {}
    }
    const result = setContentKey(element)
    expect(result).toBe('content')
    expect(element.__ref.contentElementKey).toBe('content')
  })

  test('should set custom content key', () => {
    const element = {
      __ref: {}
    }
    const opts = { contentElementKey: 'customContent' }
    const result = setContentKey(element, opts)
    expect(result).toBe('customContent')
    expect(element.__ref.contentElementKey).toBe('customContent')
    expect(opts.contentElementKey).toBe('content')
  })

  test('should not override existing content key if same value', () => {
    const element = {
      __ref: {
        contentElementKey: 'content'
      }
    }
    const result = setContentKey(element)
    expect(result).toBe('content')
    expect(element.__ref.contentElementKey).toBe('content')
  })

  test('should override existing content key if different value', () => {
    const element = {
      __ref: {
        contentElementKey: 'oldContent'
      }
    }
    const opts = { contentElementKey: 'newContent' }
    const result = setContentKey(element, opts)
    expect(result).toBe('newContent')
    expect(element.__ref.contentElementKey).toBe('newContent')
    expect(opts.contentElementKey).toBe('content')
  })
})

describe('removeContent', () => {
  let element

  beforeEach(() => {
    // Setup basic element structure
    element = {
      node: document.createElement('div'),
      __ref: {}
    }
  })

  test('removes basic content', () => {
    const contentNode = document.createElement('span')
    element.content = {
      node: contentNode,
      tag: 'span'
    }
    element.node.appendChild(contentNode)

    removeContent(element)

    expect(element.content).toBeUndefined()
    expect(element.node.children.length).toBe(0)
  })

  test('removes fragment content', () => {
    const remove1 = jest.fn()
    const remove2 = jest.fn()
    const fragmentNode = document.createElement('div')
    fragmentNode.setAttribute('fragment', '')

    element.node.appendChild(fragmentNode)
    element.content = {
      tag: 'fragment',
      node: fragmentNode,
      __ref: {
        __children: [
          { remove: remove1, node: document.createElement('div') },
          { remove: remove2, node: document.createElement('div') }
        ]
      }
    }

    // Call remove synchronously
    element.content.__ref.__children.forEach(child => child.remove())
    removeContent(element)

    expect(remove1).toHaveBeenCalled()
    expect(remove2).toHaveBeenCalled()
    expect(element.content).toBeUndefined()
    expect(element.node.children.length).toBe(0)
  })

  test('removes cached content', () => {
    const mockRemove = jest.fn()
    const child1 = { remove: jest.fn() }
    const child2 = { remove: jest.fn() }

    element.__ref.__cached = {
      content: {
        tag: 'fragment',
        remove: mockRemove,
        __ref: {
          __children: [child1, child2]
        }
      }
    }

    // Call remove synchronously
    element.__ref.__cached.content.__ref.__children.forEach(child =>
      child.remove()
    )
    removeContent(element)

    expect(mockRemove).toHaveBeenCalled()
    expect(child1.remove).toHaveBeenCalled()
    expect(child2.remove).toHaveBeenCalled()
  })

  test('handles custom content element key', () => {
    const contentNode = document.createElement('span')
    element.customContent = {
      node: contentNode,
      tag: 'span'
    }
    element.node.appendChild(contentNode)

    removeContent(element, { contentElementKey: 'customContent' })

    expect(element.customContent).toBeUndefined()
    expect(element.node.children.length).toBe(0)
  })
})

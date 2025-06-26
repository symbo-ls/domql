import { jest } from '@jest/globals'
import { removeContent, set, setContentKey } from '../set'

describe('set', () => {
  let element, ref

  beforeEach(() => {
    ref = {
      contentElementKey: 'content',
      __noChildrenDifference: false
    }
    element = {
      __ref: ref,
      props: {},
      children: [],
      context: { components: {} },
      state: {},
      node: document.createElement('div'),
      childExtends: {},
      parent: { node: document.createElement('div') }
    }
  })

  // 1. Basic Content Updates
  it('updates element.props when params.props are provided', () => {
    set.call(element, { props: { title: 'New Title' } })
    expect(element.content.props.title).toBe('New Title')
  })

  // 2. Deep Equality Checks
  it('skips update when deepContains matches existing content', () => {
    ref.__noChildrenDifference = true
    const originalProps = { ...element.props }
    set.call(element, { props: { id: 'same' } })
    expect(element.props).toEqual(originalProps)
  })

  // 3. ChildExtends Inheritance
  it('merges element.childExtends into params when missing', () => {
    element.childExtends = { button: 'PrimaryButton' }
    const params = { tag: 'fragment', props: {} }
    set.call(element, params)
    expect(params.childExtends).toEqual({ button: 'PrimaryButton' })
    expect(params.props.ignoreChildExtends).toBe(true)
  })

  // 6. Prevent Content Update
  it('preserves content when preventContentUpdate=true and no children', () => {
    const originalContent = element[ref.contentElementKey]
    set.call(element, { props: { new: true } }, { preventContentUpdate: true })
    expect(element[ref.contentElementKey]).toBeDefined()
    expect(originalContent).toBeUndefined()
  })

  // 7. ChildProps Inheritance
  it('copies element.props.childProps into params when missing', () => {
    element.props.childProps = { size: 'large' }
    const params = { tag: 'fragment', props: {} }
    set.call(element, params)
    expect(params.props.childProps).toEqual({ size: 'large' })
    expect(params.props.ignoreChildProps).toBe(true)
  })

  // 8. Event Blocking
  it('preserves state when beforeUpdate returns false', () => {
    ref.__noChildrenDifference = true
    const originalState = { ...element.state }

    // Simulate beforeUpdate rejection by not changing state
    set.call(element, { state: { shouldChange: true } })
    expect(element.state).toEqual(originalState)
  })

  // 9. DOM Node Handling
  it('updates node reference when provided in params', () => {
    const newNode = document.createElement('section')
    set.call(element, { node: newNode })
    expect(element.node.tagName).toBe('DIV')
  })

  // 11. Context Component Resolution
  it('resolves context components in params', () => {
    element.context.components = { Header: {} }
    set.call(element, { Header: {} })
    expect(element.Header).toBeUndefined()
  })

  // 12. Nested Property Updates
  it('updates nested props without mutating original', () => {
    const originalProps = { nested: { value: 1 } }
    element.props = originalProps
    set.call(element, { props: { nested: { value: 2 } } })
    expect(element.props.nested.value).toBe(1)
    expect(originalProps.nested.value).toBe(1) // No mutation
  })

  // 13. Empty Param Handling
  it('preserves existing props when params=null', () => {
    element.props = { preserveMe: true }
    set.call(element, null)
    expect(element.props.preserveMe).toBe(true)
  })

  // 14. Content Removal
  it('removes content correctly when calling removeContent', () => {
    const content = document.createElement('div')
    element.content = {
      node: content,
      tag: 'div',
      remove: jest.fn()
    }
    element.node.appendChild(content)
    set.call(element, { props: { new: true } })
    expect(element.content.__ref).toBeDefined()
    expect(element.node.contains(content)).toBeFalsy()
  })

  // 15. Lazy Loading
  it('handles lazy loading with requestAnimationFrame', () => {
    jest.useFakeTimers()
    element.props = { lazyLoad: true }
    const params = { props: { test: true } }

    set.call(element, params)
    jest.runAllTimers()

    setTimeout(() => {
      expect(element.content).toBeDefined()
    }, 35)
    jest.useRealTimers()
  })

  // 17. Fragment Content
  it('handles fragment content removal correctly', () => {
    const remove1 = jest.fn(() => Promise.resolve())
    const remove2 = jest.fn(() => Promise.resolve())
    const node1 = document.createElement('div')
    const node2 = document.createElement('div')

    element.tag = 'fragment'
    element.content = {
      tag: 'fragment',
      node: element.node,
      __ref: {
        __children: ['child1', 'child2']
      },
      child1: { node: node1, remove: remove1 },
      child2: { node: node2, remove: remove2 }
    }

    element.node.appendChild(node1)
    element.node.appendChild(node2)

    set.call(element, { props: { new: true } })

    expect(remove1).toHaveBeenCalled()
    expect(remove2).toHaveBeenCalled()
  })

  it('handles fragment content removal with children', () => {
    const remove1 = jest.fn()
    const remove2 = jest.fn()
    const node1 = document.createElement('div')
    const node2 = document.createElement('div')

    element.content = {
      tag: 'fragment',
      node: element.node,
      __ref: {
        __children: ['child1', 'child2']
      },
      child1: { node: node1, remove: remove1 },
      child2: { node: node2, remove: remove2 }
    }

    element.node.appendChild(node1)
    element.node.appendChild(node2)

    set.call(element, { props: { new: true } })

    expect(remove1).toHaveBeenCalled()
    expect(remove2).toHaveBeenCalled()
  })

  it('merges element.childExtends into params when tag is fragment', () => {
    element.tag = 'fragment'
    element.childExtends = { button: 'PrimaryButton' }
    const params = { tag: 'fragment', props: {} }
    set.call(element, params)
    expect(params.childExtends).toEqual(element.childExtends)
  })

  it('copies element.props.childProps into params for fragments', () => {
    element.tag = 'fragment'
    element.props.childProps = { size: 'large' }
    const params = { tag: 'fragment', props: {} }
    set.call(element, params)
    expect(params.props.childProps).toEqual(element.props.childProps)
  })
})

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
    const node1 = document.createElement('div')
    const node2 = document.createElement('div')
    const fragmentNode = document.createElement('div')
    fragmentNode.setAttribute('fragment', '')

    element.node.appendChild(node1)
    element.node.appendChild(node2)
    element.content = {
      tag: 'fragment',
      node: fragmentNode,
      __ref: {
        __children: ['child1', 'child2']
      },
      child1: { node: node1, remove: remove1 },
      child2: { node: node2, remove: remove2 }
    }

    removeContent(element)

    expect(remove1).toHaveBeenCalled()
    expect(remove2).toHaveBeenCalled()
    expect(element.content).toBeUndefined()
    expect(element.node.children.length).toBe(0)
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

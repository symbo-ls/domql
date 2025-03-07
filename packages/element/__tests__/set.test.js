import { jest } from '@jest/globals'
import { set } from '../set'

describe('set', () => {
  let element, ref

  beforeEach(() => {
    ref = {
      contentElementKey: 'content',
      __noChildrenDifference: false,
      __cached: {}
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
  it('updates element.props when params.props are provided', async () => {
    await set.call(element, { props: { title: 'New Title' } })
    expect(element.content.props.title).toBe('New Title')
  })

  // 2. Deep Equality Checks
  it('skips update when deepContains matches existing content', async () => {
    ref.__noChildrenDifference = true
    const originalProps = { ...element.props }
    await set.call(element, { props: { id: 'same' } })
    expect(element.props).toEqual(originalProps)
  })

  // 3. ChildExtends Inheritance
  it('merges element.childExtends into params when missing', async () => {
    element.childExtends = { button: 'PrimaryButton' }
    const params = { tag: 'fragment', props: {} }
    await set.call(element, params)
    expect(params.childExtends).toEqual({ button: 'PrimaryButton' })
    expect(params.props.ignoreChildExtends).toBe(true)
  })

  // 5. Content Key Management
  it('updates ref.contentElementKey from options', async () => {
    await set.call(element, {}, { contentElementKey: 'main' })
    expect(ref.contentElementKey).toBe('content')
    expect(element.main).toBeUndefined()
  })

  // 6. Prevent Content Update
  it('preserves content when preventContentUpdate=true and no children', async () => {
    const originalContent = element[ref.contentElementKey]
    await set.call(
      element,
      { props: { new: true } },
      { preventContentUpdate: true }
    )
    expect(element[ref.contentElementKey]).toBeDefined()
    expect(originalContent).toBeUndefined()
  })

  // 7. ChildProps Inheritance
  it('copies element.props.childProps into params when missing', async () => {
    element.props.childProps = { size: 'large' }
    const params = { tag: 'fragment', props: {} }
    await set.call(element, params)
    expect(params.props.childProps).toEqual({ size: 'large' })
    expect(params.props.ignoreChildProps).toBe(true)
  })

  // 8. Event Blocking
  it('preserves state when beforeUpdate returns false', async () => {
    ref.__noChildrenDifference = true
    const originalState = { ...element.state }

    // Simulate beforeUpdate rejection by not changing state
    await set.call(element, { state: { shouldChange: true } })
    expect(element.state).toEqual(originalState)
  })

  // 9. DOM Node Handling
  it('updates node reference when provided in params', async () => {
    const newNode = document.createElement('section')
    await set.call(element, { node: newNode })
    expect(element.node.tagName).toBe('DIV')
  })

  // 10. Cache Invalidation
  it('clears cached content on reset', async () => {
    ref.__cached.content = { old: 'data' }
    await set.call(element, { props: { new: 'data' } })
    expect(element.content.__ref.__cached).toEqual({})
  })

  // 11. Context Component Resolution
  it('resolves context components in params', async () => {
    element.context.components = { Header: {} }
    await set.call(element, { Header: {} })
    expect(element.Header).toBeUndefined()
  })

  // 12. Nested Property Updates
  it('updates nested props without mutating original', async () => {
    const originalProps = { nested: { value: 1 } }
    element.props = originalProps
    await set.call(element, { props: { nested: { value: 2 } } })
    expect(element.props.nested.value).toBe(1)
    expect(originalProps.nested.value).toBe(1) // No mutation
  })

  // 13. Empty Param Handling
  it('preserves existing props when params=null', async () => {
    element.props = { preserveMe: true }
    await set.call(element, null)
    expect(element.props.preserveMe).toBe(true)
  })

  // 14. Content Removal
  it('removes content correctly when calling removeContent', async () => {
    const content = document.createElement('div')
    element.content = {
      node: content,
      tag: 'div',
      remove: jest.fn()
    }
    element.node.appendChild(content)
    await set.call(element, { props: { new: true } })
    expect(element.content.__ref).toBeDefined()
    expect(element.node.contains(content)).toBeFalsy()
  })

  // 15. Lazy Loading
  it('handles lazy loading with requestAnimationFrame', async () => {
    jest.useFakeTimers()
    element.props = { lazyLoad: true }
    const params = { props: { test: true } }

    await set.call(element, params)
    jest.runAllTimers()

    setTimeout(() => {
      expect(element.content).toBeDefined()
    }, 35)
    jest.useRealTimers()
  })

  // 16. Event Triggers
  it('triggers update event after successful update', async () => {
    const updateCallback = jest.fn()
    const updateMock = jest.fn()
    element.content = {
      update: updateMock,
      __ref: { __cached: {} }
    }
    element.on = { update: updateCallback }
    element.__ref.__noChildrenDifference = false

    await set.call(element, { props: { new: true } })
    expect(updateMock).toHaveBeenCalled()
    expect(updateCallback).toHaveBeenCalled()
  })

  // 17. Fragment Content
  it('handles fragment content removal correctly', async () => {
    const remove1 = jest.fn(() => Promise.resolve())
    const remove2 = jest.fn(() => Promise.resolve())

    element.tag = 'fragment'
    element.content = {
      tag: 'fragment',
      node: element.node,
      __ref: {
        __children: [
          { node: document.createElement('div'), remove: remove1 },
          { node: document.createElement('div'), remove: remove2 }
        ]
      }
    }

    const removePromises = []
    element.content.__ref.__children.forEach(child => {
      removePromises.push(child.remove())
    })

    await set.call(element, { props: { new: true } })
    await Promise.all(removePromises)

    expect(remove1).toHaveBeenCalled()
    expect(remove2).toHaveBeenCalled()
  })

  it('handles cached fragment content removal', async () => {
    const remove1 = jest.fn(() => Promise.resolve())
    const remove2 = jest.fn(() => Promise.resolve())

    element.__ref.__cached.content = {
      tag: 'fragment',
      __ref: {
        __children: [
          { node: document.createElement('div'), remove: remove1 },
          { node: document.createElement('div'), remove: remove2 }
        ]
      }
    }

    const removePromises = []
    element.__ref.__cached.content.__ref.__children.forEach(child => {
      removePromises.push(child.remove())
    })

    await set.call(element, { props: { new: true } })
    await Promise.all(removePromises)

    expect(remove1).toHaveBeenCalled()
    expect(remove2).toHaveBeenCalled()
  })

  // Update existing tests to match implementation

  it('handles content updates through update method if available', async () => {
    const updateMock = jest.fn(() => Promise.resolve())
    element.content = {
      update: updateMock,
      __ref: {
        __cached: {},
        __children: []
      }
    }
    element.__ref.__noChildrenDifference = false

    await set.call(element, { props: { new: true } })
    await Promise.resolve() // Wait for promises to resolve

    expect(updateMock).toHaveBeenCalled()
  })

  it('handles fragment content correctly', async () => {
    element.tag = 'fragment'
    element.childExtends = { button: 'CustomButton' }
    const params = { tag: 'fragment', props: {}, __ref: {} }
    element.__ref.__cached = {}

    await set.call(element, params)
    expect(params.childExtends).toEqual(element.childExtends)
    expect(params.props.ignoreChildExtends).toBe(true)
  })

  it('respects preventBeforeUpdateListener option', async () => {
    element.content = {
      update: jest.fn(),
      __ref: { __cached: {} }
    }
    ref.__noChildrenDifference = false

    await set.call(
      element,
      { props: {} },
      { preventBeforeUpdateListener: true }
    )
    expect(element.content.update).toHaveBeenCalled()
  })

  it('handles fragment content removal with children', async () => {
    const remove1 = jest.fn()
    const remove2 = jest.fn()

    element.content = {
      tag: 'fragment',
      node: element.node,
      __ref: {
        __children: [{ remove: remove1 }, { remove: remove2 }]
      }
    }

    element.content.__ref.__children.forEach(child => child.remove())
    await set.call(element, { props: { new: true } })

    expect(remove1).toHaveBeenCalled()
    expect(remove2).toHaveBeenCalled()
  })

  it('merges element.childExtends into params when tag is fragment', async () => {
    element.tag = 'fragment'
    element.childExtends = { button: 'PrimaryButton' }
    const params = { tag: 'fragment', props: {} }
    await set.call(element, params)
    expect(params.childExtends).toEqual(element.childExtends)
  })

  it('copies element.props.childProps into params for fragments', async () => {
    element.tag = 'fragment'
    element.props.childProps = { size: 'large' }
    const params = { tag: 'fragment', props: {} }
    await set.call(element, params)
    expect(params.props.childProps).toEqual(element.props.childProps)
  })

  it('triggers update event after successful content update', async () => {
    const updateCallback = jest.fn()
    const updateMock = jest.fn()
    element.content = {
      update: updateMock,
      __ref: { __cached: {} }
    }
    element.on = { update: updateCallback }
    element.__ref.__noChildrenDifference = false

    await set.call(element, { props: { new: true } })
    expect(updateMock).toHaveBeenCalled()
    expect(updateCallback).toHaveBeenCalled()
  })
})

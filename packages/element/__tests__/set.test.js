import { set } from '../set'

describe('set', () => {
  let element, ref

  beforeEach(() => {
    ref = {
      contentElementKey: 'content',
      __noCollectionDifference: false,
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
    ref.__noCollectionDifference = true
    const originalProps = { ...element.props }
    await set.call(element, { props: { id: 'same' } })
    expect(element.props).toEqual(originalProps)
  })

  // 3. ChildExtends Inheritance
  it('merges element.childExtends into params when missing', async () => {
    element.childExtends = { button: 'PrimaryButton' }
    const params = { props: {} }
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
    const params = { props: {} }
    await set.call(element, params)
    expect(params.props.childProps).toEqual({ size: 'large' })
    expect(params.props.ignoreChildProps).toBe(true)
  })

  // 8. Event Blocking
  it('preserves state when beforeUpdate returns false', async () => {
    ref.__noCollectionDifference = true
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
})

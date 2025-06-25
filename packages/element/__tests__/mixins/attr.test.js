import { attr } from '../../mixins/attr'

describe('attr', () => {
  let element, node

  beforeEach(() => {
    node = document.createElement('div')
    element = {
      __ref: { __attr: {} },
      props: {}
    }
  })

  it('should throw error when params is not an object', () => {
    expect(() => attr('invalid', element, node)).toThrowError(
      '"0" did not match the Name production'
    )
  })

  it('should set attributes and update __ref.__attr', () => {
    const params = { id: 'test', title: 'example' }
    attr(params, element, node)

    expect(node.getAttribute('id')).toBe('test')
    expect(node.getAttribute('title')).toBe('example')
    expect(element.__ref.__attr).toEqual({
      id: 'test',
      title: 'example'
    })
  })

  it('should merge props.attr with params using deepMerge', () => {
    element.props.attr = { 'data-extra': 'value' }
    const params = { id: 'main' }

    attr(params, element, node)

    expect(node.getAttribute('id')).toBe('main')
    expect(node.getAttribute('data-extra')).toBe('value')
    expect(element.__ref.__attr).toEqual({
      id: 'main',
      'data-extra': 'value'
    })
  })

  it('should remove attributes for false/null/undefined values', () => {
    node.setAttribute('hidden', 'true')
    element.__ref.__attr.hidden = true

    attr({ hidden: false }, element, node)
    expect(node.hasAttribute('hidden')).toBe(false)
    expect(element.__ref.__attr.hidden).toBe(false)

    node.setAttribute('title', 'test')
    attr({ title: null }, element, node)
    expect(node.hasAttribute('title')).toBe(false)
    expect(element.__ref.__attr.title).toBe(null)

    node.setAttribute('lang', 'en')
    attr({ lang: undefined }, element, node)
    expect(node.hasAttribute('lang')).toBe(false)
    expect(element.__ref.__attr.lang).toBeUndefined()
  })

  it('should handle nodes without attribute methods', () => {
    const unsafeNode = {}
    const params = { id: 'test' }

    expect(() => attr(params, element, unsafeNode)).not.toThrow()
    expect(element.__ref.__attr.id).toBe('test')
  })

  it('should deeply merge nested objects', () => {
    element.props.attr = { data: { role: 'user' } }
    const params = { data: { id: 1 } }

    attr(params, element, node)

    expect(element.__ref.__attr.data).toEqual({
      id: 1,
      role: 'user'
    })
  })

  it('should prioritize params over props.attr for primitive values', () => {
    element.props.attr = { id: 'old' }
    const params = { id: 'new' }

    attr(params, element, node)

    expect(node.getAttribute('id')).toBe('new')
    expect(element.__ref.__attr.id).toBe('new')
  })
})

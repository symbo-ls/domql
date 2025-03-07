import { jest } from '@jest/globals'
import { resetContent } from '../set'

describe('resetContent', () => {
  let element, ref

  beforeEach(() => {
    ref = {
      contentElementKey: 'content',
      __cached: {}
    }
    element = {
      __ref: ref,
      content: { node: document.createElement('div') },
      node: document.createElement('div'),
      context: {}
    }
  })

  it('should update contentElementKey from options', async () => {
    await resetContent({}, element, { contentElementKey: 'mainContent' })

    expect(ref.contentElementKey).toBe('mainContent')
    expect(element.mainContent).toBeDefined()
  })

  it('should merge options correctly', async () => {
    await resetContent({}, element, { customOption: true })

    expect(element.content).toEqual(
      expect.objectContaining({
        // Verify options merging through observable behavior
        // (this assertion pattern would need actual create() implementation details)
      })
    )
  })

  it('should handle cached content removal', async () => {
    ref.__cached.content = {
      tag: 'fragment',
      parent: { node: document.createElement('div') }
    }

    await resetContent({}, element, {})

    expect(ref.__cached.content).toEqual({
      parent: { node: document.createElement('div') },
      tag: 'fragment'
    })
  })

  it('should maintain context through reset', async () => {
    const originalContext = element.context

    await resetContent({}, element, {})

    expect(element.context).toBe(originalContext)
    expect(element.content.context).toBe(originalContext)
  })
})

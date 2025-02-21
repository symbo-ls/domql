import { setContentKey } from '../content'

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

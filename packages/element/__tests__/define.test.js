import define from '../define'
import { REGISTRY } from '../mixins'

describe('default function (registry updater)', () => {
  let originalRegistry

  beforeEach(() => {
    // Save the original REGISTRY to restore after each test
    originalRegistry = { ...REGISTRY }
  })

  afterEach(() => {
    // Restore the original REGISTRY after each test
    Object.keys(REGISTRY).forEach(key => {
      REGISTRY[key] = originalRegistry[key]
    })
  })

  it('should add new params to REGISTRY when overwrite is true', () => {
    const params = { newKey: 'newValue', anotherKey: 'anotherValue' }
    const options = { overwrite: true }

    define(params, options)

    expect(REGISTRY.newKey).toBe('newValue')
    expect(REGISTRY.anotherKey).toBe('anotherValue')
  })

  it('should not modify REGISTRY when trying to overwrite existing keys without overwrite option', () => {
    const params = { attr: 'newValue', text: 'newText' }

    try {
      define(params)
    } catch (e) {
      // Ignore the error
    }

    expect(REGISTRY.attr).toBe(originalRegistry.attr)
    expect(REGISTRY.text).toBe(originalRegistry.text)
  })

  it('should overwrite existing keys when overwrite is true', () => {
    const params = { attr: 'newValue', text: 'newText' }
    const options = { overwrite: true }

    define(params, options)

    expect(REGISTRY.attr).toBe('newValue')
    expect(REGISTRY.text).toBe('newText')
  })

  it('should handle empty params object without errors', () => {
    const params = {}
    const options = { overwrite: true }

    expect(() => define(params, options)).not.toThrow()
    expect(REGISTRY).toEqual(originalRegistry)
  })

  it('should handle empty options object without errors', () => {
    const params = { newKey: 'newValue' }

    expect(() => define(params, {})).not.toThrow()
    expect(REGISTRY.newKey).toBe('newValue')
  })

  it('should not add new keys when params is empty', () => {
    const params = {}
    const options = { overwrite: true }

    define(params, options)

    expect(REGISTRY).toEqual(originalRegistry)
  })
})

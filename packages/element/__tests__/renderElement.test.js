import { jest } from '@jest/globals'

describe('create()', () => {
  let props
  let parent

  const OLD_ENV = process.env

  beforeEach(() => {
    props = {
      __ref: { __if: false, path: [], __skipCreate: true },
      key: 'testKey',
      context: {
        defaultExtends: {},
        define: ['test']
      },
      scope: 'props',
      define: ['test']
    }
    parent = {
      testKey: 'parentTestKey',
      key: 'parentKey'
    }
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  test('should execute onlyResolveExtends when __skipCreate is true', async () => {
    props.__ref.__skipCreate = true
    props.scope = undefined
    const { create } = await import('../create')
    await create(props, parent, 'passedKey', {
      onlyResolveExtends: true,
      define: ['test']
    })
    expect(parent.__ref).toBeUndefined()
    expect(parent.passedKey).toBe(props.__ref.parent.passedKey)
  })

  test('should execute onlyResolveExtends when __ref.__if is true', async () => {
    props.__ref.__if = true
    props.scope = 'state'
    const { create } = await import('../create')
    await create(props, parent, 'passedKey', {
      onlyResolveExtends: true,
      define: ['test']
    })
    expect(parent.__ref).toBeUndefined()
    expect(parent.passedKey).toBe(props.__ref.parent.passedKey)
  })

  test('should execute onlyResolveExtends when scope is not state', async () => {
    process.env.NODE_ENV = 'prod'
    props.__ref = undefined
    const { create } = await import('../create')
    await create(props, parent, 'passedKey', { onlyResolveExtends: true })
    expect(parent.__ref).toBeUndefined()
    expect(parent.passedKey).toBe(props.__ref.parent.passedKey)
  })

  test('should execute catch statement when __ref is undefined', async () => {
    process.env.NODE_ENV = 'prod'
    props.__ref = undefined
    const { create } = await import('../create')
    await create(props, parent, 'passedKey')
    expect(parent.__ref).toBeUndefined()
    expect(parent.passedKey).toBe(props.__ref.parent.passedKey)
  })

  test('should attaches element to parent when ref.__if is false', async () => {
    process.env.NODE_ENV = 'prod'
    const { create } = await import('../create')
    await create(props, parent, 'passedKey')
    expect(parent.__ref).toBeUndefined()
    expect(parent.passedKey).toBe(props.__ref.parent.passedKey)
  })

  test('should attach element to parent when ref.__if is true', async () => {
    process.env.NODE_ENV = 'prod'
    props.__if = true
    const { create } = await import('../create')
    await create(props, parent, 'passedKey')
    expect(parent.testKey).toBe('parentTestKey')
    expect(parent.passedKey).toBe(props.__ref.parent.passedKey)
  })

  test('skips createNestedChild when __uniqId exists', async () => {
    process.env.NODE_ENV = 'prod'
    props.__ref = { __uniqId: 'existing-id', path: [] }
    const { create } = await import('../create')
    await create(props, {}, 'passedKey')
    expect(props.__ref.__uniqId).toBeDefined()
  })

  test('skips createNestedChild when infinite loop detected', async () => {
    process.env.NODE_ENV = 'prod'
    props.__ref = { path: ['loop-path'], __uniqId: undefined }
    const { create } = await import('../create')
    await create(props, {}, 'passedKey')
    expect(props.__ref.__uniqId).toBeDefined()
  })

  test('should modifies path containing ComponentsGrid', async () => {
    process.env.NODE_ENV = 'prod'
    props.__ref = { path: ['ComponentsGrid', 'x', 'y', 'z'] }
    const { create } = await import('../create')
    await create(props, {}, ['ComponentsGrid', 'x', 'y', 'z'])
    expect(props.__ref.path).toEqual(['ComponentsGrid,x,y,z'])
  })

  test('should modifies path containing demoComponent', async () => {
    process.env.NODE_ENV = 'prod'
    props.__ref = { path: ['demoComponent', 'a', 'b', 'c'] }
    const { create } = await import('../create')
    await create(props, {}, ['demoComponent', 'a', 'b', 'c'])
    expect(props.__ref.path).toEqual(['demoComponent,a,b,c'])
  })

  test('uses element.key when key property is missing', async () => {
    process.env.NODE_ENV = 'prod'
    props.__ref = { __if: false, path: [] }
    props.key = 'fallbackKey'
    const { create } = await import('../create')
    await create(props, parent, null)
    expect(props.__ref.parent.fallbackKey).toBeDefined()
  })
})

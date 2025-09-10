jest.mock('@domql/element/mixins/registry.js', () => ({
  REGISTRY: {
    attr: () => {},
    style: () => {},
    text: () => {},
    html: () => {},
    content: () => {},
    data: () => {},
    class: () => {},
    state: () => {},
    scope: () => {},
    deps: () => {},
    extend: {},
    childExtend: {},
    props: {},
    path: {},
    if: {},
    define: {},
    transform: {},
    __name: {},
    __ref: {},
    __hash: {},
    __text: {},
    nextElement: {},
    previousElement: {},
    key: {},
    tag: {},
    query: {},
    parent: {},
    node: {},
    set: {},
    reset: {},
    update: {},
    error: {},
    warn: {},
    call: {},
    setProps: {},
    remove: {},
    updateContent: {},
    removeContent: {},
    variables: {},
    lookup: {},
    lookdown: {},
    getRef: {},
    getPath: {},
    lookdownAll: {},
    setNodeStyles: {},
    spotByPath: {},
    append: {},
    routes: {},
    keys: {},
    log: {},
    parse: {},
    parseDeep: {},
    on: {},
    component: {},
    context: {},
    $collection: {},
    $stateCollection: {},
    $propsCollection: {},
    $setCollection: {},
    $setStateCollection: {}
  }
}), { virtual: true })

const { validateDomQL } = require('../dist/cjs/validator.js')

describe('validateDomQL', () => {
  test('warns on unknown top-level key', () => {
    const element = { foo: {} }
    const { errors, warnings } = validateDomQL(element)
    expect(errors).toHaveLength(0)
    expect(warnings.some((w) => w.rule === 'unknown-key' && w.path.join('.') === 'foo')).toBe(true)
  })

  test('errors on self-extend via string and array', () => {
    const elStr = { Button: { extend: 'Button' } }
    const elArr = { Card: { extend: ['Header', 'Card'] } }
    const resStr = validateDomQL(elStr)
    const resArr = validateDomQL(elArr)
    expect(resStr.errors.some((e) => e.rule === 'self-extend' && e.path.join('.') === 'Button.extend')).toBe(true)
    expect(resArr.errors.some((e) => e.rule === 'self-extend' && e.path.join('.') === 'Card.extend')).toBe(true)
  })

  test('warns on unresolved extend when context provided', () => {
    const element = { Widget: { extend: 'Missing' } }
    const context = { components: { Existing: {} }, pages: { '/ok': {} } }
    const { warnings } = validateDomQL(element, { context })
    expect(warnings.some((w) => w.rule === 'extend-unresolved' && w.path.join('.') === 'Widget.extend')).toBe(true)
  })

  test('errors when style/attr are not objects', () => {
    const element = { style: 'red', attr: 'id' }
    const { errors } = validateDomQL(element)
    expect(errors.some((e) => e.rule === 'style-object' && e.path.join('.') === 'style')).toBe(true)
    expect(errors.some((e) => e.rule === 'attr-object' && e.path.join('.') === 'attr')).toBe(true)
  })

  test('on.* must be functions and risky lifecycle warn on update calls', () => {
    const element = {
      on: {
        click: 123,
        render: function () { this.state && this.state.update && this.state.update({}) }
      }
    }
    const { errors, warnings } = validateDomQL(element)
    expect(errors.some((e) => e.rule === 'on-function' && e.path.join('.') === 'on.click')).toBe(true)
    expect(warnings.some((w) => w.rule === 'loop-risk-lifecycle-update' && w.path.join('.') === 'on.render')).toBe(true)
  })

  test('children should be array or function; keys missing/duplicate warnings', () => {
    const badType = { children: {} }
    const { warnings: w1 } = validateDomQL(badType)
    expect(w1.some((w) => w.rule === 'children-array-or-fn')).toBe(true)

    const withIssues = {
      children: [
        { tag: 'div', key: 'a' },
        { tag: 'div' },
        { tag: 'div', key: 'a' }
      ]
    }
    const { warnings: w2 } = validateDomQL(withIssues)
    expect(w2.some((w) => w.rule === 'children-key-missing')).toBe(true)
    expect(w2.some((w) => w.rule === 'children-key-duplicate')).toBe(true)
  })

  test('props functions and children function side-effects detection', () => {
    const element = {
      props: {
        foo: function () { this.state && this.state.replace && this.state.replace({}) }
      },
      children: function () { this.update && this.update({}) }
    }
    const { warnings } = validateDomQL(element)
    expect(warnings.some((w) => w.rule === 'prop-side-effect' && w.path.join('.') === 'props.foo')).toBe(true)
    expect(warnings.some((w) => w.rule === 'children-side-effect' && w.path.join('.') === 'children')).toBe(true)
  })

  test('props nesting warnings: props.props and props.state', () => {
    const element = { props: { props: {}, state: {} } }
    const { warnings } = validateDomQL(element)
    expect(warnings.some((w) => w.rule === 'props-in-props' && w.path.join('.') === 'props.props')).toBe(true)
    expect(warnings.some((w) => w.rule === 'state-in-props' && w.path.join('.') === 'props.state')).toBe(true)
  })
})



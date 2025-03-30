import {
  pickupElementFromProps,
  pickupPropsFromElement,
  propertizeElement
} from '../props'

describe('propertizeElement', () => {
  it('should handle nested component properties', () => {
    const element = {
      NestedComponent: {
        data: { nested: true }
      }
    }

    propertizeElement.call(element)

    expect(element).toEqual({
      NestedComponent: {
        data: { nested: true }
      }
    })
  })

  it('should handle spread elements', () => {
    const element = {
      0: { content: 'First' },
      1: { content: 'Second' }
    }

    propertizeElement.call(element)

    expect(element).toEqual({
      0: { content: 'First' },
      1: { content: 'Second' }
    })
  })

  it('should handle correct property management', () => {
    const onClick = () => {}

    const element = {
      on: {},
      boxSizing: 'border-box',
      props: { onClick, H4: {} },
      Hello: {}
    }

    propertizeElement.call(element)

    expect(element).toEqual({
      props: {
        boxSizing: 'border-box'
      },
      on: {
        click: onClick
      },
      Hello: {},
      H4: {}
    })
  })

  it('should handle nested props correctly', () => {
    const element = {
      props: {
        style: { color: 'red' },
        NestedComponent: { data: { nested: true } }
      }
    }

    propertizeElement.call(element)

    expect(element).toEqual({
      NestedComponent: {
        data: { nested: true }
      },
      style: { color: 'red' },
      props: {}
    })
  })
})

describe('Complex component structures', () => {
  const element = {
    extends: 'Flex',
    props: {
      round: 'Z1',
      maxWidth: 'fit-content',
      border: '.7px dashed #232E31'
    },
    Flex: {
      border: '1px solid #232E31',
      round: 'Z1',
      margin: '-1px',
      childProps: {
        ':first-child': {
          border: '.7px dashed #232E31',
          round: 'Z1'
        }
      }
    }
  }

  it('should handle complex nested components with extends', () => {
    const result = propertizeElement.call(element)

    expect(result).toEqual({
      extends: 'Flex',
      props: {
        round: 'Z1',
        maxWidth: 'fit-content',
        border: '.7px dashed #232E31'
      },
      Flex: {
        border: '1px solid #232E31',
        round: 'Z1',
        margin: '-1px',
        childProps: {
          ':first-child': {
            border: '.7px dashed #232E31',
            round: 'Z1'
          }
        }
      }
    })
  })

  it('should handle complex nested components with extends', () => {
    if (!element.Flex.props) element.Flex.props = {}

    const result = propertizeElement.call(element, element.Flex)

    expect(result).toEqual({
      props: {
        border: '1px solid #232E31',
        round: 'Z1',
        margin: '-1px',
        childProps: {
          ':first-child': {
            border: '.7px dashed #232E31',
            round: 'Z1'
          }
        }
      }
    })
  })
})

describe('Complex recursive component structures', () => {
  it('should recursively handle redefining properties', () => {
    const change = (event, element, state) => {
      state.update({
        method: element.node.value
      })
    }

    const stateUpdate = (_, el, s) => {
      console.log('STATE UPDATED:')
      console.log(s)
    }

    const component = {
      extends: 'Flex',

      props: {
        flow: 'y',
        onStateUpdate: stateUpdate
      },

      state: {
        method: 'GET',
        headers: {}
      },

      TitleField: {
        key: 'titleState',
        Title: { text: 'Title' },
        Input: { placeholder: 'Title of the state' }
      },

      GroupField: {
        width: '100%',

        Title: {
          text: 'Connect to a custom URL'
        },

        Flex: {
          flow: 'x',
          align: 'stretch start',

          childProps: {
            borderRadius: 'Y',
            ':first-child': { borderRadius: 'Y 0 0 Y' },
            ':last-child': { borderRadius: '0 Y Y 0' }
          },

          SelectField: {
            Select: {
              theme: null,
              borderRadius: 'X2',

              Get: {
                text: 'Get',
                value: 'GET'
              },
              Post: {
                text: 'Post',
                value: 'POST'
              },
              onChange: change
            }
          }
        }
      }
    }

    const recursive = el => {
      if (!el.on) el.on = {}
      if (!el.props) el.props = {}
      if (!el.define) el.define = {}
      for (const key in el) {
        const isElement = /^[A-Z]/.test(key) || /^\d+$/.test(key)
        if (isElement) {
          if (!el[key].on) el[key].on = {}
          if (!el[key].props) el[key].props = {}
          if (!el[key].define) el[key].define = {}
          el[key] = recursive(el[key])
        }
      }
      return propertizeElement.call(el, el)
    }

    const result = recursive(component)

    expect(result).toEqual({
      on: {
        stateUpdate
      },
      define: {},
      extends: 'Flex',

      props: {
        flow: 'y'
      },

      state: {
        method: 'GET',
        headers: {}
      },

      TitleField: {
        key: 'titleState',

        props: {},
        define: {},
        on: {},
        Title: {
          define: {},
          props: {},
          on: {},
          text: 'Title'
        },
        Input: {
          define: {},
          on: {},
          props: { placeholder: 'Title of the state' }
        }
      },

      GroupField: {
        props: {
          width: '100%'
        },
        on: {},
        define: {},

        Title: {
          text: 'Connect to a custom URL',
          define: {},
          props: {},
          on: {}
        },

        Flex: {
          props: {
            flow: 'x',
            align: 'stretch start',

            childProps: {
              borderRadius: 'Y',
              ':first-child': { borderRadius: 'Y 0 0 Y' },
              ':last-child': { borderRadius: '0 Y Y 0' }
            }
          },

          on: {},
          define: {},

          SelectField: {
            props: {},
            define: {},
            on: {},
            Select: {
              props: {
                theme: null,
                borderRadius: 'X2'
              },

              Get: {
                props: {
                  value: 'GET'
                },
                text: 'Get',
                define: {},
                on: {}
              },
              Post: {
                props: {
                  value: 'POST'
                },
                text: 'Post',
                define: {},
                on: {}
              },

              define: {},
              on: {
                change
              }
            }
          }
        }
      }
    })
  })
})

describe('pickupPropsFromElement', () => {
  it('should move non-special properties to props', () => {
    const element = {
      props: {},
      on: {},
      normalProp: 'value',
      CapitalComponent: {},
      extends: 'something',
      style: { color: 'red' }
    }

    const result = pickupPropsFromElement.call(element, element, {
      cachedKeys: []
    })

    expect(result).toEqual({
      props: {
        normalProp: 'value'
      },
      style: { color: 'red' },
      on: {},
      CapitalComponent: {},
      extends: 'something'
    })
  })

  it('should handle elements with define property', () => {
    const element = {
      props: {},
      on: {},
      define: {
        customProp: { type: 'string' }
      },
      customProp: 'test'
    }

    const result = pickupPropsFromElement.call(element, element, {
      cachedKeys: []
    })

    expect(result).toEqual({
      props: {},
      define: {
        customProp: { type: 'string' }
      },
      on: {},
      customProp: 'test'
    })
  })
})

describe('pickupElementFromProps', () => {
  it('should move special properties from props to element root', () => {
    const element = {
      on: {},
      props: {
        CapitalComponent: {},
        style: { color: 'red' },
        normalProp: 'value',
        onClick: () => {}
      }
    }

    const result = pickupElementFromProps.call(element, element, {
      cachedKeys: []
    })

    expect(result).toEqual({
      props: {
        normalProp: 'value'
      },
      style: { color: 'red' },
      on: {
        click: expect.any(Function)
      },
      CapitalComponent: {}
    })
  })

  it('should respect cached keys', () => {
    const element = {
      on: {},
      props: {
        preserveMe: 'preserved',
        CapitalComponent: {}
      }
    }

    const result = pickupElementFromProps.call(element, element, {
      cachedKeys: ['preserveMe']
    })

    expect(result).toEqual({
      props: {
        preserveMe: 'preserved'
      },
      on: {},
      CapitalComponent: {}
    })
  })

  it('should handle event handlers correctly', () => {
    const handler = () => {}
    const element = {
      on: {},
      props: {
        onClick: handler,
        onMouseover: handler
      }
    }

    const result = pickupElementFromProps.call(element, element, {
      cachedKeys: []
    })

    expect(result).toEqual({
      props: {},
      on: {
        click: handler,
        mouseover: handler
      }
    })
  })
})

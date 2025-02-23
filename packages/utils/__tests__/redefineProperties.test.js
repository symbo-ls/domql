import { redefineProperties } from '..'

describe('redefineProperties', () => {
  it('should handle direct object properties', () => {
    const element = {
      data: { foo: 'bar' },
      content: 'Hello',
      on: { click: () => {} }
    }

    redefineProperties(element)

    expect(element).toEqual({
      props: {},
      data: { foo: 'bar' },
      content: 'Hello',
      on: { click: expect.any(Function) }
    })
  })

  it('should handle nested component properties', () => {
    const element = {
      NestedComponent: {
        data: { nested: true }
      }
    }

    redefineProperties(element)

    expect(element).toEqual({
      props: {},
      NestedComponent: {
        data: { nested: true }
      },
      on: {}
    })
  })

  it('should handle spread elements', () => {
    const element = {
      0: { content: 'First' },
      1: { content: 'Second' }
    }

    redefineProperties(element)

    expect(element).toEqual({
      props: {},
      0: { content: 'First' },
      1: { content: 'Second' },
      on: {}
    })
  })

  it('should handle correct property management', () => {
    const onClick = () => {}

    const element = {
      boxSizing: 'border-box',
      props: { onClick, H4: {} },
      Hello: {}
    }

    redefineProperties(element)

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

    redefineProperties(element)

    expect(element).toEqual({
      props: {},
      style: { color: 'red' },
      NestedComponent: {
        data: { nested: true }
      },
      on: {}
    })
  })

  // New test to verify mutation
  it('should mutate the original object', () => {
    const element = {
      data: { foo: 'bar' }
    }

    const result = redefineProperties(element)

    expect(result).toBe(element) // verify same object reference
    expect(element.props).toEqual({}) // verify mutation occurred
  })

  it('should handle correct property management', () => {
    const onClick = () => {}

    const element = {
      boxSizing: 'border-box',
      props: { onClick, H4: {} },
      Hello: {}
    }

    const parent = { context: {} }
    const key = 'MyComponent'

    const result = redefineProperties(element, parent, key)

    expect(result).toEqual({
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
    const result = redefineProperties(element)

    expect(result).toEqual({
      extends: 'Flex',
      props: {
        round: 'Z1',
        maxWidth: 'fit-content',
        border: '.7px dashed #232E31'
      },
      on: {},
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
    const result = redefineProperties(element.Flex)

    expect(result).toEqual({
      on: {},
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
              onChange: (event, element, state) => {
                state.update({
                  method: element.node.value
                })
              }
            }
          }
        }
      }
    }

    const recursive = el => {
      for (const key in el) {
        const isElement = /^[A-Z]/.test(key) || /^\d+$/.test(key)
        if (isElement) {
          el[key] = redefineProperties(el[key])
        }
      }
      return redefineProperties(component)
    }

    const result = recursive(component)

    expect(result).toEqual({
      on: {
        stateUpdate
      },
      extends: 'Flex',

      props: {
        flow: 'y'
      },

      state: {
        method: 'GET',
        headers: {}
      },

      TitleField: {
        props: {},
        on: {},
        key: 'titleState',
        Title: { text: 'Title' },
        Input: { props: { placeholder: 'Title of the state' } }
      },

      GroupField: {
        on: {},
        props: {
          width: '100%'
        },

        Title: {
          text: 'Connect to a custom URL'
        },

        Flex: {
          on: {},
          props: {
            flow: 'x',
            align: 'stretch start',

            childProps: {
              borderRadius: 'Y',
              ':first-child': { borderRadius: 'Y 0 0 Y' },
              ':last-child': { borderRadius: '0 Y Y 0' }
            }
          },

          SelectField: {
            props: {},
            on: {},

            Select: {
              props: {
                theme: null,
                borderRadius: 'X2',

                onChange: (event, element, state) => {
                  state.update({
                    method: element.node.value
                  })
                }
              },

              Get: {
                props: {
                  value: 'GET'
                },
                text: 'Get'
              },
              Post: {
                props: {
                  value: 'POST'
                },
                text: 'Post'
              }
            },

            on: {
              change: (event, element, state) => {
                state.update({
                  method: element.node.value
                })
              }
            }
          }
        }
      }
    })
  })
})

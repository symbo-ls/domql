import { applyKeyComponentAsExtend } from '..'

describe('applyKeyComponentAsExtend', () => {
  it('should return empty props when no component in context', () => {
    const element = {
      data: { foo: 'bar' },
      content: 'Hello',
      on: { click: () => {} }
    }

    const parent = { context: { components: {} } }
    const key = 'MyComponent'

    const result = applyKeyComponentAsExtend(element, parent, key)

    // Remove console.log statements as they're not needed
    expect(result).toEqual(element) // Changed to toEqual

    // Verify specific properties individually
    expect(result.data).toEqual({ foo: 'bar' })
    expect(result.content).toBe('Hello')
    expect(typeof result.on.click).toBe('function')
  })

  it('should handle extending component from context', () => {
    const element = {
      data: { foo: 'bar' }
    }

    const parent = { context: { components: { MyComponent: {} } } }
    const key = 'MyComponent'

    const result = applyKeyComponentAsExtend(element, parent, key)

    expect(result).toEqual({
      extends: ['MyComponent'],
      data: { foo: 'bar' }
    })
  })

  it('should return element if it matches context component', () => {
    const componentDef = { foo: 'bar' }
    const element = componentDef

    const parent = {
      context: {
        components: {
          MyComponent: componentDef
        }
      }
    }
    const key = 'MyComponent'

    const result = applyKeyComponentAsExtend(element, parent, key)

    expect(result).toBe(element)
  })

  it('should handle component with multiple nested components', () => {
    const element = {
      H: {
        color: 'title',
        tag: 'h3',
        lineHeight: '1em',
        margin: '0'
      },
      P: {
        margin: '0',
        color: 'paragraph'
      }
    }

    const parent = {
      context: {
        components: {
          Flex: { display: 'flex' },
          Hgroup: {
            extends: 'Flex',
            tag: 'hgroup',
            flow: 'y',
            gap: 'Y2'
          }
        }
      }
    }

    const result = applyKeyComponentAsExtend(element, parent, 'Hgroup')

    expect(result).toEqual({
      extends: ['Hgroup'],
      H: {
        color: 'title',
        tag: 'h3',
        lineHeight: '1em',
        margin: '0'
      },
      P: {
        margin: '0',
        color: 'paragraph'
      }
    })
  })

  it('should handle nested component inheritance', () => {
    const element = {
      Title: {
        extends: 'Flex',
        color: 'title',
        align: 'center space-between'
      },
      Paragraph: {
        extends: 'Flex',
        color: 'paragraph',
        align: 'center space-between'
      }
    }

    const parent = {
      context: {
        components: {
          Flex: { display: 'flex' },
          Hgroup: {
            extends: 'Flex',
            tag: 'hgroup',
            flow: 'y',
            gap: 'Y2'
          },
          HgroupRows: {
            extends: 'Hgroup'
          }
        }
      }
    }

    const result = applyKeyComponentAsExtend(element, parent, 'HgroupRows')

    expect(result).toEqual({
      extends: ['HgroupRows'],
      Title: {
        extends: 'Flex',
        color: 'title',
        align: 'center space-between'
      },
      Paragraph: {
        extends: 'Flex',
        color: 'paragraph',
        align: 'center space-between'
      }
    })
  })

  it('should handle complex nested components with deep inheritance', () => {
    const element = {
      Title: {
        justifyContent: 'space-between',
        Span: {},
        Button: {
          background: 'transparent',
          color: 'currentColor',
          padding: '0',
          Icon: {
            name: 'x',
            fontSize: 'C'
          }
        }
      },
      Paragraph: {}
    }

    const parent = {
      context: {
        components: {
          Flex: { display: 'flex' },
          Hgroup: {
            extends: 'Flex',
            tag: 'hgroup'
          },
          HgroupRows: {
            extends: 'Hgroup',
            Title: {
              extends: 'Flex',
              color: 'title'
            }
          },
          HgroupButton: {
            extends: 'HgroupRows'
          }
        }
      }
    }

    const result = applyKeyComponentAsExtend(element, parent, 'HgroupButton')

    expect(result).toEqual({
      extends: ['HgroupButton'],
      Title: {
        justifyContent: 'space-between',
        Span: {},
        Button: {
          background: 'transparent',
          color: 'currentColor',
          padding: '0',
          Icon: {
            name: 'x',
            fontSize: 'C'
          }
        }
      },
      Paragraph: {}
    })
  })

  it('should handle component with multiple extends', () => {
    const element = {
      Title: { color: 'title' }
    }

    const parent = {
      context: {
        components: {
          Flex: { display: 'flex' },
          Grid: { display: 'grid' },
          Hgroup: {
            extends: ['Flex', 'Grid'],
            tag: 'hgroup'
          }
        }
      }
    }

    const result = applyKeyComponentAsExtend(element, parent, 'Hgroup')

    expect(result).toEqual({
      extends: ['Hgroup'],
      Title: { color: 'title' }
    })
  })
})

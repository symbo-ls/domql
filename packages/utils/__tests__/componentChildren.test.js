import { redefineProperties } from '..'

describe('Component Children Structure', () => {
  const children = [
    {
      Icon: {},
      SizeUnits: {
        NumberValue: {
          state: {
            letterValue: '',
            numberValue: ''
          }
        }
      }
    },
    {
      Icon: {
        opacity: '0'
      },
      SizeUnits: {
        NumberValue: {
          state: {
            letterValue: '',
            numberValue: ''
          }
        }
      },
      Span: {
        opacity: '0'
      }
    }
  ]

  it('should validate first child structure', () => {
    const result = redefineProperties(children[0])

    expect(result).toEqual({
      Icon: {},
      SizeUnits: {
        NumberValue: {
          state: {
            letterValue: '',
            numberValue: ''
          }
        }
      }
    })
  })

  it('should validate second child structure with opacity', () => {
    const result = redefineProperties(children[1])

    expect(result).toEqual({
      Icon: {
        opacity: '0'
      },
      SizeUnits: {
        NumberValue: {
          state: {
            letterValue: '',
            numberValue: ''
          }
        }
      },
      Span: {
        opacity: '0'
      }
    })
  })

  it('should validate NumberValue state in all children', () => {
    children.forEach(child => {
      const result = redefineProperties(child)
      expect(result.SizeUnits.NumberValue.state).toEqual({
        letterValue: '',
        numberValue: ''
      })
    })
  })

  describe('Detailed children[1] validation', () => {
    const result = redefineProperties(children[1])

    it('should validate Icon opacity', () => {
      expect(result.Icon).toHaveProperty('opacity', '0')
    })

    it('should validate Span opacity', () => {
      expect(result.Span).toHaveProperty('opacity', '0')
    })

    it('should validate nested SizeUnits structure', () => {
      expect(result.SizeUnits).toHaveProperty('NumberValue')
      expect(result.SizeUnits.NumberValue).toHaveProperty('state')
    })

    it('should ensure no additional properties exist', () => {
      const expectedKeys = ['Icon', 'SizeUnits', 'Span']
      expect(Object.keys(result).sort()).toEqual(expectedKeys.sort())
    })

    it('should validate state properties are empty strings', () => {
      const { letterValue, numberValue } = result.SizeUnits.NumberValue.state
      expect(letterValue).toBe('')
      expect(numberValue).toBe('')
    })
  })

  describe('Detailed children[1].SizeUnits validation', () => {
    const result = redefineProperties(children[1])
    const sizeUnits = result.SizeUnits

    it('should have correct SizeUnits structure', () => {
      expect(sizeUnits).toBeDefined()
      expect(typeof sizeUnits).toBe('object')
    })

    it('should have NumberValue component', () => {
      expect(sizeUnits.NumberValue).toBeDefined()
      expect(typeof sizeUnits.NumberValue).toBe('object')
    })

    it('should have correct state structure in NumberValue', () => {
      const { state } = sizeUnits.NumberValue
      expect(state).toEqual({
        letterValue: '',
        numberValue: ''
      })
    })

    it('should not have any unexpected properties', () => {
      const sizeUnitsKeys = Object.keys(sizeUnits)
      expect(sizeUnitsKeys).toHaveLength(1)
      expect(sizeUnitsKeys).toEqual(['NumberValue'])
    })

    it('should maintain correct property types', () => {
      const { state } = sizeUnits.NumberValue
      expect(typeof state.letterValue).toBe('string')
      expect(typeof state.numberValue).toBe('string')
    })
  })
})

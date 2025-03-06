import * as moduleExports from '../../utils/index'

describe('index.js exports', () => {
  it('should re-export everything from component.js', () => {
    // Assuming component.js exports at least one function or variable
    expect(moduleExports).toHaveProperty('METHODS_EXL')
  })

  it('should define METHODS_EXL as an empty array', () => {
    expect(moduleExports.METHODS_EXL).toEqual([])
  })
})

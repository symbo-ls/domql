import exec from '../../../src/element/params/exec'

test('should check whether value is executable and if yes, return executed value', () => {
  var val1 = exec('val1')
  var val2 = exec(() => `val2`)

  expect(val1).toEqual('val1')
  expect(val2).toEqual('val2')
})

import applyPrototype from '../../src/element/proto'

test('should merge multiple prototypes', () => {
  var proto1 = {
    div1: 'div1'
  }

  var proto2 = {
    proto: proto1,
    div2: 'div2'
  }

  var proto3 = {
    proto: proto2,
    div3: 'div3'
  }

  applyPrototype(proto3)

  expect(proto3).toStrictEqual({
    proto: proto2,
    div1: 'div1',
    div2: 'div2',
    div3: 'div3'
  })
})
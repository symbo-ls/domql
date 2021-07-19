import { getProtoMerged, getProtoStack } from '../../src/utils'

const proto1 = {
  div1: 'div1'
}

const proto2 = {
  proto: proto1,
  div2: 'div2'
}

const proto3 = {
  proto: proto2,
  div3: {
    text: 'div3'
  }
}

const proto4 = {
  proto: proto3,
  div4: 'div4'
}

// test('should FLATTEN deep prototypal inheritances', () => {
//   const arr = getProtoStack(proto4)
//   expect(arr).toStrictEqual([
//     {
//       div4: 'div4'
//     },
//     {
//       div3: {
//         text: 'div3'
//       }
//     },
//     {
//       div2: 'div2'
//     },
//     {
//       div1: 'div1'
//     }
//   ])
// })

test('should MEGRE', () => {
  const arr = getProtoMerged(proto4)
  expect(arr).toStrictEqual({
    div4: 'div4',
    div3: {
      text: 'div3'
    },
    div2: 'div2',
    div1: 'div1'
  })
})

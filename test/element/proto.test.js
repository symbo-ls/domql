import { getExtendMerged, getExtendStack } from '../../src/utils'

const extend1 = {
  div1: 'div1'
}

const extend2 = {
  extend: extend1,
  div2: 'div2'
}

const extend3 = {
  extend: extend2,
  div3: {
    text: 'div3'
  }
}

const extend4 = {
  extend: extend3,
  div4: 'div4'
}

// test('should FLATTEN deep extendtypal inheritances', () => {
//   const arr = getExtendStack(extend4)
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
  const arr = getExtendMerged(extend4)
  expect(arr).toStrictEqual({
    div4: 'div4',
    div3: {
      text: 'div3'
    },
    div2: 'div2',
    div1: 'div1'
  })
})

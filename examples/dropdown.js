'use strict'

const result = {
  avatar: {
    query: true,
    tag: 'img',
    attr: {
      src: 'cdn/{avatar}'
    }
  },
  name: {
    query: true
  }
}

const input = {
  tag: 'input'
}

const dropdown = {
  query: input.value,
  results: {
    query: true,
    tag: 'ul',
    result
  }
}

export default dropdown

// data tree
// {
//   results {
//     avatar,
//     name
//   }
// }

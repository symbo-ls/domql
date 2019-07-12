'use strict'

var result = {
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

var input = {
  tag: 'input'
}

var dropdown = {
  query: input.value,
  results: {
    query: true,
    tag: 'ul',
    result
  }
}

// data tree
// { 
//   results {
//     avatar,
//     name
//   }
// }
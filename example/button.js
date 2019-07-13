'use strict'

export default {
  query: true,
  shape: 'ShapeA',
  scheme: 'GroupA',
  style: {
    paddingLeft: 'E1',
    paddingRight: 'E1'
  },
  avatar: {
    query: true
  }
  title: {
    query: true,
    style: {
      flex: 1
    },
    on: {
      data,
      hover: (e) => {
        console.log(e)
      }
    }
  },
  close: {
    type: 'icon',
    style: {
      paddingLeft: 'B4',
      paddingRight: 'B4'
    }
  }
}

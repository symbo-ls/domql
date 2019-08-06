'use strict'

// import rootScroll from './onScroll'

// var scrollIfPinned = rootScroll.data.scrollTop > 50 ? {
//   position: 'fixed'
// } : {
//   position: 'absolute'
// }

export default {
  tag: 'header',
  text: 'header',
  style: {
    padding: 10,
    fontSize: 24,
    backgroundColor: 'snow',
    // ...scrollIfPinned,
    top: 0
  }
}

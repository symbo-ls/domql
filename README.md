# DOMQL
DOM rendering Javascript framework at the early stage.

[![Build Status](https://travis-ci.org/rackai/domql.svg?branch=master)](https://travis-ci.org/rackai/domql)
[![Coverage Status](https://coveralls.io/repos/github/rackai/domql/badge.svg?branch=master)](https://coveralls.io/github/rackai/domql?branch=master)

- [x] error reporting
- [x] virtual DOM tree
- [x] create
  - [x] create using prototype class
- [ ] binding *- in progress*
- [ ] update
- [ ] events

### Getting started

To install all dependencies and run dev server, run:

```shell
yarn && yarn start
```

### Reserved keywords

```
key
tag
node
proto
on
class
text
data
style
attr
```

### Example 

Attributes:

```
var link = {
  tag: 'a',
  class: 'menu link',
  attr: {
    href: '#'
  }
}
```
```
var img = {
  tag: 'img',
  class: 'avatar',
  attr: {
    src: '...'
  }
}
```

Reusing: 
```
var listItem = {
  tag: 'a',
  class: 'ui link',
  attr: {
    href: '#'
  }
}

var menu = [{
  proto: listItem,
  text: 'Home'
}, {
  proto: listItem,
  text: 'About'
}]

var header = {
  logo: {},
  menu
}
```

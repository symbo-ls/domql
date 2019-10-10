# DOMQL
DOM rendering Javascript framework at the early stage.

[![Build Status](https://travis-ci.org/rackai/domql.svg?branch=master)](https://travis-ci.org/rackai/domql)
[![Coverage Status](https://coveralls.io/repos/github/rackai/domql/badge.svg?branch=master)](https://coveralls.io/github/rackai/domql?branch=master)

- [x] error reporting
- [x] virtual DOM tree
- [x] create
  - [x] create using prototype class
  - [x] support multiple level prototypes
- [ ] binding
- [x] update
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

### Examples

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
var Link = {
  tag: 'a'
}

var ListItem = {
  proto: Link,
  class: 'ui link',
  attr: {
    href: '#'
  }
}

var menu = {
  childProto: ListItem,
  home: 'Home',
  text: 'About'
}

var header = {
  logo: {},
  menu
}
```

Array Support:
```
var navItems = ['Home', 'About', 'FAQ', 'Contact']

var menu = {
  proto: ListItem,
  ...navItems
}
```

Update:
```
var val = {
  text: 0
}

var Increment = {
  tag: 'button',
  text: 'Increment',
  on: {
    click: (e) => {
      val.update({ text: text++ })
    }
  }
}
```

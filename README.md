# DOMQL
DOM rendering Javascript framework at early stage.

- Minimalistic
- No deps
- Extendable
- No transpilations, simple ES6 code

[![Build Status](https://travis-ci.org/rackai/domql.svg?branch=master)](https://travis-ci.org/rackai/domql)
[![Coverage Status](https://coveralls.io/repos/github/rackai/domql/badge.svg?branch=master)](https://coveralls.io/github/rackai/domql?branch=master)

Key features:
- [x] error reporting
- [x] virtual DOM tree
- [x] create
  - [x] create using prototype class
  - [x] support multiple level prototypes
- [ ] state
- [ ] binding
  - [ ] with other component
  - [ ] with state
- [x] update
  - [x] set (recreate)
  - [ ] change what's in diff
- [x] events
  - [x] event handling
  - [ ] bubbling and propogation

### Getting started

To install all dependencies and run dev server, run:

```shell
yarn && yarn start
```

### Examples

Attributes:

```javascript
var link = {
  tag: 'a',
  class: 'menu link',
  attr: {
    href: '#'
  }
}
```
```javascript
var img = {
  tag: 'img',
  class: 'avatar',
  attr: {
    src: '...'
  }
}
```

Reusing: 
```javascript
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
```javascript
var navItems = ['Home', 'About', 'FAQ', 'Contact']

var menu = {
  proto: ListItem,
  ...navItems
}
```

Update:
```javascript
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
update
set
```

Anything except these keywords will create a new nested child element. The easier method to specify HTML tag is to use related nodeName as a key, for example: 

```javascript
var layout = { // this will be <div>
  header: {}, // will create <header>
  aside: {}, // will create <aside>
  main: { // will create <main>
    article: { // will create <article>
      title: {}, // will create <div>
      description: {}, // will create <div>
      _rating: {} // will create <div class="rating">
    }
  },
  footer: {} //  will create <footer>
}
```

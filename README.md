# DOMQL
DOM rendering Javascript framework.

- Minimalistic
- No dependencies
- Extendable
- No transpilations, simple ES6 code
- One-time import and subtrees

You can start with [starter-kit](https://github.com/rackai/starter-kit) as a boilerplate, or jump into the live editor [playground](https://domql.com/playground/).

[![npm version](https://badge.fury.io/js/%40rackai%2Fdomql.svg)](https://badge.fury.io/js/%40rackai%2Fdomql)
[![Build Status](https://travis-ci.org/rackai/domql.svg?branch=master)](https://travis-ci.org/rackai/domql)
[![Coverage Status](https://coveralls.io/repos/github/rackai/domql/badge.svg?branch=main)](https://coveralls.io/github/rackai/domql?branch=main)

Key features:
- [x] error reporting
- [x] virtual DOM tree
- [x] create
  - [x] create using prototype class
  - [x] support multiple level prototypes
- [x] state
- [x] binding
  - [x] with other component
  - [x] with state
- [x] update
  - [x] set (recreate)
  - [x] only iterate with diff
- [x] events
  - [x] event handling
  - [ ] bubbling and propogation
- [ ] run changes inside animationFrame

### Getting started

To install all dependencies and run dev server, run:

```shell
yarn && yarn start
```

### Examples

Initialization: 

```javascript
import DOM from '@rackai/domql'

DOM.create({ text: 'Rendered' })
```

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
      val.update({ text: val.text++ })
    }
  }
}
```

## API

### Properties

| Property | Type | Description | Default |
| --- | --- | --- | --- |
| `key` | `Number` `String` | Defines the key of the Element | The key of the object, or randomly generated name |
| `proto` | `Object` `Array` | Clones the other element | `undefined` |
| `childProto` | `Object` `Array` | Specifies the `proto` for all child elements | `undefined` |
| `tag` | `String` | Specifis the HTML tag  | `div` or related HTML tag if the key matches |
| `class` | `Any` | Specifies the HTML class | `undefined` |
| `attr` | `Object` | Specifies the set of HTML attributes | `{}` |
| `text` | `Any` | Text inside the element | `undefined` |
| `content` | `Object` `Array` | Fragment wrapper to use dynamic content loading | `undefined`

To specify your own property per Element, set the function inside `define` property like:

```javascript
var User = {
  define: {
    username: param => param.toUpperCase()
  },
  text: element => element.username
}

var Contact = {
  proto: User,
  username: 'nikoloza'
}
```

### Methods
| Method | Description | Params |
| --- | --- | --- |
| `update` | Updates element by passed object | `properties`: `Object` `Array` |
| `set` | Sets passed element in the `content` property | `element`: `Object` `Array` |


### Events
All native DOM events are supported and can be specified inside `on` parameter. Additionally, `init` and `render` can be also invoked. All events except these two receive `event` object as a first parameter, following the `element` object itself.



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
define
```

Anything except these keywords will create a new nested child element. The easier method to specify HTML tag is to use related nodeName as a key, for example: 

```javascript
var layout = { // this will be <div>
  header: {}, // will create <header>
  aside: {}, // will create <aside>
  main: { // will create <main>
    childProto: {
      article: { // will create <article>
        title: {}, // will create <div>
        description: {}, // will create <div>
        _rating: {} // will create <div class="rating">
      }
    }
  },
  footer: {} //  will create <footer>
}
```

### Credits
Inspired by [brisky](https://github.com/vigour-io/brisky)

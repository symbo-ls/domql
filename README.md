# DOMQL
DOMQL is new framework made by Symbols team to simplify app development process with full potential of reusability and customization. The aim to create this framework was to build one of the most reusable components library, and together with a design system library, it creates strong foundation for any frontend development.

- Minimalistic
- No dependencies
- Extendable
- No transpilations, simple ES6 code
- One-time import and subtrees

You can start with [starter-kit](https://github.com/domql/starter-kit) as a
boilerplate, or jump into the [playground](https://domql.com/playground/).

[![npm version](https://badge.fury.io/js/domql.svg)](https://badge.fury.io/js/domql)


## Intuitive

Using is as simple as:

```javascript
import DOM from 'domql'

const link = {
  tag: 'a',
  class: 'menu link',
  attr: {
    href: '#'
  }
}

DOM.create(link, document.body)
```

Anyone with some basic front-end knowledge can understand DOMQL code right away:

```javascript
const img = {
  tag: 'img',
  class: 'avatar',
  attr: {
    src: '...'
  }
}
```

A single javascript object holds all of the logic, markup and styles of a
component.

```javascript
const Link = {
  tag: 'a'
}

const ListItem = {
  extend: Link,
  class: 'ui link',
  attr: {
    href: '#'
  }
}

const menu = {
  childExtend: ListItem,
  home: 'Home',
  text: 'About'
}

const header = {
  logo: {},
  menu
}
```

No need for fancy syntax, build steps and transpilers - it's just javascript.

```javascript
const navItems = ['Home', 'About', 'FAQ', 'Contact']

const menu = {
  extend: ListItem,
  ...navItems
}
```

All logic is contained in callback functions.

```javascript
const Increment = {
  tag: 'button',
  text: 'Click me!',
  state: { value: 0 },
  on: {
    click: (el) => {
      el.state.update({ value: el.state.value++ })
      el.set({ text: el.state.value.toString() })
    }
    render: () => {...},
    focus: () => {...},
    ...
  }
}
```

Imagine being able to describe the entire front-end of your website with all of
its logic, styles and markup using only a single javascript object. DOMQL can do
that.

## API

### Properties

| Property | Type | Description | Default |
| --- | --- | --- | --- |
| `key` | `Number` `String` | Defines the key of the Element | The key of the object, or randomly generated name |
| `extend` | `Object` `Array` | Clones the other element | `undefined` |
| `childExtend` | `Object` `Array` | Specifies the `extend` for all child elements | `undefined` |
| `tag` | `String` | Specifis the HTML tag  | `div` or related HTML tag if the key matches |
| `class` | `Any` | Specifies the HTML class | `undefined` |
| `attr` | `Object` | Specifies the set of HTML attributes | `{}` |
| `text` | `Any` | Text inside the element | `undefined` |
| `content` | `Object` `Array` | Fragment wrapper to use dynamic content loading | `undefined`

To specify your own property per Element, set the function inside `define` property like:

```javascript
const User = {
  define: {
    username: param => param.toUpperCase()
  },
  text: element => element.username
}

const Contact = {
  extend: User,
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
extend
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
const layout = { // this will be <div>
  header: {}, // will create <header>
  aside: {}, // will create <aside>
  main: { // will create <main>
    childExtend: {
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

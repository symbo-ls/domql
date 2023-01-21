"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.js
var src_exports = {};
__export(src_exports, {
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);

// src/element/nodes.js
var nodes_default = {
  root: [
    "body",
    "html"
  ],
  head: [
    "title",
    "base",
    "meta",
    "style"
  ],
  body: [
    "html",
    "body",
    "string",
    "fragment",
    "a",
    "abbr",
    "acronym",
    "address",
    "applet",
    "area",
    "article",
    "aside",
    "audio",
    "b",
    "basefont",
    "bdi",
    "bdo",
    "big",
    "blockquote",
    "br",
    "button",
    "canvas",
    "caption",
    "center",
    "cite",
    "code",
    "col",
    "colgroup",
    "data",
    "datalist",
    "dd",
    "del",
    "details",
    "dfn",
    "dialog",
    "dir",
    "div",
    "dl",
    "dt",
    "em",
    "embed",
    "fieldset",
    "figcaption",
    "figure",
    "font",
    "footer",
    "form",
    "frame",
    "frameset",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "head",
    "header",
    "hr",
    "i",
    "iframe",
    "img",
    "input",
    "ins",
    "kbd",
    "label",
    "legend",
    "li",
    "link",
    "main",
    "map",
    "mark",
    "meter",
    "nav",
    "noframes",
    "noscript",
    "object",
    "ol",
    "optgroup",
    "option",
    "output",
    "p",
    "param",
    "picture",
    "pre",
    "progress",
    "q",
    "rp",
    "rt",
    "ruby",
    "s",
    "samp",
    "script",
    "section",
    "select",
    "small",
    "source",
    "span",
    "strike",
    "strong",
    "sub",
    "summary",
    "sup",
    "table",
    "tbody",
    "td",
    "template",
    "textarea",
    "tfoot",
    "th",
    "thead",
    "time",
    "tr",
    "track",
    "tt",
    "u",
    "ul",
    "var",
    "video",
    "wbr",
    "svg",
    "path"
  ]
};

// src/utils/report.js
var errors = {
  en: {
    DocumentNotDefined: {
      title: "Document is undefined",
      description: "To tweak with DOM, you should use browser."
    },
    OverwriteToBuiltin: {
      title: "Overwriting to builtin method",
      description: "Overwriting a builtin method in the global define is not possible, please choose different name"
    },
    BrowserNotDefined: {
      title: "Can't recognize environment",
      description: "Environment should be browser application, that can run Javascript"
    },
    SetQuickPreferancesIsNotObject: {
      title: "Quick preferances object is required",
      description: 'Please pass a plain object with "lang", "culture" and "area" properties'
    },
    InvalidParams: {
      title: "Params are invalid",
      description: 'Please pass a plain object with "lang", "culture" and "area" properties'
    },
    CantCreateWithoutNode: {
      title: "You must provide node",
      description: "Can't create DOM element without setting node or text"
    },
    HTMLInvalidTag: {
      title: "Element tag name (or DOM nodeName) is invalid",
      description: "To create element, you must provide valid DOM node. See full list of them at here: http://www.w3schools.com/tags/"
    },
    HTMLInvalidAttr: {
      title: "Attibutes object is invalid",
      description: "Please pass a valid plain object to apply as an attributes for a DOM node"
    },
    HTMLInvalidData: {
      title: "Data object is invalid",
      description: "Please pass a valid plain object to apply as an dataset for a DOM node"
    },
    HTMLInvalidStyles: {
      title: "Styles object is invalid",
      description: "Please pass a valid plain object to apply as an style for a DOM node"
    },
    HTMLInvalidText: {
      title: "Text string is invalid",
      description: "Please pass a valid string to apply text to DOM node"
    }
  }
};
var report = (err, arg, element) => {
  const currentLang = "en";
  let errObj;
  if (err && typeof err === "string")
    errObj = errors[currentLang][err];
  return new Error(
    `"${err}", "${arg}"

`,
    `${errObj.description}`,
    element ? `

${element}` : ""
  );
};

// src/utils/object.js
var isTagRegistered = (arg) => nodes_default.body.indexOf(arg);
var isObject = (arg) => {
  if (arg === null)
    return false;
  return typeof arg === "object" && arg.constructor === Object;
};
var isString = (arg) => typeof arg === "string";
var isNumber = (arg) => typeof arg === "number";
var isFunction = (arg) => typeof arg === "function";
var isArray = (arg) => Array.isArray(arg);
var isObjectLike = (arg) => {
  if (arg === null)
    return false;
  return typeof arg === "object";
};
var isNode = (obj) => {
  return typeof global.Node === "object" ? obj instanceof global.Node : obj && typeof obj === "object" && typeof obj.nodeType === "number" && typeof obj.nodeName === "string";
};
var exec = (param, element, state) => {
  if (isFunction(param))
    return param(element, state || element.state);
  return param;
};
var map = (obj, extention, element) => {
  for (const e in extention) {
    obj[e] = exec(extention[e], element);
  }
};
var merge = (element, obj) => {
  for (const e in obj) {
    const elementProp = element[e];
    const objProp = obj[e];
    if (elementProp === void 0) {
      element[e] = objProp;
    }
  }
  return element;
};
var deepMerge = (element, extend) => {
  for (const e in extend) {
    const elementProp = element[e];
    const extendProp = extend[e];
    if (e === "parent" || e === "props" || e === "state")
      continue;
    if (elementProp === void 0) {
      element[e] = extendProp;
    } else if (isObjectLike(elementProp) && isObject(extendProp)) {
      deepMerge(elementProp, extendProp);
    }
  }
  return element;
};
var deepClone = (obj, excluding = ["parent", "node", "__element", "state", "__root", "context"]) => {
  const o = {};
  for (const prop in obj) {
    if (excluding.indexOf(prop) > -1)
      continue;
    let objProp = obj[prop];
    if (prop === "extend" && isArray(objProp)) {
      objProp = mergeArray(objProp);
    }
    if (isObjectLike(objProp)) {
      o[prop] = deepClone(objProp);
    } else
      o[prop] = objProp;
  }
  return o;
};
var isEqualDeep = (param, element) => {
  if (param === element)
    return true;
  if (!param || !element)
    return false;
  for (const prop in param) {
    const paramProp = param[prop];
    const elementProp = element[prop];
    if (isObjectLike(paramProp)) {
      const isEqual = isEqualDeep(paramProp, elementProp);
      if (!isEqual)
        return false;
    } else {
      const isEqual = paramProp === elementProp;
      if (!isEqual)
        return false;
    }
  }
  return true;
};
var overwrite = (element, params, options) => {
  const changes = {};
  for (const e in params) {
    if (e === "props" || e === "state")
      continue;
    const elementProp = element[e];
    const paramsProp = params[e];
    if (paramsProp !== void 0) {
      element.__cached[e] = changes[e] = elementProp;
      element[e] = paramsProp;
    }
    if (options.cleanExec)
      delete element.__exec[e];
  }
  return changes;
};
var overwriteDeep = (obj, params, excluding = ["node", "__root"]) => {
  for (const e in params) {
    if (excluding.indexOf(e) > -1)
      continue;
    const objProp = obj[e];
    const paramsProp = params[e];
    if (isObjectLike(objProp) && isObjectLike(paramsProp)) {
      overwriteDeep(objProp, paramsProp);
    } else if (paramsProp !== void 0) {
      obj[e] = paramsProp;
    }
  }
  return obj;
};
var mergeArray = (arr) => {
  return arr.reduce((a, c) => deepMerge(a, deepClone(c)), {});
};

// src/utils/node.js
var createID = function() {
  let index = 0;
  function newId() {
    index++;
    return index;
  }
  return newId;
}();
var createSnapshotId = createID;

// src/utils/extendUtils.js
var generateHash = () => Math.random().toString(36).substring(2);
var extendStackRegistry = {};
var extendCachedRegistry = {};
global.extendStackRegistry = extendStackRegistry;
global.extendCachedRegistry = extendCachedRegistry;
var getHashedExtend = (extend) => {
  return extendStackRegistry[extend.__hash];
};
var setHashedExtend = (extend, stack) => {
  const hash = generateHash();
  extend.__hash = hash;
  extendStackRegistry[hash] = stack;
  return stack;
};
var getExtendStackRegistry = (extend, stack) => {
  if (extend.__hash) {
    return stack.concat(getHashedExtend(extend));
  }
  return setHashedExtend(extend, stack);
};
var extractArrayExtend = (extend, stack) => {
  extend.forEach((each) => flattenExtend(each, stack));
  return stack;
};
var deepExtend = (extend, stack) => {
  const extendOflattenExtend = extend.extend;
  if (extendOflattenExtend) {
    flattenExtend(extendOflattenExtend, stack);
  }
  return stack;
};
var flattenExtend = (extend, stack) => {
  if (!extend)
    return stack;
  if (isArray(extend))
    return extractArrayExtend(extend, stack);
  stack.push(extend);
  if (extend.extend)
    deepExtend(extend, stack);
  return stack;
};
var deepCloneExtend = (obj) => {
  const o = {};
  for (const prop in obj) {
    if (["parent", "node", "__element", "__root", "__key"].indexOf(prop) > -1)
      continue;
    const objProp = obj[prop];
    if (isObject(objProp)) {
      o[prop] = deepCloneExtend(objProp);
    } else if (isArray(objProp)) {
      o[prop] = objProp.map((x) => x);
    } else
      o[prop] = objProp;
  }
  return o;
};
var deepMergeExtend = (element, extend) => {
  for (const e in extend) {
    if (["parent", "node", "__element", "__root", "__key"].indexOf(e) > -1)
      continue;
    const elementProp = element[e];
    const extendProp = extend[e];
    if (elementProp === void 0) {
      element[e] = extendProp;
    } else if (isObject(elementProp) && isObject(extendProp)) {
      deepMergeExtend(elementProp, extendProp);
    } else if (isArray(elementProp) && isArray(extendProp)) {
      element[e] = elementProp.concat(extendProp);
    } else if (isArray(elementProp) && isObject(extendProp)) {
      const obj = deepMergeExtend({}, elementProp);
      element[e] = deepMergeExtend(obj, extendProp);
    } else if (elementProp === void 0 && isFunction(extendProp)) {
      element[e] = extendProp;
    }
  }
  return element;
};
var cloneAndMergeArrayExtend = (stack) => {
  return stack.reduce((a, c) => {
    return deepMergeExtend(a, deepCloneExtend(c));
  }, {});
};
var jointStacks = (extendStack, childExtendStack) => {
  return [].concat(extendStack.slice(0, 1)).concat(childExtendStack.slice(0, 1)).concat(extendStack.slice(1)).concat(childExtendStack.slice(1));
};
var getExtendStack = (extend) => {
  if (!extend)
    return [];
  if (extend.__hash)
    return getHashedExtend(extend) || [];
  const stack = flattenExtend(extend, []);
  return getExtendStackRegistry(extend, stack);
};

// src/element/root.js
var root = {
  key: ":root",
  node: global.body
};
var root_default = root;

// src/element/tree.js
var tree_default = root_default;

// src/event/on.js
var on_exports = {};
__export(on_exports, {
  attachNode: () => attachNode,
  beforeClassAssign: () => beforeClassAssign,
  init: () => init,
  initStateUpdated: () => initStateUpdated,
  initUpdate: () => initUpdate,
  render: () => render,
  stateCreated: () => stateCreated,
  stateInit: () => stateInit,
  stateUpdated: () => stateUpdated,
  update: () => update
});
var beforeClassAssign = (param, element, state) => {
  return param(element, state);
};
var init = (param, element, state) => {
  return param(element, state);
};
var render = (param, element, state) => {
  return param(element, state);
};
var initUpdate = (param, element, state) => {
  return param(element, state);
};
var attachNode = (param, element, state) => {
  return param(element, state);
};
var stateInit = (param, element, state) => {
  return param(element, state);
};
var stateCreated = (param, element, state) => {
  return param(element, state);
};
var initStateUpdated = (param, element, state, changes) => {
  return param(element, state, changes);
};
var stateUpdated = (param, element, state, changes) => {
  return param(element, state, changes);
};
var update = (param, element, state) => {
  return param(element, state);
};

// src/event/can.js
var can_exports = {};
__export(can_exports, {
  render: () => render2
});
var render2 = (element) => {
  const tag = element.tag || "div";
  const isValid = nodes_default.body.indexOf(tag) > -1;
  return isValid || report("HTMLInvalidTag");
};

// src/element/cache.js
var cachedElements = {};
var createNode = (element) => {
  const { tag } = element;
  if (tag) {
    if (tag === "string")
      return global.createTextNode(element.text);
    else if (tag === "fragment") {
      return global.createDocumentFragment();
    } else if (tag === "svg" || tag === "path") {
      return global.createElementNS("http://www.w3.org/2000/svg", tag);
    } else
      return global.createElement(tag);
  } else {
    return global.createElement("div");
  }
};
var detectTag = (element) => {
  let { tag, key } = element;
  tag = exec(tag, element);
  if (tag === true)
    tag = key;
  if (isString(tag)) {
    const tagExists = isTagRegistered(tag) > -1;
    if (tagExists)
      return tag;
  } else {
    const isKeyATag = isTagRegistered(key) > -1;
    if (isKeyATag)
      return key;
  }
  return "div";
};
var cache_default = (element) => {
  const tag = element.tag = detectTag(element);
  if (!can_exports.render(element)) {
    return report("HTMLInvalidTag");
  }
  let cachedTag = cachedElements[tag];
  if (!cachedTag)
    cachedTag = cachedElements[tag] = createNode(element);
  const clonedNode = cachedTag.cloneNode(true);
  if (tag === "string")
    clonedNode.nodeValue = element.text;
  return clonedNode;
};

// ../refactor/domql/packages/utils/types.js
var isObject2 = (arg) => {
  if (arg === null)
    return false;
  return typeof arg === "object" && arg.constructor === Object;
};
var isString2 = (arg) => typeof arg === "string";
var isNumber2 = (arg) => typeof arg === "number";
var isFunction2 = (arg) => typeof arg === "function";
var isBoolean = (arg) => arg === true || arg === false;
var isNull = (arg) => arg === null;
var isArray2 = (arg) => Array.isArray(arg);
var isObjectLike2 = (arg) => {
  if (arg === null)
    return false;
  return typeof arg === "object";
};
var isNode2 = (obj) => {
  return typeof global.Node === "object" ? obj instanceof global.Node : obj && typeof obj === "object" && typeof obj.nodeType === "number" && typeof obj.nodeName === "string";
};
var isHtmlElement = (obj) => {
  return typeof global.HTMLElement === "object" ? obj instanceof global.HTMLElement : obj && typeof obj === "object" && obj !== null && obj.nodeType === 1 && typeof obj.nodeName === "string";
};
var isDefined = (arg) => {
  return isObject2(arg) || isObjectLike2(arg) || isString2(arg) || isNumber2(arg) || isFunction2(arg) || isArray2(arg) || isObjectLike2(arg) || isBoolean(arg) || isNull(arg);
};
var isUndefined = (arg) => {
  return arg === void 0;
};
var TYPES = {
  boolean: isBoolean,
  array: isArray2,
  object: isObject2,
  string: isString2,
  number: isNumber2,
  null: isNull,
  function: isFunction2,
  objectLike: isObjectLike2,
  node: isNode2,
  htmlElement: isHtmlElement,
  defined: isDefined
};
var is = (arg) => {
  return (...args) => {
    return args.map((val) => TYPES[val](arg)).filter((v) => v).length > 0;
  };
};
var isNot = (arg) => {
  return (...args) => {
    return args.map((val) => TYPES[val](arg)).filter((v) => v).length === 0;
  };
};

// ../refactor/domql/packages/utils/object.js
var diff = (obj, original, cache) => {
  const changes = cache || {};
  for (const e in obj) {
    if (e === "ref")
      continue;
    const originalProp = original[e];
    const objProp = obj[e];
    if (isObjectLike2(originalProp) && isObjectLike2(objProp)) {
      changes[e] = {};
      diff(originalProp, objProp, changes[e]);
    } else if (objProp !== void 0) {
      changes[e] = objProp;
    }
  }
  return changes;
};

// ../refactor/domql/packages/utils/node.js
var createID2 = function* () {
  let index = 1;
  while (index < index + 1) {
    yield index++;
  }
}();

// src/element/mixins/attr.js
var attr_default = (params, element, node) => {
  const { __attr } = element;
  if (isNot("object"))
    report("HTMLInvalidAttr", params);
  if (params) {
    for (const attr in params) {
      const val = exec(params[attr], element);
      if (val && node.setAttribute)
        node.setAttribute(attr, val);
      else if (node.removeAttribute)
        node.removeAttribute(attr);
      __attr[attr] = val;
    }
  }
  console.groupEnd(params, __attr);
};

// src/element/mixins/classList.js
var assignClass = (element) => {
  const { key } = element;
  if (element.class === true)
    element.class = key;
  else if (!element.class && typeof key === "string" && key.charAt(0) === "_" && key.charAt(1) !== "_") {
    element.class = key.slice(1);
  }
};
var classify = (obj, element) => {
  let className = "";
  for (const item in obj) {
    const param = obj[item];
    if (typeof param === "boolean" && param)
      className += ` ${item}`;
    else if (typeof param === "string")
      className += ` ${param}`;
    else if (typeof param === "function") {
      className += ` ${exec(param, element)}`;
    }
  }
  return className;
};
var classList_default = (params, element, node, live) => {
  if (!params)
    return;
  const { key, __className } = element;
  if (params === true)
    params = element.class = { key };
  if (isString(params))
    params = element.class = { default: params };
  if (isObject(params))
    params = classify(params, element);
  const className = params.replace(/\s+/g, " ").trim();
  node.classList = className;
  return className;
};

// src/element/options.js
var options_default = {};

// src/element/set.js
var removeContentElement = function(el) {
  const element = el || this;
  if (element.content) {
    if (element.content.node) {
      if (element.content.tag === "fragment")
        element.node.innerHTML = "";
      else
        element.node.removeChild(element.content.node);
    }
    const { __cached } = element;
    if (__cached && __cached.content) {
      if (__cached.content.tag === "fragment")
        __cached.content.parent.node.innerHTML = "";
      else if (__cached.content && isFunction(__cached.content.remove))
        __cached.content.remove();
    }
    delete element.content;
  }
};
var set = function(params, options, el) {
  const element = el || this;
  const isEqual = isEqualDeep(params, element.content);
  if (isEqual && element.content.__cached)
    return element;
  removeContentElement(element);
  if (params) {
    const { childExtend } = params;
    if (!childExtend && element.childExtend)
      params.childExtend = element.childExtend;
    create_default(params, element, "content", {
      ignoreChildExtend: true,
      ...registry_default.defaultOptions,
      ...options_default.create
    });
  }
  return element;
};
var set_default = set;

// src/element/mixins/content.js
var content_default = (param, element, node, options) => {
  if (param && element) {
    if (param.__hash === element.content.__hash && element.content.update) {
      const { define } = element;
      element.content.update(param);
    } else {
      set_default.call(element, param, options);
    }
  }
};

// src/element/mixins/data.js
var data_default = (params, element, node) => {
  if (params && params.showOnNode) {
    if (!isObject(params))
      report("HTMLInvalidData", params);
    for (const dataset in params) {
      if (dataset !== "showOnNode") {
        node.dataset[dataset] = exec(params[dataset], element);
      }
    }
  }
};

// src/element/mixins/html.js
var html_default = (param, element, node) => {
  const prop = exec(param, element);
  if (prop !== element.__html) {
    if (node.nodeName === "SVG")
      node.textContent = prop;
    else
      node.innerHTML = prop;
    element.__html = prop;
  }
};

// src/element/mixins/style.js
var style_default = (params, element, node) => {
  if (params) {
    if (isObject(params))
      map(node.style, params, element);
    else
      report("HTMLInvalidStyles", params);
  }
};

// src/element/mixins/text.js
var text_default = (param, element, node) => {
  const prop = exec(param, element);
  if (element.tag === "string") {
    if (element.text === prop)
      return;
    node.nodeValue = prop;
  } else if (param !== void 0 || param !== null) {
    if (element.__text) {
      if (element.__text.text === prop)
        return;
      element.__text.text = prop;
      if (element.__text.node)
        element.__text.node.nodeValue = prop;
    } else
      create_default({ tag: "string", text: prop }, element, "__text");
  }
};

// src/element/state.js
var IGNORE_STATE_PARAMS = [
  "update",
  "parse",
  "clean",
  "create",
  "parent",
  "__element",
  "__depends",
  "__ref",
  "__root",
  "__components",
  "__projectSystem",
  "__projectState",
  "__projectLibrary",
  "projectStateUpdate",
  "projectSystemUpdate"
];
var parseState = function() {
  const state = this;
  const parseState2 = {};
  for (const param in state) {
    if (!IGNORE_STATE_PARAMS.includes(param)) {
      parseState2[param] = state[param];
    }
  }
  return parseState2;
};
var cleanState = function() {
  const state = this;
  for (const param in state) {
    if (!IGNORE_STATE_PARAMS.includes(param)) {
      delete state[param];
    }
  }
  return state;
};
var projectSystemUpdate = function(obj, options = {}) {
  const state = this;
  if (!state)
    return;
  const rootState = (state.__element.__root || state.__element).state;
  rootState.update({ PROJECT_SYSTEM: obj }, options);
  return state;
};
var projectStateUpdate = function(obj, options = {}) {
  const state = this;
  if (!state)
    return;
  const rootState = (state.__element.__root || state.__element).state;
  rootState.update({ PROJECT_STATE: obj }, options);
  return state;
};
var updateState = function(obj, options = {}) {
  const state = this;
  const element = state.__element;
  state.parent = element.parent.state;
  if (!state.__element)
    createState(element, element.parent);
  if (element.on && isFunction2(element.on.initStateUpdated)) {
    const initReturns = on_exports.initStateUpdated(element.on.initStateUpdated, element, state, obj);
    if (initReturns === false)
      return;
  }
  const stateKey = element.__state;
  if (stateKey) {
    if (state.parent && state.parent[stateKey]) {
      const keyInParentState = state.parent[stateKey];
      if (keyInParentState && !options.stopStatePropogation) {
        if (element.__stateType === "string") {
          return state.parent.update({ [stateKey]: obj.value }, options);
        }
        return state.parent.update({ [stateKey]: obj }, options);
      }
    }
  } else {
    overwriteDeep(state, obj, IGNORE_STATE_PARAMS);
  }
  if (!options.preventUpdate) {
    element.update({}, options);
  } else if (options.preventUpdate === "recursive") {
    element.update({}, { ...options, preventUpdate: true });
  }
  if (state.__depends) {
    for (const el in state.__depends) {
      const findElement = state.__depends[el];
      findElement.clean().update(state.parse(), options);
    }
  }
  if (!options.preventUpdateListener && element.on && isFunction2(element.on.stateUpdated)) {
    on_exports.stateUpdated(element.on.stateUpdated, element, state, obj);
  }
};
var createState = function(element, parent) {
  let { state, __root } = element;
  if (isFunction2(state))
    state = exec(state, element);
  if (is(state)("string", "number")) {
    element.__state = state;
    state = {};
  }
  if (state === true) {
    element.__state = element.key;
    state = {};
  }
  if (!state) {
    if (parent && parent.state)
      return parent.state;
    return {};
  } else {
    element.__hasRootState = true;
  }
  if (element.on && isFunction2(element.on.stateInit)) {
    on_exports.stateInit(element.on.stateInit, element, element.state);
  }
  let stateKey = element.__state;
  if (stateKey) {
    let parentState = parent.state;
    let parentStateKey;
    const parents = stateKey.split("../");
    for (let i = 1; i < parents.length; i++) {
      stateKey = parents[i];
      parentState = parentState.parent;
    }
    if (stateKey.includes(".")) {
      [parentStateKey, stateKey] = stateKey.split(".");
      parentState = parentState[parentStateKey];
    }
    if (parentState && parentState[stateKey]) {
      const keyInParentState = parentState[stateKey];
      if (is(keyInParentState)("object", "array")) {
        state = deepClone(keyInParentState);
      } else if (is(keyInParentState)("string", "number")) {
        state = { value: keyInParentState };
        element.__stateType = "string";
      } else if (isUndefined(keyInParentState)) {
        console.warn(stateKey, "is not in present", "replacing with ", {});
        state = {};
      }
    }
  }
  const { __ref } = state;
  if (__ref) {
    state = deepClone(__ref, IGNORE_STATE_PARAMS);
    if (isObject2(__ref.__depends)) {
      __ref.__depends[element.key] = state;
    } else
      __ref.__depends = { [element.key]: state };
  } else {
    state = deepClone(state, IGNORE_STATE_PARAMS);
  }
  element.state = state;
  state.clean = cleanState;
  state.parse = parseState;
  state.update = updateState;
  state.create = createState;
  state.parent = element.parent.state;
  state.__element = element;
  state.__root = __root ? __root.state : state;
  state.projectSystemUpdate = projectSystemUpdate;
  state.projectStateUpdate = projectStateUpdate;
  state.__components = (state.__root || state).COMPONENTS;
  state.__projectSystem = (state.__root || state).PROJECT_SYSTEM;
  state.__projectState = (state.__root || state).PROJECT_STATE;
  state.__projectLibrary = (state.__root || state).PROJECT_LIBRARY;
  if (element.on && isFunction2(element.on.stateCreated)) {
    on_exports.stateCreated(element.on.stateCreated, element, state);
  }
  return state;
};
var state_default = createState;

// src/element/mixins/state.js
var state_default2 = (params, element, node) => {
  const state = exec(params, element);
  if (isObject(state)) {
    for (const param in state) {
      if (IGNORE_STATE_PARAMS.includes(param))
        continue;
      element.state[param] = exec(state[param], element);
    }
  }
  return element;
};

// src/element/mixins/registry.js
var registry_default = {
  attr: attr_default,
  style: style_default,
  text: text_default,
  html: html_default,
  content: content_default,
  data: data_default,
  class: classList_default,
  state: state_default2,
  extend: {},
  childExtend: {},
  childExtendRecursive: {},
  props: {},
  path: {},
  if: {},
  define: {},
  transform: {},
  __hash: {},
  __componentKey: {},
  __cached: {},
  __defined: {},
  __exec: {},
  __changes: {},
  __trash: {},
  __root: {},
  __props: {},
  __extend: {},
  __ifFragment: {},
  __children: {},
  __ifFalsy: {},
  __text: {},
  __element: {},
  __html: {},
  __class: {},
  __className: {},
  __classNames: {},
  __attr: {},
  __state: {},
  __stateType: {},
  __currentSnapshot: {},
  __hasRootState: {},
  nextElement: {},
  previousElement: {},
  key: {},
  tag: {},
  query: {},
  parent: {},
  node: {},
  set: {},
  update: {},
  setProps: {},
  remove: {},
  removeContent: {},
  lookup: {},
  spotByPath: {},
  keys: {},
  log: {},
  parse: {},
  parseDeep: {},
  on: {},
  component: {},
  context: {}
};
var parseFilters = {
  elementKeys: [
    "tag",
    "text",
    "style",
    "attr",
    "class",
    "state",
    "class",
    "data",
    "content",
    "html"
  ],
  propsKeys: ["__element"],
  stateKeys: []
};

// src/element/methods.js
var ENV = "development";
var lookup = function(key) {
  const element = this;
  let { parent } = element;
  while (parent.key !== key) {
    if (parent[key])
      return parent[key];
    parent = parent.parent;
    if (!parent)
      return;
  }
  return parent;
};
var spotByPath = function(path) {
  const element = this;
  const arr = [].concat(path);
  let active = root_default[arr[0]];
  if (!arr || !arr.length)
    return console.log(arr, "on", element.key, "is undefined");
  while (active.key === arr[0]) {
    arr.shift();
    if (!arr.length)
      break;
    active = active[arr[0]];
    if (!active)
      return;
  }
  return active;
};
var remove = function(params) {
  const element = this;
  if (isFunction(element.node.remove))
    element.node.remove();
  else if (ENV === "test" || ENV === "development") {
    console.warn("This item cant be removed");
    element.log();
  }
  delete element.parent[element.key];
};
var setProps = function(param, options) {
  const element = this;
  if (!param || !element.props)
    return;
  element.update({ props: param }, options);
  return element.props;
};
var keys = function() {
  const element = this;
  const keys2 = [];
  for (const param in element) {
    if (registry_default[param] && !parseFilters.elementKeys.includes(param))
      continue;
    keys2.push(param);
  }
  return keys2;
};
var parse = function() {
  const element = this;
  const obj = {};
  const keyList = keys.call(element);
  keyList.forEach((v) => obj[v] = element[v]);
  return obj;
};
var parseDeep = function() {
  const element = this;
  const obj = parse.call(element);
  for (const k in obj) {
    if (isObjectLike(obj[k])) {
      obj[k] = parseDeep.call(obj[k]);
    }
  }
  return obj;
};
var log = function(...args) {
  const element = this;
  console.group(element.key);
  if (args.length) {
    args.forEach((v) => console.log(`%c${v}:
`, "font-weight: bold", element[v]));
  } else {
    console.log(element.path);
    const keys2 = element.keys();
    keys2.forEach((v) => console.log(`%c${v}:
`, "font-weight: bold", element[v]));
  }
  console.groupEnd(element.key);
  return element;
};
var isMethod = function(param) {
  return param === "set" || param === "update" || param === "remove" || param === "removeContent" || param === "lookup" || param === "spotByPath" || param === "keys" || param === "parse" || param === "setProps" || param === "parseDeep" || param === "if" || param === "log" || param === "nextElement" || param === "previousElement";
};
var nextElement = function() {
  const element = this;
  const { key, parent } = element;
  const { __children } = parent;
  const currentIndex = __children.indexOf(key);
  const nextChild = __children[currentIndex + 1];
  console.log(nextChild);
  return parent[nextChild];
};
var previousElement = function(el) {
  const element = el || this;
  const { key, parent } = element;
  const { __children } = parent;
  if (!__children)
    return;
  const currentIndex = __children.indexOf(key);
  return parent[__children[currentIndex - 1]];
};

// src/element/iterate.js
var applyEvents = (element) => {
  const { node, on } = element;
  for (const param in on) {
    if (param === "init" || param === "render" || param === "update")
      continue;
    const appliedFunction = element.on[param];
    if (isFunction(appliedFunction)) {
      node.addEventListener(
        param,
        (event) => appliedFunction(event, element, element.state),
        true
      );
    }
  }
};
var throughInitialExec = (element) => {
  for (const param in element) {
    const prop = element[param];
    if (isFunction(prop) && !isMethod(param)) {
      element.__exec[param] = prop;
      element[param] = prop(element, element.state);
    }
  }
};
var throughUpdatedExec = (element, options) => {
  const { __exec } = element;
  const changes = {};
  for (const param in __exec) {
    const prop = element[param];
    const newExec = __exec[param](element, element.state);
    if (prop && prop.node && (isString(newExec) || isNumber(newExec))) {
      overwrite(prop, { text: newExec }, options);
    } else if (newExec !== prop) {
      element.__cached[param] = changes[param] = prop;
      element[param] = newExec;
    }
  }
  return changes;
};
var throughInitialDefine = (element, options) => {
  const { define } = element;
  let obj = {};
  if (isObject(define)) {
    obj = { ...define };
  }
  if (isObject(options.define)) {
    obj = { ...obj, ...options.define };
  }
  for (const param in obj) {
    let prop = element[param];
    if (isFunction(prop) && !isMethod(param)) {
      element.__exec[param] = prop;
      element[param] = prop = exec(prop, element);
    }
    element.__cached[param] = prop;
    element[param] = obj[param](prop, element, element.state);
  }
  return element;
};
var throughUpdatedDefine = (element, options) => {
  const { define, __exec } = element;
  const changes = {};
  let obj = {};
  if (isObject(define)) {
    obj = { ...define };
  }
  if (isObject(options.define)) {
    obj = { ...obj, ...options.define };
  }
  for (const param in obj) {
    const execParam = __exec[param];
    if (execParam)
      element.__cached[param] = execParam(element, element.state);
    const cached = exec(element.__cached[param], element);
    element[param] = obj[param](cached, element, element.state);
  }
  return changes;
};

// src/element/node.js
var ENV2 = "development";
var createNode2 = (element, options) => {
  let { node, tag } = element;
  let isNewNode;
  if (!node) {
    isNewNode = true;
    if (element.__ifFalsy)
      return element;
    if (tag === "shadow") {
      node = element.node = element.parent.node.attachShadow({ mode: "open" });
    } else
      node = element.node = cache_default(element);
    if (element.on && isFunction(element.on.attachNode)) {
      attachNode(element.on.attachNode, element, element.state);
    }
  }
  if (ENV2 === "test" || ENV2 === "development") {
    node.ref = element;
    if (isFunction(node.setAttribute))
      node.setAttribute("key", element.key);
  }
  if (element.__ifFalsy)
    return element;
  if (element.tag !== "string" || element.tag !== "fragment") {
    throughInitialDefine(element, options);
    throughInitialExec(element);
    if (isNewNode && isObject(element.on))
      applyEvents(element);
    for (const param in element) {
      const prop = element[param];
      if (isMethod(param) || isObject(registry_default[param]) || prop === void 0)
        continue;
      const hasDefined = element.define && element.define[param];
      const ourParam = registry_default[param];
      const hasOptionsDefine = options.define && options.define[param];
      if (options.define) {
      }
      if (ourParam && !hasOptionsDefine) {
        if (isFunction(ourParam))
          ourParam(prop, element, node, options);
      } else if (element[param] && !hasDefined && !hasOptionsDefine) {
        create_default(exec(prop, element), element, param, options);
      }
    }
  }
  return element;
};
var node_default = createNode2;

// src/element/assign.js
var appendNode = (node, parentNode) => {
  parentNode.appendChild(node);
  return node;
};
var assignNode = (element, parent, key) => {
  parent[key || element.key] = element;
  if (element.tag !== "shadow") {
    appendNode(element.node, parent.node);
  }
  return element;
};

// src/element/extend.js
var ENV3 = "development";
var applyExtend = (element, parent, options = {}) => {
  if (isFunction(element))
    element = exec(element, parent);
  let { extend, props } = element;
  if (isString(extend))
    extend = options.components[extend];
  const extendStack = getExtendStack(extend);
  if (ENV3 !== "test" || ENV3 !== "development")
    delete element.extend;
  let childExtendStack = [];
  if (parent) {
    element.parent = parent;
    if (!options.ignoreChildExtend) {
      if (props && props.ignoreChildExtend)
        return;
      childExtendStack = getExtendStack(parent.childExtend);
      if (parent.childExtendRecursive) {
        const childExtendRecursiveStack = getExtendStack(parent.childExtendRecursive);
        childExtendStack = childExtendStack.concat(childExtendRecursiveStack);
        element.childExtendRecursive = parent.childExtendRecursive;
      }
    }
  }
  const extendLength = extendStack.length;
  const childExtendLength = childExtendStack.length;
  let stack = [];
  if (extendLength && childExtendLength) {
    stack = jointStacks(extendStack, childExtendStack);
  } else if (extendLength) {
    stack = extendStack;
  } else if (childExtendLength) {
    stack = childExtendStack;
  } else if (!options.extend)
    return element;
  if (options.extend) {
    const defaultOptionsExtend = getExtendStack(options.extend);
    stack = [].concat(stack, defaultOptionsExtend);
  }
  element.__extend = stack;
  let mergedExtend = cloneAndMergeArrayExtend(stack);
  const component = exec(element.component || mergedExtend.component, element);
  if (component && options.components && options.components[component]) {
    const componentExtend = cloneAndMergeArrayExtend(getExtendStack(options.components[component]));
    mergedExtend = deepMergeExtend(componentExtend, mergedExtend);
  }
  return deepMergeExtend(element, mergedExtend);
};

// src/element/props.js
var initProps = (element, parent) => {
  const { props } = element;
  const propsStack = [];
  const isMatch = isString(props) && props.indexOf("match") > -1;
  const matchParent = parent.props && parent.props[element.key];
  const matchParentChild = parent.props && parent.props.childProps;
  const objectizeStringProperty = (propValue) => {
    if (isString(propValue))
      return { inheritedString: propValue };
    return propValue;
  };
  if (matchParent && props !== "match")
    propsStack.push(matchParent);
  if (matchParentChild)
    propsStack.push(matchParentChild);
  if (isObject(props)) {
    propsStack.push(props);
  }
  if (props === "inherit") {
    if (parent.props)
      propsStack.push(parent.props);
  } else if (isMatch) {
    const hasArg = props.split(" ");
    let matchParentValue;
    if (hasArg[1] && parent.props[hasArg[1]]) {
      const secondArgasParentMatchProp = parent.props[hasArg[1]];
      propsStack.push(
        objectizeStringProperty(secondArgasParentMatchProp)
      );
    } else if (matchParent) {
      propsStack.push(
        objectizeStringProperty(matchParent)
      );
    }
    propsStack.push(matchParentValue);
  } else if (props)
    propsStack.push(props);
  if (isArray(element.__extend)) {
    element.__extend.map((extend) => {
      if (extend.props)
        propsStack.push(extend.props);
      return extend.props;
    });
  }
  return propsStack;
};
var inheritProps = (element, parent) => {
  element.props = parent && parent.props || { update: update2, __element: element };
};
var syncProps = (props, element) => {
  element.props = {};
  const mergedProps = { update: update2, __element: element };
  props.forEach((v) => {
    if (v === "update" || v === "__element")
      return;
    element.props = deepMerge(mergedProps, deepClone(exec(v, element)));
  });
  element.props = mergedProps;
  return element.props;
};
var createProps = function(element, parent, cached) {
  const propsStack = cached || initProps(element, parent);
  if (propsStack.length) {
    element.__props = propsStack;
    syncProps(propsStack, element);
    element.props.update = update2;
  } else
    inheritProps(element, parent);
  return element;
};
var updateProps = (newProps, element, parent) => {
  let propsStack = element.__props;
  if (newProps)
    propsStack = element.__props = [].concat(newProps, propsStack);
  if (propsStack)
    syncProps(propsStack, element);
  else
    inheritProps(element, parent);
  return element;
};
function update2(props, options) {
  const element = this.__element;
  element.update({ props }, options);
}
var props_default = createProps;

// src/element/update.js
var snapshot = {
  snapshotId: createSnapshotId
};
var UPDATE_DEFAULT_OPTIONS = {
  stackChanges: false,
  cleanExec: true,
  preventRecursive: false,
  currentSnapshot: false,
  calleeElement: false
};
var update3 = function(params = {}, options = UPDATE_DEFAULT_OPTIONS) {
  const element = this;
  const { define, parent, node } = element;
  const { currentSnapshot, calleeElement } = options;
  if (!calleeElement) {
    element.__currentSnapshot = snapshot.snapshotId();
  }
  const snapshotOnCallee = element.__currentSnapshot || calleeElement && calleeElement.__currentSnapshot;
  if (snapshotOnCallee && currentSnapshot < snapshotOnCallee) {
  }
  if (isString(params) || isNumber(params)) {
    params = { text: params };
  }
  if (isFunction(element.if)) {
    const ifPassed = element.if(element, element.state);
    if (ifPassed)
      delete element.__ifFalsy;
    if (element.__ifFalsy && ifPassed) {
      createNode2(element);
      appendNode(element.node, element.__ifFragment);
    } else if (element.node && !ifPassed) {
      element.node.remove();
      element.__ifFalsy = true;
    }
  }
  if (element.__state) {
    const keyInParentState = parent.state[element.__state];
    if (keyInParentState) {
      const newState = element.__stateType === "string" ? state_default(element, parent) : state_default(element, parent);
      const changes = diff(newState.parse(), element.state.parse());
      if (element.on && isFunction(element.on.initStateUpdated)) {
        const initReturns = on_exports.initStateUpdated(element.on.initStateUpdated, element, element.state, changes);
        if (initReturns === false)
          return;
      }
      element.state = newState;
      if (!options.preventUpdateListener && element.on && isFunction(element.on.stateUpdated)) {
        on_exports.stateUpdated(element.on.stateUpdated, element, element.state, changes);
      }
    }
  } else if (!element.__hasRootState)
    element.state = parent && parent.state || {};
  if (!element.__ifFalsy && !options.preventPropsUpdate)
    updateProps(params.props, element, parent);
  if (element.on && isFunction(element.on.initUpdate) && !options.ignoreInitUpdate) {
    const whatinitreturns = on_exports.initUpdate(element.on.initUpdate, element, element.state);
    if (whatinitreturns === false)
      return;
  }
  const overwriteChanges = overwrite(element, params, UPDATE_DEFAULT_OPTIONS);
  const execChanges = throughUpdatedExec(element, UPDATE_DEFAULT_OPTIONS);
  const definedChanges = throughUpdatedDefine(element, options);
  if (options.stackChanges && element.__stackChanges) {
    const stackChanges = merge(definedChanges, merge(execChanges, overwriteChanges));
    element.__stackChanges.push(stackChanges);
  }
  if (element.__ifFalsy)
    return false;
  if (!node) {
    return;
  }
  for (const param in element) {
    const prop = element[param];
    if (options.preventDefineUpdate === true || options.preventDefineUpdate === param || options.preventContentUpdate && param === "content" || (options.preventStateUpdate && param) === "state" || isMethod(param) || isObject(registry_default[param]) || prop === void 0)
      continue;
    if (options.preventStateUpdate === "once")
      options.preventStateUpdate = false;
    const hasDefined = define && define[param];
    const ourParam = registry_default[param];
    const hasOptionsDefine = options.define && options.define[param];
    if (ourParam && !hasOptionsDefine) {
      if (isFunction(ourParam)) {
        ourParam(prop, element, node);
      }
    } else if (prop && isObject(prop) && !hasDefined && !hasOptionsDefine) {
      if (!options.preventRecursive) {
        const childUpdateCall = () => update3.call(prop, params[prop], {
          ...options,
          currentSnapshot: snapshotOnCallee,
          calleeElement: element
        });
        if (element.props.lazyLoad || options.lazyLoad) {
          global.requestAnimationFrame(() => childUpdateCall());
        } else
          childUpdateCall();
      }
    }
  }
  if (!options.preventUpdate && element.on && isFunction(element.on.update)) {
    on_exports.update(element.on.update, element, element.state);
  }
};
var update_default = update3;

// src/element/create.js
var ENV4 = "development";
var create = (element, parent, key, options = options_default.create || {}) => {
  if (options && !options_default.create)
    options_default.create = options;
  if (element === void 0) {
    if (ENV4 === "test" || ENV4 === "development") {
      console.warn(key, "element is undefined in", parent && parent.path);
    }
    element = {};
  }
  if (element === null)
    return;
  if (element === true)
    element = { text: true };
  if (element.__hash) {
    element = { extend: element };
  }
  if (!parent)
    parent = root_default;
  if (isNode(parent))
    parent = root_default[`${key}_parent`] = { key: ":root", node: parent };
  if (isString(element) || isNumber(element)) {
    const extendTag = element.extend && element.extend.tag;
    const childExtendTag = parent.childExtend && parent.childExtend.tag;
    const isKeyValidHTMLTag = nodes_default.body.indexOf(key) > -1 && key;
    element = {
      text: element,
      tag: extendTag || childExtendTag || isKeyValidHTMLTag || "string"
    };
  }
  const assignedKey = (element.key || key || createID()).toString();
  const { extend, props, state, childExtend, childProps } = element;
  if (assignedKey.slice(0, 1) === "@") {
    if (props) {
      props.display = "none";
      if (props[assignedKey])
        props[assignedKey].display = props.display;
      else
        props[assignedKey] = { display: props.display || "block" };
    } else {
      parent[assignedKey] = element = {
        ...element,
        props: {
          display: "none",
          [assignedKey]: { display: "block" }
        }
      };
    }
  }
  if (options.components) {
    const { components } = options;
    const { extend: extend2 } = element;
    const execExtend = exec(extend2, element);
    if (isString(execExtend)) {
      if (components[execExtend])
        element.extend = components[execExtend];
      else {
        if (ENV4 === "test" || ENV4 === "development") {
          console.warn(execExtend, "is not in library", components, element);
          console.warn("replacing with ", {});
        }
        element.extend = {};
      }
    }
  }
  if (options.onlyResolveExtends) {
    applyExtend(element, parent, options);
    for (const param in element) {
      const prop = element[param];
      if (isMethod(param) || isObject(registry_default[param]) || prop === void 0)
        continue;
      const hasDefined = element.define && element.define[param];
      const ourParam = registry_default[param];
      const hasOptionsDefine = options.define && options.define[param];
      if (ourParam && !hasOptionsDefine) {
        continue;
      } else if (element[param] && !hasDefined && !hasOptionsDefine) {
        create(exec(prop, element), element, param, options);
      }
    }
    return element;
  }
  if (options.context && !root_default.context)
    root_default.context = options.context;
  element.context = root_default.context;
  applyExtend(element, parent, options);
  if (Object.keys(options).length) {
    registry_default.defaultOptions = options;
    if (options.ignoreChildExtend)
      delete options.ignoreChildExtend;
  }
  element.key = assignedKey;
  if (!element.transform)
    element.transform = {};
  if (!element.__cached)
    element.__cached = {};
  if (!element.__exec)
    element.__exec = {};
  if (!element.__class)
    element.__class = {};
  if (!element.__classNames)
    element.__classNames = {};
  if (!element.__attr)
    element.__attr = {};
  if (!element.__changes)
    element.__changes = [];
  if (!element.__children)
    element.__children = [];
  const hasRoot = parent.parent && parent.parent.key === ":root";
  if (!element.__root)
    element.__root = hasRoot ? parent : parent.__root;
  if (ENV4 === "test" || ENV4 === "development") {
    if (!parent.path)
      parent.path = [];
    element.path = parent.path.concat(assignedKey);
  }
  element.set = set_default;
  element.update = update_default;
  element.remove = remove;
  element.removeContent = removeContentElement;
  element.setProps = setProps;
  element.lookup = lookup;
  element.spotByPath = spotByPath;
  element.parse = parse;
  element.parseDeep = parseDeep;
  element.keys = keys;
  element.nextElement = nextElement;
  element.previousElement = previousElement;
  if (ENV4 === "test" || ENV4 === "development") {
    element.log = log;
  }
  element.state = state_default(element, parent);
  if (isFunction(element.if)) {
    if (!element.if(element, element.state)) {
      const ifFragment = cache_default({ tag: "fragment" });
      element.__ifFragment = appendNode(ifFragment, parent.node);
      element.__ifFalsy = true;
    }
  }
  if (element.node && !element.__ifFalsy) {
    return assignNode(element, parent, assignedKey);
  }
  if (!element.__ifFalsy)
    props_default(element, parent);
  if (element.on && isFunction(element.on.init)) {
    on_exports.init(element.on.init, element, element.state);
  }
  if (element.on && isFunction(element.on.beforeClassAssign)) {
    on_exports.beforeClassAssign(element.on.beforeClassAssign, element, element.state);
  }
  assignClass(element);
  node_default(element, options);
  if (element.__ifFalsy)
    return element;
  assignNode(element, parent, key);
  if (element.on && isFunction(element.on.render)) {
    on_exports.render(element.on.render, element, element.state);
  }
  if (parent.__children)
    parent.__children.push(element.key);
  return element;
};
var create_default = create;

// src/element/define.js
var define_default = (params, options = {}) => {
  const { overwrite: overwrite2 } = options;
  for (const param in params) {
    if (registry_default[param] && !overwrite2) {
      report("OverwriteToBuiltin", param);
    } else
      registry_default[param] = params[param];
  }
};

// src/element/parse.js
var parse2 = (element) => {
  const virtualTree = {
    node: global.createElement("div")
  };
  if (element && element.node)
    assignNode(element, virtualTree);
  else
    create_default(element, virtualTree);
  return virtualTree.node.innerHTML;
};
var parse_default = parse2;

// src/index.js
var ENV5 = "development";
if (ENV5 === "test" || ENV5 === "development")
  global.tree = tree_default;
var src_default = {
  create: create_default,
  parse: parse_default,
  set: set_default,
  define: define_default,
  tree: tree_default
};

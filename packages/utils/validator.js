'use strict'

import { isString, isArray, isFunction, isObjectLike } from './types.js'
import { REGISTRY } from '@domql/element/mixins/registry.js'
import { checkIfKeyIsComponent } from './component.js'

const KNOWN_TOP_LEVEL = new Set([
  ...Object.keys(REGISTRY),
  'extend', 'extends', 'childExtend', 'childExtends', 'childProps', 'children',
  'on', 'component', 'context', 'tag', 'key'
])

const isValidTopLevelKey = (key) => KNOWN_TOP_LEVEL.has(key) || checkIfKeyIsComponent(key)

export const validateDomQL = (element, optionsOrPath = {}, path = []) => {
  // Backward compatibility: (element, path)
  let opts = {}
  if (Array.isArray(optionsOrPath)) {
    path = optionsOrPath
  } else if (optionsOrPath && typeof optionsOrPath === 'object') {
    opts = optionsOrPath
  }
  const errors = []
  const warnings = []
  const riskyLifecycleDefaults = ['render', 'beforeUpdate', 'update']
  const riskyLifecycles = Array.isArray(opts.riskyLifecycles)
    ? opts.riskyLifecycles
    : riskyLifecycleDefaults

  // Common CSS-like property names used frequently in schemas
  const COMMON_CSS = new Set([
    'position','display','visibility','zIndex','inset','top','left','right','bottom',
    'width','height','minWidth','minHeight','maxWidth','maxHeight',
    'padding','paddingLeft','paddingRight','paddingTop','paddingBottom',
    'margin','marginLeft','marginRight','marginTop','marginBottom',
    'gap','rowGap','columnGap','gridGap','gridTemplateColumns','gridTemplateRows',
    'alignItems','justifyContent','placeItems','placeContent','flex','flexGrow','flexShrink',
    'border','borderWidth','borderStyle','borderColor','borderRadius','outline','outlineOffset',
    'background','backgroundColor','color','opacity','overflow','overflowX','overflowY',
    'textDecoration','fontSize','fontWeight','lineHeight','letterSpacing'
  ])

  const visit = (el, p) => {
    if (!isObjectLike(el)) return

    for (const key in el) {
      if (!Object.prototype.hasOwnProperty.call(el, key)) continue
      const value = el[key]
      const nextPath = p.concat(key)

      // Top-level key validation
      if (p.length === 0 && !isValidTopLevelKey(key)) {
        warnings.push({ path: nextPath, rule: 'unknown-key', message: `Unknown top-level key '${key}'` })
        // Heuristic: flag likely CSS props mistakenly placed at top-level
        if (typeof key === 'string') {
          const kebabish = /-/.test(key)
          const camelish = /^[a-z][A-Za-z0-9]*$/.test(key)
          if (COMMON_CSS.has(key) || kebabish || camelish) {
            warnings.push({ path: nextPath, rule: 'css-prop-top-level', message: `Likely CSS property '${key}' at top-level; place under 'style' or inside props` })
          }
        }
      }

      // Pseudo selector keys are not supported as element keys (either top-level or nested)
      if (typeof key === 'string' && (key.charAt(0) === ':' || key.includes('::'))) {
        errors.push({ path: nextPath, rule: 'pseudo-key', message: `Pseudo selector '${key}' is not supported as an element key. Use variants or a CSS plugin.` })
      }

      // Self-extend cycle detection for component entries
      const isComponentKey = checkIfKeyIsComponent(key)
      if (isComponentKey && isObjectLike(value)) {
        const ext = value.extend || value.extends
        if (isString(ext) && ext === key) {
          errors.push({ path: nextPath.concat('extend'), rule: 'self-extend', message: `Component '${key}' extends itself` })
        } else if (isArray(ext) && ext.some((e) => e === key)) {
          errors.push({ path: nextPath.concat('extend'), rule: 'self-extend', message: `Component '${key}' extends itself (in array)` })
        }
        // Unresolved extend strings (if context provided)
        if (opts.context) {
          const { components, pages } = opts.context
          const checkResolve = (token) => {
            if (!isString(token)) return true
            return (
              (components && (components[token] || components['smbls.' + token])) ||
              (pages && token.startsWith('/') && pages[token])
            )
          }
          if (isString(ext) && !checkResolve(ext)) {
            warnings.push({ path: nextPath.concat('extend'), rule: 'extend-unresolved', message: `extend '${ext}' not found in context` })
          } else if (isArray(ext)) {
            ext.forEach((e, i) => {
              if (isString(e) && !checkResolve(e)) {
                warnings.push({ path: nextPath.concat('extend', i), rule: 'extend-unresolved', message: `extend[${i}] '${e}' not found in context` })
              }
            })
          }
        }
      }

      // Type checks for common keys
      if (key === 'style' && value && typeof value !== 'object') {
        errors.push({ path: nextPath, rule: 'style-object', message: 'style must be an object' })
      }
      if (key === 'attr' && value && typeof value !== 'object') {
        errors.push({ path: nextPath, rule: 'attr-object', message: 'attr must be an object' })
      }
      if (key === 'on' && value && typeof value === 'object') {
        for (const evt in value) {
          if (!isFunction(value[evt])) {
            errors.push({ path: nextPath.concat(evt), rule: 'on-function', message: 'on.* must be a function' })
          } else {
            // Heuristic: lifecycle handlers with updates can cause loops
            const src = String(value[evt])
            // We allow safe lifecycle updates (e.g., init/stateCreated/stateUpdate) by default.
            // Warn only for riskier hooks unless user overrides via opts.riskyLifecycles.
            if (riskyLifecycles.includes(evt)) {
              if (src.includes('state.update(') || src.includes('state.replace(') || src.includes('.update(')) {
                warnings.push({ path: nextPath.concat(evt), rule: 'loop-risk-lifecycle-update', message: `on.${evt} calls update/replace; ensure change guards to avoid loops` })
              }
            }
            // Specifically flag on.stateUpdate using state.update/replace (high loop risk)
            if (evt === 'stateUpdate') {
              if (src.includes('state.update(') || src.includes('state.replace(') || src.includes('.update(')) {
                warnings.push({ path: nextPath.concat(evt), rule: 'loop-risk-on-stateUpdate-update', message: 'on.stateUpdate calls update/replace; guard against re-entrancy to avoid loops' })
              }
            }
          }
        }
      }
      if (key === 'children' && !(isArray(value) || isFunction(value))) {
        warnings.push({ path: nextPath, rule: 'children-array-or-fn', message: 'children should be array or function' })
      }
      if (key === 'children' && isArray(value)) {
        // Warn if children elements lack keys or have duplicate keys
        const keys = []
        let hasMissing = false
        value.forEach((child, idx) => {
          const k = child && (child.key || (child.props && child.props.key))
          if (!k) hasMissing = true
          else keys.push(k)
        })
        if (hasMissing) warnings.push({ path: nextPath, rule: 'children-key-missing', message: 'children array has elements without a stable key' })
        const dups = keys.filter((k, i) => keys.indexOf(k) !== i)
        if (dups.length) warnings.push({ path: nextPath, rule: 'children-key-duplicate', message: `duplicate child keys: ${Array.from(new Set(dups)).join(', ')}` })
      }

      // Props function side-effects
      if (key === 'props' && value && typeof value === 'object') {
        for (const pk in value) {
          const pv = value[pk]
          if (isFunction(pv)) {
            const src = String(pv)
            if (src.includes('state.update(') || src.includes('state.replace(') || src.includes('.update(')) {
              warnings.push({ path: nextPath.concat(pk), rule: 'prop-side-effect', message: `props.${pk} function calls update/replace; may cause loops` })
            }
          }
        }
        if (Object.prototype.hasOwnProperty.call(value, 'props')) {
          warnings.push({ path: nextPath.concat('props'), rule: 'props-in-props', message: 'props.props found; this is likely unintended' })
        }
        if (Object.prototype.hasOwnProperty.call(value, 'state')) {
          warnings.push({ path: nextPath.concat('state'), rule: 'state-in-props', message: 'props.state found; prefer top-level state' })
        }
      }

      // Children function side-effects
      if (key === 'children' && isFunction(value)) {
        const src = String(value)
        if (src.includes('state.update(') || src.includes('state.replace(') || src.includes('.update(')) {
          warnings.push({ path: nextPath, rule: 'children-side-effect', message: 'children function calls update/replace; keep children pure' })
        }
      }

      // Recurse for objects
      if (isObjectLike(value)) visit(value, nextPath)
    }
  }

  visit(element, path)
  return { errors, warnings }
}

// Optional helper to produce a concise guidance summary for users
export const summarizeValidation = ({ errors = [], warnings = [] } = {}) => {
  const lines = []
  const push = (level, msg, p) => {
    const loc = p && p.length ? ` @ ${p.join('.')}` : ''
    lines.push(`${level}: ${msg}${loc}`)
  }
  errors.forEach(e => push('Error', e.message, e.path))
  warnings.forEach(w => push('Warn', w.message, w.path))
  if (!lines.length) return 'No issues detected.'
  lines.push('Tips:')
  lines.push('- Place CSS properties under style or inside props, not at top-level.')
  lines.push('- Avoid using pseudo selectors as element keys; prefer variants or a CSS plugin.')
  lines.push('- Ensure lifecycle and stateUpdate handlers don\'t call update/replace without guards.')
  return lines.join('\n')
}

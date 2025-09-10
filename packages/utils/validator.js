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

  const visit = (el, p) => {
    if (!isObjectLike(el)) return

    for (const key in el) {
      if (!Object.prototype.hasOwnProperty.call(el, key)) continue
      const value = el[key]
      const nextPath = p.concat(key)

      // Top-level key validation
      if (p.length === 0 && !isValidTopLevelKey(key)) {
        warnings.push({ path: nextPath, rule: 'unknown-key', message: `Unknown top-level key '${key}'` })
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



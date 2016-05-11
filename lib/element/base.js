'use strict'

exports.base = {
  node: document && document.body || $.Error.report('DocumentNotDefined', document)
}

module.exports = {
  "extends": "standard",
  "plugins": ["jest"],
  "env": {
    "es6": true,
    "browser": true,
    "node": true,
    "jest": true,
    "jest/globals": true
  },
  overrides: [{
    files: [ '**/*.test.js' ],
    env: { jest: true },
    plugins: [ 'jest' ],
  }]
}
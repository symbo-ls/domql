const path = require('path')
const { lstatSync, readdirSync } = require('fs')
// get listing of packages in the mono repo
const basePath = path.resolve(__dirname, 'packages')
const packages = readdirSync(basePath).filter(name => {
  return lstatSync(path.join(basePath, name)).isDirectory()
})

module.exports = {
  verbose: true,
  projects: ['packages/*'],
  testEnvironment: 'node',
  moduleDirectories: ['packages'],
  collectCoverageFrom: [
    'packages/**/*.js'
  ],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  moduleNameMapper: {
    ...packages.reduce(
      (acc, name) => ({
        ...acc,
        [`@symbo.ls/${name}(.*)$`]:
           `<rootDir>/packages/./${name}/$1`
      }),
      {}
    )
  }
}

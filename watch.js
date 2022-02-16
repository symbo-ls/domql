const fs = require('fs')

const oldPath = '../react-starter-kit/package.json'
const tempPath = '../react-starter-kit/package1.json'

fs.rename(oldPath, tempPath, function (err) {
  if (err) throw err
  fs.rename(tempPath, oldPath, function (err) {
    if (err) throw err
    console.log('Successfully renamed - AKA moved!')
  })
})

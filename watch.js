const fs = require('fs')

const oldPath = '../starter-kit/package.json'
const tempPath = '../starter-kit/package1.json'

fs.rename(oldPath, tempPath, function (err) {
  if (err) throw err
  fs.rename(tempPath, oldPath, function (err) {
    if (err) throw err
    console.log('Successfully renamed - AKA moved!')
  })
})

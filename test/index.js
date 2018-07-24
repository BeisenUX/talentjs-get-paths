
const fs = require('fs')
const assert = require('assert')
const getDepsFilePath = require('../lib/')

describe('Bebel解析', () => {
  it('获取define后面的paths', () => {
    let content = fs.readFileSync(`${__dirname}/test-file.js`, 'utf-8')
    getDepsFilePath(content)
      .then(paths => console.log(paths))
  })
})


const acorn = require('acorn')
const walk = require('acorn/dist/walk')

export default async (content) => {
  let depPaths = await new Promise((resolve, reject) => {
    walk.simple(
      acorn.parse(content),
      {
        ExpressionStatement (node) {
          // 判断是不是define
          if (node.expression.type === 'CallExpression' &&
              node.expression.callee.type === 'Identifier' &&
              node.expression.callee.name === 'define') {
            // 获取以来模块路径
            let [ arrayExpression ] = node.expression.arguments
            let paths = arrayExpression.elements.map(pathNode => pathNode.value)
            resolve(paths)
          }
        }
      }
    )
  })
  return depPaths
}

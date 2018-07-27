const acorn = require('acorn')
const walk = require('acorn/dist/walk')

export default async (content) => {
  let depPaths = await new Promise((resolve, reject) => {
    let paths = [], templatePaths = []
    walk.simple(
      acorn.parse(content),
      {
        ExpressionStatement (node) {
          // 判断是不是define
          // console.log(node)
          if (node.expression.type === 'CallExpression' &&
              node.expression.callee.type === 'Identifier' &&
              node.expression.callee.name === 'define') {
            // 获取以来模块路径
            let [ arrayExpression ] = node.expression.arguments
            paths = arrayExpression.elements.map(pathNode => pathNode.value)
          }
        },
        MemberExpression (node) {
          if(node.object && node.object.name === 'jst') {
            templatePaths.push(node.property.value)
          }
        }
      }
    )
    resolve({
      paths,
      templatePaths
    })
  })
  return depPaths
}

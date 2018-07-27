'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const acorn = require('acorn');
const walk = require('acorn/dist/walk');

exports.default = (() => {
  var _ref = _asyncToGenerator(function* (content) {
    let depPaths = yield new Promise(function (resolve, reject) {
      let paths = [],
          templatePaths = [];
      walk.simple(acorn.parse(content), {
        ExpressionStatement(node) {
          // 判断是不是define
          // console.log(node)
          if (node.expression.type === 'CallExpression' && node.expression.callee.type === 'Identifier' && node.expression.callee.name === 'define') {
            // 获取以来模块路径
            let [arrayExpression] = node.expression.arguments;
            paths = arrayExpression.elements.map(pathNode => pathNode.value);
          }
        },
        MemberExpression(node) {
          if (node.object && node.object.name === 'jst') {
            templatePaths.push(node.property.value);
          }
        }
      });
      resolve({
        paths,
        templatePaths
      });
    });
    return depPaths;
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})();

module.exports = exports['default'];
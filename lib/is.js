'use strict';

/**
 * @Author: Zhengfeng.Yao <yzf>
 * @Date:   2017-05-03 15:53:49
 * @Last modified by:   yzf
 * @Last modified time: 2017-05-03 15:53:50
 */

function type(obj) {
  return Object.prototype.toString.call(obj);
}

exports.String = function (obj) {
  return type(obj) === '[object String]';
};
exports.Array = function (obj) {
  return type(obj) === '[object Array]';
};
exports.Object = function (obj) {
  return type(obj) === '[object Object]';
};
exports.Boolean = function (obj) {
  return type(obj) === '[object Boolean]';
};
//# sourceMappingURL=is.js.map
/* ************************************************************************
 *
 *    qxcompiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/johnspackman/qxcompiler
 *
 *    Copyright:
 *      2011-2016 Zenesis Limited, http://www.zenesis.com
 *
 *    License:
 *      LGPL: http://www.gnu.org/licenses/lgpl.html
 *      EPL: http://www.eclipse.org/org/documents/epl-v10.php
 *
 *      This software is provided under the same licensing terms as Qooxdoo,
 *      please see the LICENSE file in the Qooxdoo project's top-level directory
 *      for details.
 *
 *    Authors:
 *      * John Spackman (john.spackman@zenesis.com)
 *
 * ************************************************************************/

var fs = require("fs");
var qx = require("qooxdoo");
var util = require("../util");

var log = util.createLog("preprocess");

qx.Class.define("qxcompiler.Preprocess", {
  extend: qx.core.Object,

  construct: function(path) {
    this.base(arguments);
    this.__path = path;
  },

  members: {
    __path: null,

    run: function(outputTo, cb) {
      var t = this;
      fs.readFile(this.__path, { encoding: "utf8" }, function(err, data) {
        if (err)
          return cb(err);
        t._process(data, function(data) {
          if (typeof outputTo == "string")
            return fs.writeFile(outputTo, data, { encoding: "utf8" }, cb);
          if (typeof outputTo == "function")
            return outputTo(data, cb);
          return cb(null, data);
        });
      });
    },

    _process: function(data, cb) {
      data = data.replace(/(''|"")?\/\*#([^\n]+)([\s\S]*)\*\//gm, function(match, quotes, cmd, body) {
        var quote = quotes[0];
        if (quote == '\'')
          body = body.replace(/'/gm, "\\'");
        else
          body = body.replace(/"/gm, "\\\"");
        var result = "";
        body.split("\n").forEach(function(line, index) {
          if (index == 0)
            return;
          if (index > 1)
            result += " + \n";
          result += quote + line + "\\n" + quote;
        });
        return result;
      });
      cb(data);
    }
  }
});

module.exports = qxcompiler.Preprocess;

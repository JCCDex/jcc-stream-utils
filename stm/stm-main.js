exports.Remote = require('./remote').Remote;
exports.Request = require('./request').Request;
exports.Account = require('./account').Account;
exports.Transaction = require('./transaction').Transaction;
exports.Server = require('./server').Server;

// Important: We do not guarantee any specific version of SJCL or for any
// specific features to be included. The version and configuration may change at
// any time without warning.
//
// However, for programs that are tied to a specific version of stream.js like
// the official client, it makes sense to expose the SJCL instance so we don't
// have to include it twice.
// camelCase to under_scored API conversion
function attachUnderscored(c) {
  var o = exports[c];

  Object.keys(o.prototype).forEach(function(key) {
    var UPPERCASE = /([A-Z]{1})[a-z]+/g;

    if (!UPPERCASE.test(key)) {
      return;
    }

    var underscored = key.replace(UPPERCASE, function(c) {
      return '_' + c.toLowerCase();
    });

    o.prototype[underscored] = o.prototype[key];
  });
};

['Remote',
  'Request',
  'Transaction',
  'Account',
  'Server'
].forEach(attachUnderscored);

// vim:sw=2:sts=2:ts=8:et
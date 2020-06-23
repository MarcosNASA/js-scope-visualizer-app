(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
  (function (global){
  'use strict';
  
  var objectAssign = require('object-assign');
  
  // compare and isBuffer taken from https://github.com/feross/buffer/blob/680e9e5e488f22aac27599a57dc844a6315928dd/index.js
  // original notice:
  
  /*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
   * @license  MIT
   */
  function compare(a, b) {
    if (a === b) {
      return 0;
    }
  
    var x = a.length;
    var y = b.length;
  
    for (var i = 0, len = Math.min(x, y); i < len; ++i) {
      if (a[i] !== b[i]) {
        x = a[i];
        y = b[i];
        break;
      }
    }
  
    if (x < y) {
      return -1;
    }
    if (y < x) {
      return 1;
    }
    return 0;
  }
  function isBuffer(b) {
    if (global.Buffer && typeof global.Buffer.isBuffer === 'function') {
      return global.Buffer.isBuffer(b);
    }
    return !!(b != null && b._isBuffer);
  }
  
  // based on node assert, original notice:
  // NB: The URL to the CommonJS spec is kept just for tradition.
  //     node-assert has evolved a lot since then, both in API and behavior.
  
  // http://wiki.commonjs.org/wiki/Unit_Testing/1.0
  //
  // THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
  //
  // Originally from narwhal.js (http://narwhaljs.org)
  // Copyright (c) 2009 Thomas Robinson <280north.com>
  //
  // Permission is hereby granted, free of charge, to any person obtaining a copy
  // of this software and associated documentation files (the 'Software'), to
  // deal in the Software without restriction, including without limitation the
  // rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
  // sell copies of the Software, and to permit persons to whom the Software is
  // furnished to do so, subject to the following conditions:
  //
  // The above copyright notice and this permission notice shall be included in
  // all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  // AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
  // ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
  // WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  
  var util = require('util/');
  var hasOwn = Object.prototype.hasOwnProperty;
  var pSlice = Array.prototype.slice;
  var functionsHaveNames = (function () {
    return function foo() {}.name === 'foo';
  }());
  function pToString (obj) {
    return Object.prototype.toString.call(obj);
  }
  function isView(arrbuf) {
    if (isBuffer(arrbuf)) {
      return false;
    }
    if (typeof global.ArrayBuffer !== 'function') {
      return false;
    }
    if (typeof ArrayBuffer.isView === 'function') {
      return ArrayBuffer.isView(arrbuf);
    }
    if (!arrbuf) {
      return false;
    }
    if (arrbuf instanceof DataView) {
      return true;
    }
    if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
      return true;
    }
    return false;
  }
  // 1. The assert module provides functions that throw
  // AssertionError's when particular conditions are not met. The
  // assert module must conform to the following interface.
  
  var assert = module.exports = ok;
  
  // 2. The AssertionError is defined in assert.
  // new assert.AssertionError({ message: message,
  //                             actual: actual,
  //                             expected: expected })
  
  var regex = /\s*function\s+([^\(\s]*)\s*/;
  // based on https://github.com/ljharb/function.prototype.name/blob/adeeeec8bfcc6068b187d7d9fb3d5bb1d3a30899/implementation.js
  function getName(func) {
    if (!util.isFunction(func)) {
      return;
    }
    if (functionsHaveNames) {
      return func.name;
    }
    var str = func.toString();
    var match = str.match(regex);
    return match && match[1];
  }
  assert.AssertionError = function AssertionError(options) {
    this.name = 'AssertionError';
    this.actual = options.actual;
    this.expected = options.expected;
    this.operator = options.operator;
    if (options.message) {
      this.message = options.message;
      this.generatedMessage = false;
    } else {
      this.message = getMessage(this);
      this.generatedMessage = true;
    }
    var stackStartFunction = options.stackStartFunction || fail;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, stackStartFunction);
    } else {
      // non v8 browsers so we can have a stacktrace
      var err = new Error();
      if (err.stack) {
        var out = err.stack;
  
        // try to strip useless frames
        var fn_name = getName(stackStartFunction);
        var idx = out.indexOf('\n' + fn_name);
        if (idx >= 0) {
          // once we have located the function frame
          // we need to strip out everything before it (and its line)
          var next_line = out.indexOf('\n', idx + 1);
          out = out.substring(next_line + 1);
        }
  
        this.stack = out;
      }
    }
  };
  
  // assert.AssertionError instanceof Error
  util.inherits(assert.AssertionError, Error);
  
  function truncate(s, n) {
    if (typeof s === 'string') {
      return s.length < n ? s : s.slice(0, n);
    } else {
      return s;
    }
  }
  function inspect(something) {
    if (functionsHaveNames || !util.isFunction(something)) {
      return util.inspect(something);
    }
    var rawname = getName(something);
    var name = rawname ? ': ' + rawname : '';
    return '[Function' +  name + ']';
  }
  function getMessage(self) {
    return truncate(inspect(self.actual), 128) + ' ' +
           self.operator + ' ' +
           truncate(inspect(self.expected), 128);
  }
  
  // At present only the three keys mentioned above are used and
  // understood by the spec. Implementations or sub modules can pass
  // other keys to the AssertionError's constructor - they will be
  // ignored.
  
  // 3. All of the following functions must throw an AssertionError
  // when a corresponding condition is not met, with a message that
  // may be undefined if not provided.  All assertion methods provide
  // both the actual and expected values to the assertion error for
  // display purposes.
  
  function fail(actual, expected, message, operator, stackStartFunction) {
    throw new assert.AssertionError({
      message: message,
      actual: actual,
      expected: expected,
      operator: operator,
      stackStartFunction: stackStartFunction
    });
  }
  
  // EXTENSION! allows for well behaved errors defined elsewhere.
  assert.fail = fail;
  
  // 4. Pure assertion tests whether a value is truthy, as determined
  // by !!guard.
  // assert.ok(guard, message_opt);
  // This statement is equivalent to assert.equal(true, !!guard,
  // message_opt);. To test strictly for the value true, use
  // assert.strictEqual(true, guard, message_opt);.
  
  function ok(value, message) {
    if (!value) fail(value, true, message, '==', assert.ok);
  }
  assert.ok = ok;
  
  // 5. The equality assertion tests shallow, coercive equality with
  // ==.
  // assert.equal(actual, expected, message_opt);
  
  assert.equal = function equal(actual, expected, message) {
    if (actual != expected) fail(actual, expected, message, '==', assert.equal);
  };
  
  // 6. The non-equality assertion tests for whether two objects are not equal
  // with != assert.notEqual(actual, expected, message_opt);
  
  assert.notEqual = function notEqual(actual, expected, message) {
    if (actual == expected) {
      fail(actual, expected, message, '!=', assert.notEqual);
    }
  };
  
  // 7. The equivalence assertion tests a deep equality relation.
  // assert.deepEqual(actual, expected, message_opt);
  
  assert.deepEqual = function deepEqual(actual, expected, message) {
    if (!_deepEqual(actual, expected, false)) {
      fail(actual, expected, message, 'deepEqual', assert.deepEqual);
    }
  };
  
  assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
    if (!_deepEqual(actual, expected, true)) {
      fail(actual, expected, message, 'deepStrictEqual', assert.deepStrictEqual);
    }
  };
  
  function _deepEqual(actual, expected, strict, memos) {
    // 7.1. All identical values are equivalent, as determined by ===.
    if (actual === expected) {
      return true;
    } else if (isBuffer(actual) && isBuffer(expected)) {
      return compare(actual, expected) === 0;
  
    // 7.2. If the expected value is a Date object, the actual value is
    // equivalent if it is also a Date object that refers to the same time.
    } else if (util.isDate(actual) && util.isDate(expected)) {
      return actual.getTime() === expected.getTime();
  
    // 7.3 If the expected value is a RegExp object, the actual value is
    // equivalent if it is also a RegExp object with the same source and
    // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
    } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
      return actual.source === expected.source &&
             actual.global === expected.global &&
             actual.multiline === expected.multiline &&
             actual.lastIndex === expected.lastIndex &&
             actual.ignoreCase === expected.ignoreCase;
  
    // 7.4. Other pairs that do not both pass typeof value == 'object',
    // equivalence is determined by ==.
    } else if ((actual === null || typeof actual !== 'object') &&
               (expected === null || typeof expected !== 'object')) {
      return strict ? actual === expected : actual == expected;
  
    // If both values are instances of typed arrays, wrap their underlying
    // ArrayBuffers in a Buffer each to increase performance
    // This optimization requires the arrays to have the same type as checked by
    // Object.prototype.toString (aka pToString). Never perform binary
    // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their
    // bit patterns are not identical.
    } else if (isView(actual) && isView(expected) &&
               pToString(actual) === pToString(expected) &&
               !(actual instanceof Float32Array ||
                 actual instanceof Float64Array)) {
      return compare(new Uint8Array(actual.buffer),
                     new Uint8Array(expected.buffer)) === 0;
  
    // 7.5 For all other Object pairs, including Array objects, equivalence is
    // determined by having the same number of owned properties (as verified
    // with Object.prototype.hasOwnProperty.call), the same set of keys
    // (although not necessarily the same order), equivalent values for every
    // corresponding key, and an identical 'prototype' property. Note: this
    // accounts for both named and indexed properties on Arrays.
    } else if (isBuffer(actual) !== isBuffer(expected)) {
      return false;
    } else {
      memos = memos || {actual: [], expected: []};
  
      var actualIndex = memos.actual.indexOf(actual);
      if (actualIndex !== -1) {
        if (actualIndex === memos.expected.indexOf(expected)) {
          return true;
        }
      }
  
      memos.actual.push(actual);
      memos.expected.push(expected);
  
      return objEquiv(actual, expected, strict, memos);
    }
  }
  
  function isArguments(object) {
    return Object.prototype.toString.call(object) == '[object Arguments]';
  }
  
  function objEquiv(a, b, strict, actualVisitedObjects) {
    if (a === null || a === undefined || b === null || b === undefined)
      return false;
    // if one is a primitive, the other must be same
    if (util.isPrimitive(a) || util.isPrimitive(b))
      return a === b;
    if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
      return false;
    var aIsArgs = isArguments(a);
    var bIsArgs = isArguments(b);
    if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
      return false;
    if (aIsArgs) {
      a = pSlice.call(a);
      b = pSlice.call(b);
      return _deepEqual(a, b, strict);
    }
    var ka = objectKeys(a);
    var kb = objectKeys(b);
    var key, i;
    // having the same number of owned properties (keys incorporates
    // hasOwnProperty)
    if (ka.length !== kb.length)
      return false;
    //the same set of keys (although not necessarily the same order),
    ka.sort();
    kb.sort();
    //~~~cheap key test
    for (i = ka.length - 1; i >= 0; i--) {
      if (ka[i] !== kb[i])
        return false;
    }
    //equivalent values for every corresponding key, and
    //~~~possibly expensive deep test
    for (i = ka.length - 1; i >= 0; i--) {
      key = ka[i];
      if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects))
        return false;
    }
    return true;
  }
  
  // 8. The non-equivalence assertion tests for any deep inequality.
  // assert.notDeepEqual(actual, expected, message_opt);
  
  assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
    if (_deepEqual(actual, expected, false)) {
      fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
    }
  };
  
  assert.notDeepStrictEqual = notDeepStrictEqual;
  function notDeepStrictEqual(actual, expected, message) {
    if (_deepEqual(actual, expected, true)) {
      fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual);
    }
  }
  
  
  // 9. The strict equality assertion tests strict equality, as determined by ===.
  // assert.strictEqual(actual, expected, message_opt);
  
  assert.strictEqual = function strictEqual(actual, expected, message) {
    if (actual !== expected) {
      fail(actual, expected, message, '===', assert.strictEqual);
    }
  };
  
  // 10. The strict non-equality assertion tests for strict inequality, as
  // determined by !==.  assert.notStrictEqual(actual, expected, message_opt);
  
  assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
    if (actual === expected) {
      fail(actual, expected, message, '!==', assert.notStrictEqual);
    }
  };
  
  function expectedException(actual, expected) {
    if (!actual || !expected) {
      return false;
    }
  
    if (Object.prototype.toString.call(expected) == '[object RegExp]') {
      return expected.test(actual);
    }
  
    try {
      if (actual instanceof expected) {
        return true;
      }
    } catch (e) {
      // Ignore.  The instanceof check doesn't work for arrow functions.
    }
  
    if (Error.isPrototypeOf(expected)) {
      return false;
    }
  
    return expected.call({}, actual) === true;
  }
  
  function _tryBlock(block) {
    var error;
    try {
      block();
    } catch (e) {
      error = e;
    }
    return error;
  }
  
  function _throws(shouldThrow, block, expected, message) {
    var actual;
  
    if (typeof block !== 'function') {
      throw new TypeError('"block" argument must be a function');
    }
  
    if (typeof expected === 'string') {
      message = expected;
      expected = null;
    }
  
    actual = _tryBlock(block);
  
    message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
              (message ? ' ' + message : '.');
  
    if (shouldThrow && !actual) {
      fail(actual, expected, 'Missing expected exception' + message);
    }
  
    var userProvidedMessage = typeof message === 'string';
    var isUnwantedException = !shouldThrow && util.isError(actual);
    var isUnexpectedException = !shouldThrow && actual && !expected;
  
    if ((isUnwantedException &&
        userProvidedMessage &&
        expectedException(actual, expected)) ||
        isUnexpectedException) {
      fail(actual, expected, 'Got unwanted exception' + message);
    }
  
    if ((shouldThrow && actual && expected &&
        !expectedException(actual, expected)) || (!shouldThrow && actual)) {
      throw actual;
    }
  }
  
  // 11. Expected to throw an error:
  // assert.throws(block, Error_opt, message_opt);
  
  assert.throws = function(block, /*optional*/error, /*optional*/message) {
    _throws(true, block, error, message);
  };
  
  // EXTENSION! This is annoying to write outside this module.
  assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
    _throws(false, block, error, message);
  };
  
  assert.ifError = function(err) { if (err) throw err; };
  
  // Expose a strict only variant of assert
  function strict(value, message) {
    if (!value) fail(value, true, message, '==', strict);
  }
  assert.strict = objectAssign(strict, assert, {
    equal: assert.strictEqual,
    deepEqual: assert.deepStrictEqual,
    notEqual: assert.notStrictEqual,
    notDeepEqual: assert.notDeepStrictEqual
  });
  assert.strict.strict = assert.strict;
  
  var objectKeys = Object.keys || function (obj) {
    var keys = [];
    for (var key in obj) {
      if (hasOwn.call(obj, key)) keys.push(key);
    }
    return keys;
  };
  
  }).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
  },{"object-assign":5,"util/":4}],2:[function(require,module,exports){
  if (typeof Object.create === 'function') {
    // implementation from standard node.js 'util' module
    module.exports = function inherits(ctor, superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
    };
  } else {
    // old school shim for old browsers
    module.exports = function inherits(ctor, superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
  
  },{}],3:[function(require,module,exports){
  module.exports = function isBuffer(arg) {
    return arg && typeof arg === 'object'
      && typeof arg.copy === 'function'
      && typeof arg.fill === 'function'
      && typeof arg.readUInt8 === 'function';
  }
  },{}],4:[function(require,module,exports){
  (function (process,global){
  // Copyright Joyent, Inc. and other Node contributors.
  //
  // Permission is hereby granted, free of charge, to any person obtaining a
  // copy of this software and associated documentation files (the
  // "Software"), to deal in the Software without restriction, including
  // without limitation the rights to use, copy, modify, merge, publish,
  // distribute, sublicense, and/or sell copies of the Software, and to permit
  // persons to whom the Software is furnished to do so, subject to the
  // following conditions:
  //
  // The above copyright notice and this permission notice shall be included
  // in all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
  // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
  // USE OR OTHER DEALINGS IN THE SOFTWARE.
  
  var formatRegExp = /%[sdj%]/g;
  exports.format = function(f) {
    if (!isString(f)) {
      var objects = [];
      for (var i = 0; i < arguments.length; i++) {
        objects.push(inspect(arguments[i]));
      }
      return objects.join(' ');
    }
  
    var i = 1;
    var args = arguments;
    var len = args.length;
    var str = String(f).replace(formatRegExp, function(x) {
      if (x === '%%') return '%';
      if (i >= len) return x;
      switch (x) {
        case '%s': return String(args[i++]);
        case '%d': return Number(args[i++]);
        case '%j':
          try {
            return JSON.stringify(args[i++]);
          } catch (_) {
            return '[Circular]';
          }
        default:
          return x;
      }
    });
    for (var x = args[i]; i < len; x = args[++i]) {
      if (isNull(x) || !isObject(x)) {
        str += ' ' + x;
      } else {
        str += ' ' + inspect(x);
      }
    }
    return str;
  };
  
  
  // Mark that a method should not be used.
  // Returns a modified function which warns once by default.
  // If --no-deprecation is set, then it is a no-op.
  exports.deprecate = function(fn, msg) {
    // Allow for deprecating things in the process of starting up.
    if (isUndefined(global.process)) {
      return function() {
        return exports.deprecate(fn, msg).apply(this, arguments);
      };
    }
  
    if (process.noDeprecation === true) {
      return fn;
    }
  
    var warned = false;
    function deprecated() {
      if (!warned) {
        if (process.throwDeprecation) {
          throw new Error(msg);
        } else if (process.traceDeprecation) {
          console.trace(msg);
        } else {
          console.error(msg);
        }
        warned = true;
      }
      return fn.apply(this, arguments);
    }
  
    return deprecated;
  };
  
  
  var debugs = {};
  var debugEnviron;
  exports.debuglog = function(set) {
    if (isUndefined(debugEnviron))
      debugEnviron = process.env.NODE_DEBUG || '';
    set = set.toUpperCase();
    if (!debugs[set]) {
      if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
        var pid = process.pid;
        debugs[set] = function() {
          var msg = exports.format.apply(exports, arguments);
          console.error('%s %d: %s', set, pid, msg);
        };
      } else {
        debugs[set] = function() {};
      }
    }
    return debugs[set];
  };
  
  
  /**
   * Echos the value of a value. Trys to print the value out
   * in the best way possible given the different types.
   *
   * @param {Object} obj The object to print out.
   * @param {Object} opts Optional options object that alters the output.
   */
  /* legacy: obj, showHidden, depth, colors*/
  function inspect(obj, opts) {
    // default options
    var ctx = {
      seen: [],
      stylize: stylizeNoColor
    };
    // legacy...
    if (arguments.length >= 3) ctx.depth = arguments[2];
    if (arguments.length >= 4) ctx.colors = arguments[3];
    if (isBoolean(opts)) {
      // legacy...
      ctx.showHidden = opts;
    } else if (opts) {
      // got an "options" object
      exports._extend(ctx, opts);
    }
    // set default options
    if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
    if (isUndefined(ctx.depth)) ctx.depth = 2;
    if (isUndefined(ctx.colors)) ctx.colors = false;
    if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
    if (ctx.colors) ctx.stylize = stylizeWithColor;
    return formatValue(ctx, obj, ctx.depth);
  }
  exports.inspect = inspect;
  
  
  // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
  inspect.colors = {
    'bold' : [1, 22],
    'italic' : [3, 23],
    'underline' : [4, 24],
    'inverse' : [7, 27],
    'white' : [37, 39],
    'grey' : [90, 39],
    'black' : [30, 39],
    'blue' : [34, 39],
    'cyan' : [36, 39],
    'green' : [32, 39],
    'magenta' : [35, 39],
    'red' : [31, 39],
    'yellow' : [33, 39]
  };
  
  // Don't use 'blue' not visible on cmd.exe
  inspect.styles = {
    'special': 'cyan',
    'number': 'yellow',
    'boolean': 'yellow',
    'undefined': 'grey',
    'null': 'bold',
    'string': 'green',
    'date': 'magenta',
    // "name": intentionally not styling
    'regexp': 'red'
  };
  
  
  function stylizeWithColor(str, styleType) {
    var style = inspect.styles[styleType];
  
    if (style) {
      return '\u001b[' + inspect.colors[style][0] + 'm' + str +
             '\u001b[' + inspect.colors[style][1] + 'm';
    } else {
      return str;
    }
  }
  
  
  function stylizeNoColor(str, styleType) {
    return str;
  }
  
  
  function arrayToHash(array) {
    var hash = {};
  
    array.forEach(function(val, idx) {
      hash[val] = true;
    });
  
    return hash;
  }
  
  
  function formatValue(ctx, value, recurseTimes) {
    // Provide a hook for user-specified inspect functions.
    // Check that value is an object with an inspect function on it
    if (ctx.customInspect &&
        value &&
        isFunction(value.inspect) &&
        // Filter out the util module, it's inspect function is special
        value.inspect !== exports.inspect &&
        // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)) {
      var ret = value.inspect(recurseTimes, ctx);
      if (!isString(ret)) {
        ret = formatValue(ctx, ret, recurseTimes);
      }
      return ret;
    }
  
    // Primitive types cannot have properties
    var primitive = formatPrimitive(ctx, value);
    if (primitive) {
      return primitive;
    }
  
    // Look up the keys of the object.
    var keys = Object.keys(value);
    var visibleKeys = arrayToHash(keys);
  
    if (ctx.showHidden) {
      keys = Object.getOwnPropertyNames(value);
    }
  
    // IE doesn't make error fields non-enumerable
    // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
    if (isError(value)
        && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
      return formatError(value);
    }
  
    // Some type of object without properties can be shortcutted.
    if (keys.length === 0) {
      if (isFunction(value)) {
        var name = value.name ? ': ' + value.name : '';
        return ctx.stylize('[Function' + name + ']', 'special');
      }
      if (isRegExp(value)) {
        return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
      }
      if (isDate(value)) {
        return ctx.stylize(Date.prototype.toString.call(value), 'date');
      }
      if (isError(value)) {
        return formatError(value);
      }
    }
  
    var base = '', array = false, braces = ['{', '}'];
  
    // Make Array say that they are Array
    if (isArray(value)) {
      array = true;
      braces = ['[', ']'];
    }
  
    // Make functions say that they are functions
    if (isFunction(value)) {
      var n = value.name ? ': ' + value.name : '';
      base = ' [Function' + n + ']';
    }
  
    // Make RegExps say that they are RegExps
    if (isRegExp(value)) {
      base = ' ' + RegExp.prototype.toString.call(value);
    }
  
    // Make dates with properties first say the date
    if (isDate(value)) {
      base = ' ' + Date.prototype.toUTCString.call(value);
    }
  
    // Make error with message first say the error
    if (isError(value)) {
      base = ' ' + formatError(value);
    }
  
    if (keys.length === 0 && (!array || value.length == 0)) {
      return braces[0] + base + braces[1];
    }
  
    if (recurseTimes < 0) {
      if (isRegExp(value)) {
        return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
      } else {
        return ctx.stylize('[Object]', 'special');
      }
    }
  
    ctx.seen.push(value);
  
    var output;
    if (array) {
      output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
    } else {
      output = keys.map(function(key) {
        return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
      });
    }
  
    ctx.seen.pop();
  
    return reduceToSingleString(output, base, braces);
  }
  
  
  function formatPrimitive(ctx, value) {
    if (isUndefined(value))
      return ctx.stylize('undefined', 'undefined');
    if (isString(value)) {
      var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                               .replace(/'/g, "\\'")
                                               .replace(/\\"/g, '"') + '\'';
      return ctx.stylize(simple, 'string');
    }
    if (isNumber(value))
      return ctx.stylize('' + value, 'number');
    if (isBoolean(value))
      return ctx.stylize('' + value, 'boolean');
    // For some reason typeof null is "object", so special case here.
    if (isNull(value))
      return ctx.stylize('null', 'null');
  }
  
  
  function formatError(value) {
    return '[' + Error.prototype.toString.call(value) + ']';
  }
  
  
  function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
    var output = [];
    for (var i = 0, l = value.length; i < l; ++i) {
      if (hasOwnProperty(value, String(i))) {
        output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
            String(i), true));
      } else {
        output.push('');
      }
    }
    keys.forEach(function(key) {
      if (!key.match(/^\d+$/)) {
        output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
            key, true));
      }
    });
    return output;
  }
  
  
  function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
    var name, str, desc;
    desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
    if (desc.get) {
      if (desc.set) {
        str = ctx.stylize('[Getter/Setter]', 'special');
      } else {
        str = ctx.stylize('[Getter]', 'special');
      }
    } else {
      if (desc.set) {
        str = ctx.stylize('[Setter]', 'special');
      }
    }
    if (!hasOwnProperty(visibleKeys, key)) {
      name = '[' + key + ']';
    }
    if (!str) {
      if (ctx.seen.indexOf(desc.value) < 0) {
        if (isNull(recurseTimes)) {
          str = formatValue(ctx, desc.value, null);
        } else {
          str = formatValue(ctx, desc.value, recurseTimes - 1);
        }
        if (str.indexOf('\n') > -1) {
          if (array) {
            str = str.split('\n').map(function(line) {
              return '  ' + line;
            }).join('\n').substr(2);
          } else {
            str = '\n' + str.split('\n').map(function(line) {
              return '   ' + line;
            }).join('\n');
          }
        }
      } else {
        str = ctx.stylize('[Circular]', 'special');
      }
    }
    if (isUndefined(name)) {
      if (array && key.match(/^\d+$/)) {
        return str;
      }
      name = JSON.stringify('' + key);
      if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
        name = name.substr(1, name.length - 2);
        name = ctx.stylize(name, 'name');
      } else {
        name = name.replace(/'/g, "\\'")
                   .replace(/\\"/g, '"')
                   .replace(/(^"|"$)/g, "'");
        name = ctx.stylize(name, 'string');
      }
    }
  
    return name + ': ' + str;
  }
  
  
  function reduceToSingleString(output, base, braces) {
    var numLinesEst = 0;
    var length = output.reduce(function(prev, cur) {
      numLinesEst++;
      if (cur.indexOf('\n') >= 0) numLinesEst++;
      return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
    }, 0);
  
    if (length > 60) {
      return braces[0] +
             (base === '' ? '' : base + '\n ') +
             ' ' +
             output.join(',\n  ') +
             ' ' +
             braces[1];
    }
  
    return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
  }
  
  
  // NOTE: These type checking functions intentionally don't use `instanceof`
  // because it is fragile and can be easily faked with `Object.create()`.
  function isArray(ar) {
    return Array.isArray(ar);
  }
  exports.isArray = isArray;
  
  function isBoolean(arg) {
    return typeof arg === 'boolean';
  }
  exports.isBoolean = isBoolean;
  
  function isNull(arg) {
    return arg === null;
  }
  exports.isNull = isNull;
  
  function isNullOrUndefined(arg) {
    return arg == null;
  }
  exports.isNullOrUndefined = isNullOrUndefined;
  
  function isNumber(arg) {
    return typeof arg === 'number';
  }
  exports.isNumber = isNumber;
  
  function isString(arg) {
    return typeof arg === 'string';
  }
  exports.isString = isString;
  
  function isSymbol(arg) {
    return typeof arg === 'symbol';
  }
  exports.isSymbol = isSymbol;
  
  function isUndefined(arg) {
    return arg === void 0;
  }
  exports.isUndefined = isUndefined;
  
  function isRegExp(re) {
    return isObject(re) && objectToString(re) === '[object RegExp]';
  }
  exports.isRegExp = isRegExp;
  
  function isObject(arg) {
    return typeof arg === 'object' && arg !== null;
  }
  exports.isObject = isObject;
  
  function isDate(d) {
    return isObject(d) && objectToString(d) === '[object Date]';
  }
  exports.isDate = isDate;
  
  function isError(e) {
    return isObject(e) &&
        (objectToString(e) === '[object Error]' || e instanceof Error);
  }
  exports.isError = isError;
  
  function isFunction(arg) {
    return typeof arg === 'function';
  }
  exports.isFunction = isFunction;
  
  function isPrimitive(arg) {
    return arg === null ||
           typeof arg === 'boolean' ||
           typeof arg === 'number' ||
           typeof arg === 'string' ||
           typeof arg === 'symbol' ||  // ES6 symbol
           typeof arg === 'undefined';
  }
  exports.isPrimitive = isPrimitive;
  
  exports.isBuffer = require('./support/isBuffer');
  
  function objectToString(o) {
    return Object.prototype.toString.call(o);
  }
  
  
  function pad(n) {
    return n < 10 ? '0' + n.toString(10) : n.toString(10);
  }
  
  
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
                'Oct', 'Nov', 'Dec'];
  
  // 26 Feb 16:19:34
  function timestamp() {
    var d = new Date();
    var time = [pad(d.getHours()),
                pad(d.getMinutes()),
                pad(d.getSeconds())].join(':');
    return [d.getDate(), months[d.getMonth()], time].join(' ');
  }
  
  
  // log is just a thin wrapper to console.log that prepends a timestamp
  exports.log = function() {
    console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
  };
  
  
  /**
   * Inherit the prototype methods from one constructor into another.
   *
   * The Function.prototype.inherits from lang.js rewritten as a standalone
   * function (not on Function.prototype). NOTE: If this file is to be loaded
   * during bootstrapping this function needs to be rewritten using some native
   * functions as prototype setup using normal JavaScript does not work as
   * expected during bootstrapping (see mirror.js in r114903).
   *
   * @param {function} ctor Constructor function which needs to inherit the
   *     prototype.
   * @param {function} superCtor Constructor function to inherit prototype from.
   */
  exports.inherits = require('inherits');
  
  exports._extend = function(origin, add) {
    // Don't do anything if add isn't an object
    if (!add || !isObject(add)) return origin;
  
    var keys = Object.keys(add);
    var i = keys.length;
    while (i--) {
      origin[keys[i]] = add[keys[i]];
    }
    return origin;
  };
  
  function hasOwnProperty(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  }
  
  }).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
  },{"./support/isBuffer":3,"_process":6,"inherits":2}],5:[function(require,module,exports){
  /*
  object-assign
  (c) Sindre Sorhus
  @license MIT
  */
  
  'use strict';
  /* eslint-disable no-unused-vars */
  var getOwnPropertySymbols = Object.getOwnPropertySymbols;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var propIsEnumerable = Object.prototype.propertyIsEnumerable;
  
  function toObject(val) {
    if (val === null || val === undefined) {
      throw new TypeError('Object.assign cannot be called with null or undefined');
    }
  
    return Object(val);
  }
  
  function shouldUseNative() {
    try {
      if (!Object.assign) {
        return false;
      }
  
      // Detect buggy property enumeration order in older V8 versions.
  
      // https://bugs.chromium.org/p/v8/issues/detail?id=4118
      var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
      test1[5] = 'de';
      if (Object.getOwnPropertyNames(test1)[0] === '5') {
        return false;
      }
  
      // https://bugs.chromium.org/p/v8/issues/detail?id=3056
      var test2 = {};
      for (var i = 0; i < 10; i++) {
        test2['_' + String.fromCharCode(i)] = i;
      }
      var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
        return test2[n];
      });
      if (order2.join('') !== '0123456789') {
        return false;
      }
  
      // https://bugs.chromium.org/p/v8/issues/detail?id=3056
      var test3 = {};
      'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
        test3[letter] = letter;
      });
      if (Object.keys(Object.assign({}, test3)).join('') !==
          'abcdefghijklmnopqrst') {
        return false;
      }
  
      return true;
    } catch (err) {
      // We don't expect any of the above to throw, but better to be safe.
      return false;
    }
  }
  
  module.exports = shouldUseNative() ? Object.assign : function (target, source) {
    var from;
    var to = toObject(target);
    var symbols;
  
    for (var s = 1; s < arguments.length; s++) {
      from = Object(arguments[s]);
  
      for (var key in from) {
        if (hasOwnProperty.call(from, key)) {
          to[key] = from[key];
        }
      }
  
      if (getOwnPropertySymbols) {
        symbols = getOwnPropertySymbols(from);
        for (var i = 0; i < symbols.length; i++) {
          if (propIsEnumerable.call(from, symbols[i])) {
            to[symbols[i]] = from[symbols[i]];
          }
        }
      }
    }
  
    return to;
  };
  
  },{}],6:[function(require,module,exports){
  // shim for using process in browser
  var process = module.exports = {};
  
  // cached from whatever global is present so that test runners that stub it
  // don't break things.  But we need to wrap it in a try catch in case it is
  // wrapped in strict mode code which doesn't define any globals.  It's inside a
  // function because try/catches deoptimize in certain engines.
  
  var cachedSetTimeout;
  var cachedClearTimeout;
  
  function defaultSetTimout() {
      throw new Error('setTimeout has not been defined');
  }
  function defaultClearTimeout () {
      throw new Error('clearTimeout has not been defined');
  }
  (function () {
      try {
          if (typeof setTimeout === 'function') {
              cachedSetTimeout = setTimeout;
          } else {
              cachedSetTimeout = defaultSetTimout;
          }
      } catch (e) {
          cachedSetTimeout = defaultSetTimout;
      }
      try {
          if (typeof clearTimeout === 'function') {
              cachedClearTimeout = clearTimeout;
          } else {
              cachedClearTimeout = defaultClearTimeout;
          }
      } catch (e) {
          cachedClearTimeout = defaultClearTimeout;
      }
  } ())
  function runTimeout(fun) {
      if (cachedSetTimeout === setTimeout) {
          //normal enviroments in sane situations
          return setTimeout(fun, 0);
      }
      // if setTimeout wasn't available but was latter defined
      if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
          cachedSetTimeout = setTimeout;
          return setTimeout(fun, 0);
      }
      try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedSetTimeout(fun, 0);
      } catch(e){
          try {
              // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
              return cachedSetTimeout.call(null, fun, 0);
          } catch(e){
              // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
              return cachedSetTimeout.call(this, fun, 0);
          }
      }
  
  
  }
  function runClearTimeout(marker) {
      if (cachedClearTimeout === clearTimeout) {
          //normal enviroments in sane situations
          return clearTimeout(marker);
      }
      // if clearTimeout wasn't available but was latter defined
      if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
          cachedClearTimeout = clearTimeout;
          return clearTimeout(marker);
      }
      try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedClearTimeout(marker);
      } catch (e){
          try {
              // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
              return cachedClearTimeout.call(null, marker);
          } catch (e){
              // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
              // Some versions of I.E. have different rules for clearTimeout vs setTimeout
              return cachedClearTimeout.call(this, marker);
          }
      }
  
  
  
  }
  var queue = [];
  var draining = false;
  var currentQueue;
  var queueIndex = -1;
  
  function cleanUpNextTick() {
      if (!draining || !currentQueue) {
          return;
      }
      draining = false;
      if (currentQueue.length) {
          queue = currentQueue.concat(queue);
      } else {
          queueIndex = -1;
      }
      if (queue.length) {
          drainQueue();
      }
  }
  
  function drainQueue() {
      if (draining) {
          return;
      }
      var timeout = runTimeout(cleanUpNextTick);
      draining = true;
  
      var len = queue.length;
      while(len) {
          currentQueue = queue;
          queue = [];
          while (++queueIndex < len) {
              if (currentQueue) {
                  currentQueue[queueIndex].run();
              }
          }
          queueIndex = -1;
          len = queue.length;
      }
      currentQueue = null;
      draining = false;
      runClearTimeout(timeout);
  }
  
  process.nextTick = function (fun) {
      var args = new Array(arguments.length - 1);
      if (arguments.length > 1) {
          for (var i = 1; i < arguments.length; i++) {
              args[i - 1] = arguments[i];
          }
      }
      queue.push(new Item(fun, args));
      if (queue.length === 1 && !draining) {
          runTimeout(drainQueue);
      }
  };
  
  // v8 likes predictible objects
  function Item(fun, array) {
      this.fun = fun;
      this.array = array;
  }
  Item.prototype.run = function () {
      this.fun.apply(null, this.array);
  };
  process.title = 'browser';
  process.browser = true;
  process.env = {};
  process.argv = [];
  process.version = ''; // empty string to avoid regexp issues
  process.versions = {};
  
  function noop() {}
  
  process.on = noop;
  process.addListener = noop;
  process.once = noop;
  process.off = noop;
  process.removeListener = noop;
  process.removeAllListeners = noop;
  process.emit = noop;
  process.prependListener = noop;
  process.prependOnceListener = noop;
  
  process.listeners = function (name) { return [] }
  
  process.binding = function (name) {
      throw new Error('process.binding is not supported');
  };
  
  process.cwd = function () { return '/' };
  process.chdir = function (dir) {
      throw new Error('process.chdir is not supported');
  };
  process.umask = function() { return 0; };
  
  },{}],7:[function(require,module,exports){
  var esprima = require("esprima");
  var escope = require("escope");
  
  /* eslint-disable guard-for-in */
  'use strict';
  
  var app = (function App() {
    const squareFallback = { x: 0, y: 0, width: 0, height: 0 };
    const defaultCode = {
      value: '',
      rawValue: '',
      codeLines: [],
      codeTokens: [],
      parsed: undefined,
      scopes: undefined,
      bubbles: [],
      valid: true,
    };
    var code;
    var codeEditor;
    var codeDisplayer;
    var scopeBubbles;
  
    return { bootstrap };
  
    /**
     * Initialize the app.
     */
    function bootstrap() {
      code = { ...defaultCode };
      codeEditor = setupCodeEditor(document.getElementById('code-editor'));
      codeDisplayer = document.getElementById('code-displayer');
      scopeBubbles = document.getElementById('scopes');
  
      setEventListeners();
  
      /**
       *
       */
      function setEventListeners() {
        codeEditor.on('change', handleInput);
        var redrawDebounced = debounce(reDraw, 60);
        codeDisplayer.addEventListener('scroll', redrawDebounced, false);
        window.addEventListener('scroll', redrawDebounced, false);
        window.addEventListener('resize', redrawDebounced, false);
  
        function debounce(func, wait, immediate) {
          var debounce;
          return function debounced(...args) {
            var context = this;
            var later = function later() {
              debounce = null;
              if (!immediate) {
                func.apply(context, args);
              }
            };
            var callNow = immediate && !debounce;
            clearTimeout(debounce);
            debounce = setTimeout(later, wait);
            if (callNow) {
              func.apply(context, args);
            }
          };
        }
      }
    }
  
    /**
     *
     */
    function setupCodeEditor(codeEditor) {
      var codeMirror = CodeMirror.fromTextArea(codeEditor, {
        mode: 'application/javascript',
        value: ``,
        lineNumbers: true,
        lineWrapping: true,
        autofocus: true,
        readOnly: false,
        tabSize: 2,
        tabindex: 0,
      });
  
      return codeMirror;
    }
  
    /**
     *
     */
    async function handleInput(event) {
      code = processCode(code, event.getValue());
      await writeCode(code.value);
      updateCodeDisplayer(code);
    }
  
    /**
     *
     */
    function reDraw() {
      updateCodeDisplayer(code);
    }
  
    /**
     *
     */
    function processCode(code, value) {
      var processedCode = { ...code };
      processedCode.rawValue = value;
  
      try {
        processedCode.value = prettier.format(value, {
          parser: 'babel',
          plugins: prettierPlugins,
          useTabs: true,
        });
        // .replace(
        //   /(?<tabs>\t*)(?<other>.*)(?<pre>function *.*\()(?<args>.+)(?<post>\))/g,
        //   '$<tabs>$<other>$<pre>\n$<tabs>\t$<args>\n$<tabs>$<post>',
        // );
        processedCode.valid = true;
      } catch (e) {
        processedCode.value = e.toString();
        processedCode.valid = false;
      }
  
      if (!processedCode.valid) {
        return processedCode;
      }
  
      processedCode = {
        ...processedCode,
        parsed: esprima.parse(processedCode.value, {
          range: true,
          loc: true,
          tokens: true,
        }),
      };
  
      processedCode = processScopes(processedCode);
  
      processedCode = processLines(processedCode);
  
      return processedCode;
    }
  
    function processLines(code) {
      var codeProcessedLines = { ...code };
      var codeLines = [];
      var codeTokens = [];
      {
        let previousChars = 0;
        for (let line of codeProcessedLines.value.split(/(\n)/)) {
          let startChar = previousChars;
  
          for (let token of line.split(/([a-zA-Z0-9]+)/g)) {
            let processedToken = {
              token,
              startChar: previousChars,
              endChar: previousChars + token.length,
            };
            previousChars = processedToken.endChar;
            codeTokens.push(processedToken);
          }
  
          let processedLine = {
            line,
            startChar,
            endChar: previousChars,
          };
  
          codeLines.push(processedLine);
        }
      }
  
      codeLines = codeLines.filter(function filterEmptyLines(processedLine) {
        return processedLine.line !== '\n';
      });
  
      codeTokens = codeTokens.filter(function filterEmptyTokens(processedToken) {
        return processedToken.token.trim();
      });
  
      return { ...codeProcessedLines, codeLines, codeTokens };
    }
  
    /**
     *
     */
    function processScopes(code) {
      var scopes = escope.analyze(code.parsed, { ecmaVersion: 6 });
  
      return {
        ...code,
        scopes: {
          ...scopes,
          scopesNumber: scopes.scopes.length,
          scopesColors: randomColor({
            count: scopes.scopes.length,
            luminosity: 'bright',
            seed: 'JSSCOPEVISUALIZER',
          }),
        },
      };
    }
  
    /**
     *
     */
    function writeCode(code) {
      return new Promise((resolve) => {
        requestAnimationFrame(() => {
          write(code);
          resolve();
        });
      });
    }
  
    /**
     *
     */
    function write(code) {
      codeDisplayer.innerHTML = '';
  
      var codeLines = code.split('\n');
      codeLines.forEach(function customLineWriting(codeLine) {
        var line = document.createElement('div');
        {
          let codeFragments = codeLine.split('\t');
          codeFragments.forEach(function addTabs(codeFragment) {
            if (codeFragment == '') {
              var tab = document.createElement('span');
              tab.classList.add('tab');
              line.appendChild(tab);
            }
          });
        }
        codeLine
          .split(/([a-zA-Z0-9]+)/g)
          .filter(function filterEmptyTokens(token) {
            return token;
          })
          .forEach(function tokenizeLine(token) {
            if (!token) {
              return;
            }
  
            var word = document.createElement('span');
            word.textContent = token;
  
            // if (
            //   !jsKeywords.find(function findKeyword(keyword) {
            //     return keyword == token;
            //   }) &&
            //   token.match(/([a-zA-Z0-9]+)/g)
            // ) {
            //   word.classList.add('variable');
            // }
  
            line.appendChild(word);
          });
        line.classList.add('line');
        codeDisplayer.appendChild(line);
      });
    }
  
    /**
     *
     */
    async function updateCodeDisplayer(code) {
      await clearVisualization();
  
      if (code.valid && code.value) {
        code = setBubbles(code);
        drawBubbles(code);
      }
    }
  
    /**
     *
     */
    function setBubbles({ scopes, codeLines, codeTokens, ...rest }) {
      var codeLineElements = [...codeDisplayer.getElementsByClassName('line')];
      var codeTokenElements = [];
      [...codeLineElements].forEach((codeLineElement) => {
        codeTokenElements.push(...codeLineElement.querySelectorAll('span'));
      });
      codeTokenElements = codeTokenElements.filter(
        function filterEmptyTokenElements(tokenElement) {
          return tokenElement.textContent.trim();
        },
      );
  
      console.log(codeLines);
      console.log(codeTokens);
      console.log(codeLineElements);
      console.log(codeTokenElements);
  
      console.log(scopes);
  
      var bubbles = [];
      var preparedOuterScopeVariables = [];
      for (let [
        index,
        {
          block: {
            range: [scopeRangeStart, scopeRangeEnd],
          },
          through: outerScopeVariables,
        },
      ] of scopes.scopes.entries()) {
        let scopeColor = scopes.scopesColors[index];
  
        // Identify outer scope variables.
        for (let reference of outerScopeVariables) {
          let { identifier } = reference;
          let {
            identifier: { name, range: [startChar, endChar] = [0, 0] },
          } = reference;
          preparedOuterScopeVariables.push({
            name,
            startChar,
            endChar,
            color: undefined,
            identifier,
          });
        }
  
        let scopeBubbleLines = [];
        let hasFinished = false;
        let removeFirstLine = false;
        let removeLastLine = false;
        for (let i = 0; i < codeLines.length && !hasFinished; i++) {
          if (
            codeLines[i].startChar >= scopeRangeStart &&
            codeLines[i].endChar <= scopeRangeEnd
          ) {
            scopeBubbleLines.push(codeLineElements[i]);
  
            if (codeLines[i].startChar == scopeRangeStart) {
              removeFirstLine = true;
            }
  
            if (codeLines[i].endChar == scopeRangeEnd) {
              removeLastLine = true;
            }
  
            if (codeLines[i].endChar >= scopeRangeEnd) {
              hasFinished = true;
            }
          }
        }
  
        scopeBubbleLines =
          scopeBubbleLines.slice(
            removeFirstLine ? 1 : 0,
            removeLastLine ? -1 : undefined,
          ) || [];
  
        bubbles.push({
          lines: scopeBubbleLines,
          color: scopeColor,
        });
      }
  
      var scopeBubbleVariables = [];
      for (let j = 0; j < codeTokens.length; j++) {
        if (
          jsKeywords.find(function findKeyword(keyword) {
            return keyword == codeTokens[j].token;
          }) ||
          !codeTokens[j].token.match(/([a-zA-Z0-9]+)/g)
        ) {
          continue;
        }
  
        let foundOuterScopeVariable = preparedOuterScopeVariables.find(
          (preparedOuterScopeVariable) => {
            return (
              preparedOuterScopeVariable.startChar == codeTokens[j].startChar &&
              preparedOuterScopeVariable.endChar == codeTokens[j].endChar
            );
          },
        );
  
        if (!foundOuterScopeVariable) {
          continue;
        }
  
        scopeBubbleVariables.push({
          ...foundOuterScopeVariable,
          tokenElement: codeTokenElements[j],
        });
      }
  
      for (let [index, scope] of scopes.scopes.entries()) {
        for (let {
          identifiers: [identifier],
        } of scope.variables) {
          if (!identifier) {
            continue;
          }
  
          let scopeBubbleVariable = scopeBubbleVariables.find(
            function matchReference(scopeBubbleVariable) {
              return scopeBubbleVariable.identifier == identifier;
            },
          );
  
          if (!scopeBubbleVariable) {
            continue;
          }
  
          scopeBubbleVariable.color = scopes.scopesColors[index];
        }
  
        // for (let {
        //   identifiers: [identifier],
        // } of scope.variables) {
        //   if (!identifier) {
        //     continue;
        //   }
  
        //   let scopeBubbleVariable = scopeBubbleVariables.find(
        //     function matchReference(scopeBubbleVariable) {
        //       return scopeBubbleVariable.identifier == identifier;
        //     },
        //   );
  
        //   if (!scopeBubbleVariable) {
        //     continue;
        //   }
  
        //   scopeBubbleVariable.color = scopes.scopesColors[index];
        // }
      }
  
      return {
        scopes,
        codeLines,
        codeTokens,
        ...rest,
        bubbles: { scopeBubbles: [...bubbles], scopeBubbleVariables },
      };
    }
  
    /**
     *
     */
    function drawBubbles({
      bubbles: {
        scopeBubbles: [{ lines, color }, ...bubbles],
        scopeBubbleVariables,
      },
    }) {
      var {
        x: minX,
        y: minVisibleY,
        height: minVisibleHeight,
      } = codeDisplayer.getBoundingClientRect();
  
      // GLOBAL BUBBLE.
      var { x, y, width, height } = lines[0].getBoundingClientRect();
      drawBubble({ x, y, width, height: height }, color, true);
  
      // SCOPE BUBBLES.
      for (let { lines, color } of bubbles) {
        let {
          y: lineY,
          width: lineWidth,
          height: lineHeight,
        } = lines[0].getBoundingClientRect();
  
        if (
          lineY < minVisibleY ||
          lineY + lineHeight > minVisibleY + minVisibleHeight
        ) {
          continue;
        }
  
        var visibleLines = [...lines];
  
        while (
          lineY + lineHeight * (visibleLines.length + 1) >
          minVisibleY + minVisibleHeight
        ) {
          visibleLines.pop();
        }
  
        let tabsWidth = 0;
        let { x: lineX } = [...lines[0].querySelectorAll('span')]
          .filter(function filterEmptyTokens(token) {
            return token.textContent;
          })[0]
          .getBoundingClientRect();
  
        for (let token of [...lines[0].querySelectorAll('span.tab')]) {
          console.log(token);
  
          let { width: tabWidth } = token.getBoundingClientRect();
  
          tabsWidth += tabWidth;
        }
  
        let bubbleX = Math.max(lineX, minX);
  
        drawBubble(
          {
            x: bubbleX,
            y: lineY,
            width: bubbleX == lineX ? lineWidth - tabsWidth - 6 : width,
            height: lineHeight * visibleLines.length,
          },
          color,
          false,
        );
      }
  
      // VARIABLE BUBBLES.
  
      for (let { tokenElement, color } of scopeBubbleVariables) {
        let {
          x: tokenX,
          y: tokenY,
          width: tokenWidth,
          height: tokenHeight,
        } = tokenElement.getBoundingClientRect();
  
        if (
          tokenY < minVisibleY ||
          tokenY + tokenHeight > minVisibleY + minVisibleHeight
        ) {
          continue;
        }
  
        drawBubble(
          {
            x: Math.max(tokenX, minX),
            y: tokenY,
            width: tokenWidth,
            height: tokenHeight,
          },
          color,
          false,
        );
      }
    }
  
    /**
     *
     */
    function drawBubble(
      {
        x: bubbleX = 0,
        y: bubbleY = 0,
        width: bubbleWidth = 0,
        height: bubbleHeight = 0,
      } = squareFallback,
      color = code.scopes.scopesColors[0],
      isGlobal = false,
    ) {
      var bubble = document.createElement('div');
      bubble.classList.add(
        isGlobal ? 'scopes__bubble--global' : 'scopes__bubble',
      );
      bubble.style = `
                      background-color: ${color};
                      width: ${bubbleWidth}px;
                      height: ${bubbleHeight}px;
                      top: ${bubbleY}px;
                      left: ${bubbleX}px;
                      `;
      scopeBubbles.appendChild(bubble);
    }
  
    /**
     *
     */
    function clearVisualization() {
      return new Promise((resolve) => {
        requestAnimationFrame(() => {
          scopeBubbles.innerHTML = '';
          resolve();
        });
      });
    }
  })();
  
  app.bootstrap();
  
  },{"escope":78,"esprima":88}],8:[function(require,module,exports){
  "use strict";
  
  var isValue             = require("type/value/is")
    , ensureValue         = require("type/value/ensure")
    , ensurePlainFunction = require("type/plain-function/ensure")
    , copy                = require("es5-ext/object/copy")
    , normalizeOptions    = require("es5-ext/object/normalize-options")
    , map                 = require("es5-ext/object/map");
  
  var bind = Function.prototype.bind
    , defineProperty = Object.defineProperty
    , hasOwnProperty = Object.prototype.hasOwnProperty
    , define;
  
  define = function (name, desc, options) {
    var value = ensureValue(desc) && ensurePlainFunction(desc.value), dgs;
    dgs = copy(desc);
    delete dgs.writable;
    delete dgs.value;
    dgs.get = function () {
      if (!options.overwriteDefinition && hasOwnProperty.call(this, name)) return value;
      desc.value = bind.call(value, options.resolveContext ? options.resolveContext(this) : this);
      defineProperty(this, name, desc);
      return this[name];
    };
    return dgs;
  };
  
  module.exports = function (props/*, options*/) {
    var options = normalizeOptions(arguments[1]);
    if (isValue(options.resolveContext)) ensurePlainFunction(options.resolveContext);
    return map(props, function (desc, name) { return define(name, desc, options); });
  };
  
  },{"es5-ext/object/copy":30,"es5-ext/object/map":38,"es5-ext/object/normalize-options":39,"type/plain-function/ensure":102,"type/value/ensure":106,"type/value/is":107}],9:[function(require,module,exports){
  "use strict";
  
  var isValue         = require("type/value/is")
    , isPlainFunction = require("type/plain-function/is")
    , assign          = require("es5-ext/object/assign")
    , normalizeOpts   = require("es5-ext/object/normalize-options")
    , contains        = require("es5-ext/string/#/contains");
  
  var d = (module.exports = function (dscr, value/*, options*/) {
    var c, e, w, options, desc;
    if (arguments.length < 2 || typeof dscr !== "string") {
      options = value;
      value = dscr;
      dscr = null;
    } else {
      options = arguments[2];
    }
    if (isValue(dscr)) {
      c = contains.call(dscr, "c");
      e = contains.call(dscr, "e");
      w = contains.call(dscr, "w");
    } else {
      c = w = true;
      e = false;
    }
  
    desc = { value: value, configurable: c, enumerable: e, writable: w };
    return !options ? desc : assign(normalizeOpts(options), desc);
  });
  
  d.gs = function (dscr, get, set/*, options*/) {
    var c, e, options, desc;
    if (typeof dscr !== "string") {
      options = set;
      set = get;
      get = dscr;
      dscr = null;
    } else {
      options = arguments[3];
    }
    if (!isValue(get)) {
      get = undefined;
    } else if (!isPlainFunction(get)) {
      options = get;
      get = set = undefined;
    } else if (!isValue(set)) {
      set = undefined;
    } else if (!isPlainFunction(set)) {
      options = set;
      set = undefined;
    }
    if (isValue(dscr)) {
      c = contains.call(dscr, "c");
      e = contains.call(dscr, "e");
    } else {
      c = true;
      e = false;
    }
  
    desc = { get: get, set: set, configurable: c, enumerable: e };
    return !options ? desc : assign(normalizeOpts(options), desc);
  };
  
  },{"es5-ext/object/assign":27,"es5-ext/object/normalize-options":39,"es5-ext/string/#/contains":47,"type/plain-function/is":103,"type/value/is":107}],10:[function(require,module,exports){
  // Inspired by Google Closure:
  // http://closure-library.googlecode.com/svn/docs/
  // closure_goog_array_array.js.html#goog.array.clear
  
  "use strict";
  
  var value = require("../../object/valid-value");
  
  module.exports = function () {
    value(this).length = 0;
    return this;
  };
  
  },{"../../object/valid-value":46}],11:[function(require,module,exports){
  "use strict";
  
  var numberIsNaN       = require("../../number/is-nan")
    , toPosInt          = require("../../number/to-pos-integer")
    , value             = require("../../object/valid-value")
    , indexOf           = Array.prototype.indexOf
    , objHasOwnProperty = Object.prototype.hasOwnProperty
    , abs               = Math.abs
    , floor             = Math.floor;
  
  module.exports = function (searchElement/*, fromIndex*/) {
    var i, length, fromIndex, val;
    if (!numberIsNaN(searchElement)) return indexOf.apply(this, arguments);
  
    length = toPosInt(value(this).length);
    fromIndex = arguments[1];
    if (isNaN(fromIndex)) fromIndex = 0;
    else if (fromIndex >= 0) fromIndex = floor(fromIndex);
    else fromIndex = toPosInt(this.length) - floor(abs(fromIndex));
  
    for (i = fromIndex; i < length; ++i) {
      if (objHasOwnProperty.call(this, i)) {
        val = this[i];
        if (numberIsNaN(val)) return i; // Jslint: ignore
      }
    }
    return -1;
  };
  
  },{"../../number/is-nan":21,"../../number/to-pos-integer":25,"../../object/valid-value":46}],12:[function(require,module,exports){
  "use strict";
  
  module.exports = require("./is-implemented")() ? Array.from : require("./shim");
  
  },{"./is-implemented":13,"./shim":14}],13:[function(require,module,exports){
  "use strict";
  
  module.exports = function () {
    var from = Array.from, arr, result;
    if (typeof from !== "function") return false;
    arr = ["raz", "dwa"];
    result = from(arr);
    return Boolean(result && result !== arr && result[1] === "dwa");
  };
  
  },{}],14:[function(require,module,exports){
  "use strict";
  
  var iteratorSymbol = require("es6-symbol").iterator
    , isArguments    = require("../../function/is-arguments")
    , isFunction     = require("../../function/is-function")
    , toPosInt       = require("../../number/to-pos-integer")
    , callable       = require("../../object/valid-callable")
    , validValue     = require("../../object/valid-value")
    , isValue        = require("../../object/is-value")
    , isString       = require("../../string/is-string")
    , isArray        = Array.isArray
    , call           = Function.prototype.call
    , desc           = { configurable: true, enumerable: true, writable: true, value: null }
    , defineProperty = Object.defineProperty;
  
  // eslint-disable-next-line complexity, max-lines-per-function
  module.exports = function (arrayLike/*, mapFn, thisArg*/) {
    var mapFn = arguments[1]
      , thisArg = arguments[2]
      , Context
      , i
      , j
      , arr
      , length
      , code
      , iterator
      , result
      , getIterator
      , value;
  
    arrayLike = Object(validValue(arrayLike));
  
    if (isValue(mapFn)) callable(mapFn);
    if (!this || this === Array || !isFunction(this)) {
      // Result: Plain array
      if (!mapFn) {
        if (isArguments(arrayLike)) {
          // Source: Arguments
          length = arrayLike.length;
          if (length !== 1) return Array.apply(null, arrayLike);
          arr = new Array(1);
          arr[0] = arrayLike[0];
          return arr;
        }
        if (isArray(arrayLike)) {
          // Source: Array
          arr = new Array((length = arrayLike.length));
          for (i = 0; i < length; ++i) arr[i] = arrayLike[i];
          return arr;
        }
      }
      arr = [];
    } else {
      // Result: Non plain array
      Context = this;
    }
  
    if (!isArray(arrayLike)) {
      if ((getIterator = arrayLike[iteratorSymbol]) !== undefined) {
        // Source: Iterator
        iterator = callable(getIterator).call(arrayLike);
        if (Context) arr = new Context();
        result = iterator.next();
        i = 0;
        while (!result.done) {
          value = mapFn ? call.call(mapFn, thisArg, result.value, i) : result.value;
          if (Context) {
            desc.value = value;
            defineProperty(arr, i, desc);
          } else {
            arr[i] = value;
          }
          result = iterator.next();
          ++i;
        }
        length = i;
      } else if (isString(arrayLike)) {
        // Source: String
        length = arrayLike.length;
        if (Context) arr = new Context();
        for (i = 0, j = 0; i < length; ++i) {
          value = arrayLike[i];
          if (i + 1 < length) {
            code = value.charCodeAt(0);
            // eslint-disable-next-line max-depth
            if (code >= 0xd800 && code <= 0xdbff) value += arrayLike[++i];
          }
          value = mapFn ? call.call(mapFn, thisArg, value, j) : value;
          if (Context) {
            desc.value = value;
            defineProperty(arr, j, desc);
          } else {
            arr[j] = value;
          }
          ++j;
        }
        length = j;
      }
    }
    if (length === undefined) {
      // Source: array or array-like
      length = toPosInt(arrayLike.length);
      if (Context) arr = new Context(length);
      for (i = 0; i < length; ++i) {
        value = mapFn ? call.call(mapFn, thisArg, arrayLike[i], i) : arrayLike[i];
        if (Context) {
          desc.value = value;
          defineProperty(arr, i, desc);
        } else {
          arr[i] = value;
        }
      }
    }
    if (Context) {
      desc.value = null;
      arr.length = length;
    }
    return arr;
  };
  
  },{"../../function/is-arguments":15,"../../function/is-function":16,"../../number/to-pos-integer":25,"../../object/is-value":34,"../../object/valid-callable":44,"../../object/valid-value":46,"../../string/is-string":50,"es6-symbol":65}],15:[function(require,module,exports){
  "use strict";
  
  var objToString = Object.prototype.toString
    , id = objToString.call((function () { return arguments; })());
  
  module.exports = function (value) { return objToString.call(value) === id; };
  
  },{}],16:[function(require,module,exports){
  "use strict";
  
  var objToString = Object.prototype.toString
    , isFunctionStringTag = RegExp.prototype.test.bind(/^[object [A-Za-z0-9]*Function]$/);
  
  module.exports = function (value) {
    return typeof value === "function" && isFunctionStringTag(objToString.call(value));
  };
  
  },{}],17:[function(require,module,exports){
  "use strict";
  
  // eslint-disable-next-line no-empty-function
  module.exports = function () {};
  
  },{}],18:[function(require,module,exports){
  "use strict";
  
  module.exports = require("./is-implemented")() ? Math.sign : require("./shim");
  
  },{"./is-implemented":19,"./shim":20}],19:[function(require,module,exports){
  "use strict";
  
  module.exports = function () {
    var sign = Math.sign;
    if (typeof sign !== "function") return false;
    return sign(10) === 1 && sign(-20) === -1;
  };
  
  },{}],20:[function(require,module,exports){
  "use strict";
  
  module.exports = function (value) {
    value = Number(value);
    if (isNaN(value) || value === 0) return value;
    return value > 0 ? 1 : -1;
  };
  
  },{}],21:[function(require,module,exports){
  "use strict";
  
  module.exports = require("./is-implemented")() ? Number.isNaN : require("./shim");
  
  },{"./is-implemented":22,"./shim":23}],22:[function(require,module,exports){
  "use strict";
  
  module.exports = function () {
    var numberIsNaN = Number.isNaN;
    if (typeof numberIsNaN !== "function") return false;
    return !numberIsNaN({}) && numberIsNaN(NaN) && !numberIsNaN(34);
  };
  
  },{}],23:[function(require,module,exports){
  "use strict";
  
  module.exports = function (value) {
    // eslint-disable-next-line no-self-compare
    return value !== value;
  };
  
  },{}],24:[function(require,module,exports){
  "use strict";
  
  var sign  = require("../math/sign")
    , abs   = Math.abs
    , floor = Math.floor;
  
  module.exports = function (value) {
    if (isNaN(value)) return 0;
    value = Number(value);
    if (value === 0 || !isFinite(value)) return value;
    return sign(value) * floor(abs(value));
  };
  
  },{"../math/sign":18}],25:[function(require,module,exports){
  "use strict";
  
  var toInteger = require("./to-integer")
    , max       = Math.max;
  
  module.exports = function (value) { return max(0, toInteger(value)); };
  
  },{"./to-integer":24}],26:[function(require,module,exports){
  // Internal method, used by iteration functions.
  // Calls a function for each key-value pair found in object
  // Optionally takes compareFn to iterate object in specific order
  
  "use strict";
  
  var callable                = require("./valid-callable")
    , value                   = require("./valid-value")
    , bind                    = Function.prototype.bind
    , call                    = Function.prototype.call
    , keys                    = Object.keys
    , objPropertyIsEnumerable = Object.prototype.propertyIsEnumerable;
  
  module.exports = function (method, defVal) {
    return function (obj, cb/*, thisArg, compareFn*/) {
      var list, thisArg = arguments[2], compareFn = arguments[3];
      obj = Object(value(obj));
      callable(cb);
  
      list = keys(obj);
      if (compareFn) {
        list.sort(typeof compareFn === "function" ? bind.call(compareFn, obj) : undefined);
      }
      if (typeof method !== "function") method = list[method];
      return call.call(method, list, function (key, index) {
        if (!objPropertyIsEnumerable.call(obj, key)) return defVal;
        return call.call(cb, thisArg, obj[key], key, obj, index);
      });
    };
  };
  
  },{"./valid-callable":44,"./valid-value":46}],27:[function(require,module,exports){
  "use strict";
  
  module.exports = require("./is-implemented")() ? Object.assign : require("./shim");
  
  },{"./is-implemented":28,"./shim":29}],28:[function(require,module,exports){
  "use strict";
  
  module.exports = function () {
    var assign = Object.assign, obj;
    if (typeof assign !== "function") return false;
    obj = { foo: "raz" };
    assign(obj, { bar: "dwa" }, { trzy: "trzy" });
    return obj.foo + obj.bar + obj.trzy === "razdwatrzy";
  };
  
  },{}],29:[function(require,module,exports){
  "use strict";
  
  var keys  = require("../keys")
    , value = require("../valid-value")
    , max   = Math.max;
  
  module.exports = function (dest, src/*, …srcn*/) {
    var error, i, length = max(arguments.length, 2), assign;
    dest = Object(value(dest));
    assign = function (key) {
      try {
        dest[key] = src[key];
      } catch (e) {
        if (!error) error = e;
      }
    };
    for (i = 1; i < length; ++i) {
      src = arguments[i];
      keys(src).forEach(assign);
    }
    if (error !== undefined) throw error;
    return dest;
  };
  
  },{"../keys":35,"../valid-value":46}],30:[function(require,module,exports){
  "use strict";
  
  var aFrom  = require("../array/from")
    , assign = require("./assign")
    , value  = require("./valid-value");
  
  module.exports = function (obj/*, propertyNames, options*/) {
    var copy = Object(value(obj)), propertyNames = arguments[1], options = Object(arguments[2]);
    if (copy !== obj && !propertyNames) return copy;
    var result = {};
    if (propertyNames) {
      aFrom(propertyNames, function (propertyName) {
        if (options.ensure || propertyName in obj) result[propertyName] = obj[propertyName];
      });
    } else {
      assign(result, obj);
    }
    return result;
  };
  
  },{"../array/from":12,"./assign":27,"./valid-value":46}],31:[function(require,module,exports){
  // Workaround for http://code.google.com/p/v8/issues/detail?id=2804
  
  "use strict";
  
  var create = Object.create, shim;
  
  if (!require("./set-prototype-of/is-implemented")()) {
    shim = require("./set-prototype-of/shim");
  }
  
  module.exports = (function () {
    var nullObject, polyProps, desc;
    if (!shim) return create;
    if (shim.level !== 1) return create;
  
    nullObject = {};
    polyProps = {};
    desc = { configurable: false, enumerable: false, writable: true, value: undefined };
    Object.getOwnPropertyNames(Object.prototype).forEach(function (name) {
      if (name === "__proto__") {
        polyProps[name] = {
          configurable: true,
          enumerable: false,
          writable: true,
          value: undefined
        };
        return;
      }
      polyProps[name] = desc;
    });
    Object.defineProperties(nullObject, polyProps);
  
    Object.defineProperty(shim, "nullPolyfill", {
      configurable: false,
      enumerable: false,
      writable: false,
      value: nullObject
    });
  
    return function (prototype, props) {
      return create(prototype === null ? nullObject : prototype, props);
    };
  })();
  
  },{"./set-prototype-of/is-implemented":42,"./set-prototype-of/shim":43}],32:[function(require,module,exports){
  "use strict";
  
  module.exports = require("./_iterate")("forEach");
  
  },{"./_iterate":26}],33:[function(require,module,exports){
  "use strict";
  
  var isValue = require("./is-value");
  
  var map = { function: true, object: true };
  
  module.exports = function (value) { return (isValue(value) && map[typeof value]) || false; };
  
  },{"./is-value":34}],34:[function(require,module,exports){
  "use strict";
  
  var _undefined = require("../function/noop")(); // Support ES3 engines
  
  module.exports = function (val) { return val !== _undefined && val !== null; };
  
  },{"../function/noop":17}],35:[function(require,module,exports){
  "use strict";
  
  module.exports = require("./is-implemented")() ? Object.keys : require("./shim");
  
  },{"./is-implemented":36,"./shim":37}],36:[function(require,module,exports){
  "use strict";
  
  module.exports = function () {
    try {
      Object.keys("primitive");
      return true;
    } catch (e) {
      return false;
    }
  };
  
  },{}],37:[function(require,module,exports){
  "use strict";
  
  var isValue = require("../is-value");
  
  var keys = Object.keys;
  
  module.exports = function (object) { return keys(isValue(object) ? Object(object) : object); };
  
  },{"../is-value":34}],38:[function(require,module,exports){
  "use strict";
  
  var callable = require("./valid-callable")
    , forEach  = require("./for-each")
    , call     = Function.prototype.call;
  
  module.exports = function (obj, cb/*, thisArg*/) {
    var result = {}, thisArg = arguments[2];
    callable(cb);
    forEach(obj, function (value, key, targetObj, index) {
      result[key] = call.call(cb, thisArg, value, key, targetObj, index);
    });
    return result;
  };
  
  },{"./for-each":32,"./valid-callable":44}],39:[function(require,module,exports){
  "use strict";
  
  var isValue = require("./is-value");
  
  var forEach = Array.prototype.forEach, create = Object.create;
  
  var process = function (src, obj) {
    var key;
    for (key in src) obj[key] = src[key];
  };
  
  // eslint-disable-next-line no-unused-vars
  module.exports = function (opts1/*, …options*/) {
    var result = create(null);
    forEach.call(arguments, function (options) {
      if (!isValue(options)) return;
      process(Object(options), result);
    });
    return result;
  };
  
  },{"./is-value":34}],40:[function(require,module,exports){
  "use strict";
  
  var forEach = Array.prototype.forEach, create = Object.create;
  
  // eslint-disable-next-line no-unused-vars
  module.exports = function (arg/*, …args*/) {
    var set = create(null);
    forEach.call(arguments, function (name) { set[name] = true; });
    return set;
  };
  
  },{}],41:[function(require,module,exports){
  "use strict";
  
  module.exports = require("./is-implemented")() ? Object.setPrototypeOf : require("./shim");
  
  },{"./is-implemented":42,"./shim":43}],42:[function(require,module,exports){
  "use strict";
  
  var create = Object.create, getPrototypeOf = Object.getPrototypeOf, plainObject = {};
  
  module.exports = function (/* CustomCreate*/) {
    var setPrototypeOf = Object.setPrototypeOf, customCreate = arguments[0] || create;
    if (typeof setPrototypeOf !== "function") return false;
    return getPrototypeOf(setPrototypeOf(customCreate(null), plainObject)) === plainObject;
  };
  
  },{}],43:[function(require,module,exports){
  /* eslint no-proto: "off" */
  
  // Big thanks to @WebReflection for sorting this out
  // https://gist.github.com/WebReflection/5593554
  
  "use strict";
  
  var isObject         = require("../is-object")
    , value            = require("../valid-value")
    , objIsPrototypeOf = Object.prototype.isPrototypeOf
    , defineProperty   = Object.defineProperty
    , nullDesc         = { configurable: true, enumerable: false, writable: true, value: undefined }
    , validate;
  
  validate = function (obj, prototype) {
    value(obj);
    if (prototype === null || isObject(prototype)) return obj;
    throw new TypeError("Prototype must be null or an object");
  };
  
  module.exports = (function (status) {
    var fn, set;
    if (!status) return null;
    if (status.level === 2) {
      if (status.set) {
        set = status.set;
        fn = function (obj, prototype) {
          set.call(validate(obj, prototype), prototype);
          return obj;
        };
      } else {
        fn = function (obj, prototype) {
          validate(obj, prototype).__proto__ = prototype;
          return obj;
        };
      }
    } else {
      fn = function self(obj, prototype) {
        var isNullBase;
        validate(obj, prototype);
        isNullBase = objIsPrototypeOf.call(self.nullPolyfill, obj);
        if (isNullBase) delete self.nullPolyfill.__proto__;
        if (prototype === null) prototype = self.nullPolyfill;
        obj.__proto__ = prototype;
        if (isNullBase) defineProperty(self.nullPolyfill, "__proto__", nullDesc);
        return obj;
      };
    }
    return Object.defineProperty(fn, "level", {
      configurable: false,
      enumerable: false,
      writable: false,
      value: status.level
    });
  })(
    (function () {
      var tmpObj1 = Object.create(null)
        , tmpObj2 = {}
        , set
        , desc = Object.getOwnPropertyDescriptor(Object.prototype, "__proto__");
  
      if (desc) {
        try {
          set = desc.set; // Opera crashes at this point
          set.call(tmpObj1, tmpObj2);
        } catch (ignore) {}
        if (Object.getPrototypeOf(tmpObj1) === tmpObj2) return { set: set, level: 2 };
      }
  
      tmpObj1.__proto__ = tmpObj2;
      if (Object.getPrototypeOf(tmpObj1) === tmpObj2) return { level: 2 };
  
      tmpObj1 = {};
      tmpObj1.__proto__ = tmpObj2;
      if (Object.getPrototypeOf(tmpObj1) === tmpObj2) return { level: 1 };
  
      return false;
    })()
  );
  
  require("../create");
  
  },{"../create":31,"../is-object":33,"../valid-value":46}],44:[function(require,module,exports){
  "use strict";
  
  module.exports = function (fn) {
    if (typeof fn !== "function") throw new TypeError(fn + " is not a function");
    return fn;
  };
  
  },{}],45:[function(require,module,exports){
  "use strict";
  
  var isObject = require("./is-object");
  
  module.exports = function (value) {
    if (!isObject(value)) throw new TypeError(value + " is not an Object");
    return value;
  };
  
  },{"./is-object":33}],46:[function(require,module,exports){
  "use strict";
  
  var isValue = require("./is-value");
  
  module.exports = function (value) {
    if (!isValue(value)) throw new TypeError("Cannot use null or undefined");
    return value;
  };
  
  },{"./is-value":34}],47:[function(require,module,exports){
  "use strict";
  
  module.exports = require("./is-implemented")() ? String.prototype.contains : require("./shim");
  
  },{"./is-implemented":48,"./shim":49}],48:[function(require,module,exports){
  "use strict";
  
  var str = "razdwatrzy";
  
  module.exports = function () {
    if (typeof str.contains !== "function") return false;
    return str.contains("dwa") === true && str.contains("foo") === false;
  };
  
  },{}],49:[function(require,module,exports){
  "use strict";
  
  var indexOf = String.prototype.indexOf;
  
  module.exports = function (searchString/*, position*/) {
    return indexOf.call(this, searchString, arguments[1]) > -1;
  };
  
  },{}],50:[function(require,module,exports){
  "use strict";
  
  var objToString = Object.prototype.toString, id = objToString.call("");
  
  module.exports = function (value) {
    return (
      typeof value === "string" ||
      (value &&
        typeof value === "object" &&
        (value instanceof String || objToString.call(value) === id)) ||
      false
    );
  };
  
  },{}],51:[function(require,module,exports){
  "use strict";
  
  var generated = Object.create(null), random = Math.random;
  
  module.exports = function () {
    var str;
    do {
      str = random().toString(36).slice(2);
    } while (generated[str]);
    return str;
  };
  
  },{}],52:[function(require,module,exports){
  "use strict";
  
  var setPrototypeOf = require("es5-ext/object/set-prototype-of")
    , contains       = require("es5-ext/string/#/contains")
    , d              = require("d")
    , Symbol         = require("es6-symbol")
    , Iterator       = require("./");
  
  var defineProperty = Object.defineProperty, ArrayIterator;
  
  ArrayIterator = module.exports = function (arr, kind) {
    if (!(this instanceof ArrayIterator)) throw new TypeError("Constructor requires 'new'");
    Iterator.call(this, arr);
    if (!kind) kind = "value";
    else if (contains.call(kind, "key+value")) kind = "key+value";
    else if (contains.call(kind, "key")) kind = "key";
    else kind = "value";
    defineProperty(this, "__kind__", d("", kind));
  };
  if (setPrototypeOf) setPrototypeOf(ArrayIterator, Iterator);
  
  // Internal %ArrayIteratorPrototype% doesn't expose its constructor
  delete ArrayIterator.prototype.constructor;
  
  ArrayIterator.prototype = Object.create(Iterator.prototype, {
    _resolve: d(function (i) {
      if (this.__kind__ === "value") return this.__list__[i];
      if (this.__kind__ === "key+value") return [i, this.__list__[i]];
      return i;
    })
  });
  defineProperty(ArrayIterator.prototype, Symbol.toStringTag, d("c", "Array Iterator"));
  
  },{"./":55,"d":9,"es5-ext/object/set-prototype-of":41,"es5-ext/string/#/contains":47,"es6-symbol":65}],53:[function(require,module,exports){
  "use strict";
  
  var isArguments = require("es5-ext/function/is-arguments")
    , callable    = require("es5-ext/object/valid-callable")
    , isString    = require("es5-ext/string/is-string")
    , get         = require("./get");
  
  var isArray = Array.isArray, call = Function.prototype.call, some = Array.prototype.some;
  
  module.exports = function (iterable, cb /*, thisArg*/) {
    var mode, thisArg = arguments[2], result, doBreak, broken, i, length, char, code;
    if (isArray(iterable) || isArguments(iterable)) mode = "array";
    else if (isString(iterable)) mode = "string";
    else iterable = get(iterable);
  
    callable(cb);
    doBreak = function () {
      broken = true;
    };
    if (mode === "array") {
      some.call(iterable, function (value) {
        call.call(cb, thisArg, value, doBreak);
        return broken;
      });
      return;
    }
    if (mode === "string") {
      length = iterable.length;
      for (i = 0; i < length; ++i) {
        char = iterable[i];
        if (i + 1 < length) {
          code = char.charCodeAt(0);
          if (code >= 0xd800 && code <= 0xdbff) char += iterable[++i];
        }
        call.call(cb, thisArg, char, doBreak);
        if (broken) break;
      }
      return;
    }
    result = iterable.next();
  
    while (!result.done) {
      call.call(cb, thisArg, result.value, doBreak);
      if (broken) return;
      result = iterable.next();
    }
  };
  
  },{"./get":54,"es5-ext/function/is-arguments":15,"es5-ext/object/valid-callable":44,"es5-ext/string/is-string":50}],54:[function(require,module,exports){
  "use strict";
  
  var isArguments    = require("es5-ext/function/is-arguments")
    , isString       = require("es5-ext/string/is-string")
    , ArrayIterator  = require("./array")
    , StringIterator = require("./string")
    , iterable       = require("./valid-iterable")
    , iteratorSymbol = require("es6-symbol").iterator;
  
  module.exports = function (obj) {
    if (typeof iterable(obj)[iteratorSymbol] === "function") return obj[iteratorSymbol]();
    if (isArguments(obj)) return new ArrayIterator(obj);
    if (isString(obj)) return new StringIterator(obj);
    return new ArrayIterator(obj);
  };
  
  },{"./array":52,"./string":57,"./valid-iterable":58,"es5-ext/function/is-arguments":15,"es5-ext/string/is-string":50,"es6-symbol":65}],55:[function(require,module,exports){
  "use strict";
  
  var clear    = require("es5-ext/array/#/clear")
    , assign   = require("es5-ext/object/assign")
    , callable = require("es5-ext/object/valid-callable")
    , value    = require("es5-ext/object/valid-value")
    , d        = require("d")
    , autoBind = require("d/auto-bind")
    , Symbol   = require("es6-symbol");
  
  var defineProperty = Object.defineProperty, defineProperties = Object.defineProperties, Iterator;
  
  module.exports = Iterator = function (list, context) {
    if (!(this instanceof Iterator)) throw new TypeError("Constructor requires 'new'");
    defineProperties(this, {
      __list__: d("w", value(list)),
      __context__: d("w", context),
      __nextIndex__: d("w", 0)
    });
    if (!context) return;
    callable(context.on);
    context.on("_add", this._onAdd);
    context.on("_delete", this._onDelete);
    context.on("_clear", this._onClear);
  };
  
  // Internal %IteratorPrototype% doesn't expose its constructor
  delete Iterator.prototype.constructor;
  
  defineProperties(
    Iterator.prototype,
    assign(
      {
        _next: d(function () {
          var i;
          if (!this.__list__) return undefined;
          if (this.__redo__) {
            i = this.__redo__.shift();
            if (i !== undefined) return i;
          }
          if (this.__nextIndex__ < this.__list__.length) return this.__nextIndex__++;
          this._unBind();
          return undefined;
        }),
        next: d(function () {
          return this._createResult(this._next());
        }),
        _createResult: d(function (i) {
          if (i === undefined) return { done: true, value: undefined };
          return { done: false, value: this._resolve(i) };
        }),
        _resolve: d(function (i) {
          return this.__list__[i];
        }),
        _unBind: d(function () {
          this.__list__ = null;
          delete this.__redo__;
          if (!this.__context__) return;
          this.__context__.off("_add", this._onAdd);
          this.__context__.off("_delete", this._onDelete);
          this.__context__.off("_clear", this._onClear);
          this.__context__ = null;
        }),
        toString: d(function () {
          return "[object " + (this[Symbol.toStringTag] || "Object") + "]";
        })
      },
      autoBind({
        _onAdd: d(function (index) {
          if (index >= this.__nextIndex__) return;
          ++this.__nextIndex__;
          if (!this.__redo__) {
            defineProperty(this, "__redo__", d("c", [index]));
            return;
          }
          this.__redo__.forEach(function (redo, i) {
            if (redo >= index) this.__redo__[i] = ++redo;
          }, this);
          this.__redo__.push(index);
        }),
        _onDelete: d(function (index) {
          var i;
          if (index >= this.__nextIndex__) return;
          --this.__nextIndex__;
          if (!this.__redo__) return;
          i = this.__redo__.indexOf(index);
          if (i !== -1) this.__redo__.splice(i, 1);
          this.__redo__.forEach(function (redo, j) {
            if (redo > index) this.__redo__[j] = --redo;
          }, this);
        }),
        _onClear: d(function () {
          if (this.__redo__) clear.call(this.__redo__);
          this.__nextIndex__ = 0;
        })
      })
    )
  );
  
  defineProperty(
    Iterator.prototype,
    Symbol.iterator,
    d(function () {
      return this;
    })
  );
  
  },{"d":9,"d/auto-bind":8,"es5-ext/array/#/clear":10,"es5-ext/object/assign":27,"es5-ext/object/valid-callable":44,"es5-ext/object/valid-value":46,"es6-symbol":65}],56:[function(require,module,exports){
  "use strict";
  
  var isArguments = require("es5-ext/function/is-arguments")
    , isValue     = require("es5-ext/object/is-value")
    , isString    = require("es5-ext/string/is-string");
  
  var iteratorSymbol = require("es6-symbol").iterator
    , isArray        = Array.isArray;
  
  module.exports = function (value) {
    if (!isValue(value)) return false;
    if (isArray(value)) return true;
    if (isString(value)) return true;
    if (isArguments(value)) return true;
    return typeof value[iteratorSymbol] === "function";
  };
  
  },{"es5-ext/function/is-arguments":15,"es5-ext/object/is-value":34,"es5-ext/string/is-string":50,"es6-symbol":65}],57:[function(require,module,exports){
  // Thanks @mathiasbynens
  // http://mathiasbynens.be/notes/javascript-unicode#iterating-over-symbols
  
  "use strict";
  
  var setPrototypeOf = require("es5-ext/object/set-prototype-of")
    , d              = require("d")
    , Symbol         = require("es6-symbol")
    , Iterator       = require("./");
  
  var defineProperty = Object.defineProperty, StringIterator;
  
  StringIterator = module.exports = function (str) {
    if (!(this instanceof StringIterator)) throw new TypeError("Constructor requires 'new'");
    str = String(str);
    Iterator.call(this, str);
    defineProperty(this, "__length__", d("", str.length));
  };
  if (setPrototypeOf) setPrototypeOf(StringIterator, Iterator);
  
  // Internal %ArrayIteratorPrototype% doesn't expose its constructor
  delete StringIterator.prototype.constructor;
  
  StringIterator.prototype = Object.create(Iterator.prototype, {
    _next: d(function () {
      if (!this.__list__) return undefined;
      if (this.__nextIndex__ < this.__length__) return this.__nextIndex__++;
      this._unBind();
      return undefined;
    }),
    _resolve: d(function (i) {
      var char = this.__list__[i], code;
      if (this.__nextIndex__ === this.__length__) return char;
      code = char.charCodeAt(0);
      if (code >= 0xd800 && code <= 0xdbff) return char + this.__list__[this.__nextIndex__++];
      return char;
    })
  });
  defineProperty(StringIterator.prototype, Symbol.toStringTag, d("c", "String Iterator"));
  
  },{"./":55,"d":9,"es5-ext/object/set-prototype-of":41,"es6-symbol":65}],58:[function(require,module,exports){
  "use strict";
  
  var isIterable = require("./is-iterable");
  
  module.exports = function (value) {
    if (!isIterable(value)) throw new TypeError(value + " is not iterable");
    return value;
  };
  
  },{"./is-iterable":56}],59:[function(require,module,exports){
  'use strict';
  
  module.exports = require('./is-implemented')() ? Map : require('./polyfill');
  
  },{"./is-implemented":60,"./polyfill":64}],60:[function(require,module,exports){
  'use strict';
  
  module.exports = function () {
    var map, iterator, result;
    if (typeof Map !== 'function') return false;
    try {
      // WebKit doesn't support arguments and crashes
      map = new Map([['raz', 'one'], ['dwa', 'two'], ['trzy', 'three']]);
    } catch (e) {
      return false;
    }
    if (String(map) !== '[object Map]') return false;
    if (map.size !== 3) return false;
    if (typeof map.clear !== 'function') return false;
    if (typeof map.delete !== 'function') return false;
    if (typeof map.entries !== 'function') return false;
    if (typeof map.forEach !== 'function') return false;
    if (typeof map.get !== 'function') return false;
    if (typeof map.has !== 'function') return false;
    if (typeof map.keys !== 'function') return false;
    if (typeof map.set !== 'function') return false;
    if (typeof map.values !== 'function') return false;
  
    iterator = map.entries();
    result = iterator.next();
    if (result.done !== false) return false;
    if (!result.value) return false;
    if (result.value[0] !== 'raz') return false;
    if (result.value[1] !== 'one') return false;
  
    return true;
  };
  
  },{}],61:[function(require,module,exports){
  // Exports true if environment provides native `Map` implementation,
  // whatever that is.
  
  'use strict';
  
  module.exports = (function () {
    if (typeof Map === 'undefined') return false;
    return (Object.prototype.toString.call(new Map()) === '[object Map]');
  }());
  
  },{}],62:[function(require,module,exports){
  'use strict';
  
  module.exports = require('es5-ext/object/primitive-set')('key',
    'value', 'key+value');
  
  },{"es5-ext/object/primitive-set":40}],63:[function(require,module,exports){
  'use strict';
  
  var setPrototypeOf    = require('es5-ext/object/set-prototype-of')
    , d                 = require('d')
    , Iterator          = require('es6-iterator')
    , toStringTagSymbol = require('es6-symbol').toStringTag
    , kinds             = require('./iterator-kinds')
  
    , defineProperties = Object.defineProperties
    , unBind = Iterator.prototype._unBind
    , MapIterator;
  
  MapIterator = module.exports = function (map, kind) {
    if (!(this instanceof MapIterator)) return new MapIterator(map, kind);
    Iterator.call(this, map.__mapKeysData__, map);
    if (!kind || !kinds[kind]) kind = 'key+value';
    defineProperties(this, {
      __kind__: d('', kind),
      __values__: d('w', map.__mapValuesData__)
    });
  };
  if (setPrototypeOf) setPrototypeOf(MapIterator, Iterator);
  
  MapIterator.prototype = Object.create(Iterator.prototype, {
    constructor: d(MapIterator),
    _resolve: d(function (i) {
      if (this.__kind__ === 'value') return this.__values__[i];
      if (this.__kind__ === 'key') return this.__list__[i];
      return [this.__list__[i], this.__values__[i]];
    }),
    _unBind: d(function () {
      this.__values__ = null;
      unBind.call(this);
    }),
    toString: d(function () { return '[object Map Iterator]'; })
  });
  Object.defineProperty(MapIterator.prototype, toStringTagSymbol,
    d('c', 'Map Iterator'));
  
  },{"./iterator-kinds":62,"d":9,"es5-ext/object/set-prototype-of":41,"es6-iterator":55,"es6-symbol":65}],64:[function(require,module,exports){
  'use strict';
  
  var clear          = require('es5-ext/array/#/clear')
    , eIndexOf       = require('es5-ext/array/#/e-index-of')
    , setPrototypeOf = require('es5-ext/object/set-prototype-of')
    , callable       = require('es5-ext/object/valid-callable')
    , validValue     = require('es5-ext/object/valid-value')
    , d              = require('d')
    , ee             = require('event-emitter')
    , Symbol         = require('es6-symbol')
    , iterator       = require('es6-iterator/valid-iterable')
    , forOf          = require('es6-iterator/for-of')
    , Iterator       = require('./lib/iterator')
    , isNative       = require('./is-native-implemented')
  
    , call = Function.prototype.call
    , defineProperties = Object.defineProperties, getPrototypeOf = Object.getPrototypeOf
    , MapPoly;
  
  module.exports = MapPoly = function (/*iterable*/) {
    var iterable = arguments[0], keys, values, self;
    if (!(this instanceof MapPoly)) throw new TypeError('Constructor requires \'new\'');
    if (isNative && setPrototypeOf && (Map !== MapPoly)) {
      self = setPrototypeOf(new Map(), getPrototypeOf(this));
    } else {
      self = this;
    }
    if (iterable != null) iterator(iterable);
    defineProperties(self, {
      __mapKeysData__: d('c', keys = []),
      __mapValuesData__: d('c', values = [])
    });
    if (!iterable) return self;
    forOf(iterable, function (value) {
      var key = validValue(value)[0];
      value = value[1];
      if (eIndexOf.call(keys, key) !== -1) return;
      keys.push(key);
      values.push(value);
    }, self);
    return self;
  };
  
  if (isNative) {
    if (setPrototypeOf) setPrototypeOf(MapPoly, Map);
    MapPoly.prototype = Object.create(Map.prototype, {
      constructor: d(MapPoly)
    });
  }
  
  ee(defineProperties(MapPoly.prototype, {
    clear: d(function () {
      if (!this.__mapKeysData__.length) return;
      clear.call(this.__mapKeysData__);
      clear.call(this.__mapValuesData__);
      this.emit('_clear');
    }),
    delete: d(function (key) {
      var index = eIndexOf.call(this.__mapKeysData__, key);
      if (index === -1) return false;
      this.__mapKeysData__.splice(index, 1);
      this.__mapValuesData__.splice(index, 1);
      this.emit('_delete', index, key);
      return true;
    }),
    entries: d(function () { return new Iterator(this, 'key+value'); }),
    forEach: d(function (cb/*, thisArg*/) {
      var thisArg = arguments[1], iterator, result;
      callable(cb);
      iterator = this.entries();
      result = iterator._next();
      while (result !== undefined) {
        call.call(cb, thisArg, this.__mapValuesData__[result],
          this.__mapKeysData__[result], this);
        result = iterator._next();
      }
    }),
    get: d(function (key) {
      var index = eIndexOf.call(this.__mapKeysData__, key);
      if (index === -1) return;
      return this.__mapValuesData__[index];
    }),
    has: d(function (key) {
      return (eIndexOf.call(this.__mapKeysData__, key) !== -1);
    }),
    keys: d(function () { return new Iterator(this, 'key'); }),
    set: d(function (key, value) {
      var index = eIndexOf.call(this.__mapKeysData__, key), emit;
      if (index === -1) {
        index = this.__mapKeysData__.push(key) - 1;
        emit = true;
      }
      this.__mapValuesData__[index] = value;
      if (emit) this.emit('_add', index, key);
      return this;
    }),
    size: d.gs(function () { return this.__mapKeysData__.length; }),
    values: d(function () { return new Iterator(this, 'value'); }),
    toString: d(function () { return '[object Map]'; })
  }));
  Object.defineProperty(MapPoly.prototype, Symbol.iterator, d(function () {
    return this.entries();
  }));
  Object.defineProperty(MapPoly.prototype, Symbol.toStringTag, d('c', 'Map'));
  
  },{"./is-native-implemented":61,"./lib/iterator":63,"d":9,"es5-ext/array/#/clear":10,"es5-ext/array/#/e-index-of":11,"es5-ext/object/set-prototype-of":41,"es5-ext/object/valid-callable":44,"es5-ext/object/valid-value":46,"es6-iterator/for-of":53,"es6-iterator/valid-iterable":58,"es6-symbol":65,"event-emitter":93}],65:[function(require,module,exports){
  "use strict";
  
  module.exports = require("./is-implemented")()
    ? require("ext/global-this").Symbol
    : require("./polyfill");
  
  },{"./is-implemented":66,"./polyfill":71,"ext/global-this":95}],66:[function(require,module,exports){
  "use strict";
  
  var global     = require("ext/global-this")
    , validTypes = { object: true, symbol: true };
  
  module.exports = function () {
    var Symbol = global.Symbol;
    var symbol;
    if (typeof Symbol !== "function") return false;
    symbol = Symbol("test symbol");
    try { String(symbol); }
    catch (e) { return false; }
  
    // Return 'true' also for polyfills
    if (!validTypes[typeof Symbol.iterator]) return false;
    if (!validTypes[typeof Symbol.toPrimitive]) return false;
    if (!validTypes[typeof Symbol.toStringTag]) return false;
  
    return true;
  };
  
  },{"ext/global-this":95}],67:[function(require,module,exports){
  "use strict";
  
  module.exports = function (value) {
    if (!value) return false;
    if (typeof value === "symbol") return true;
    if (!value.constructor) return false;
    if (value.constructor.name !== "Symbol") return false;
    return value[value.constructor.toStringTag] === "Symbol";
  };
  
  },{}],68:[function(require,module,exports){
  "use strict";
  
  var d = require("d");
  
  var create = Object.create, defineProperty = Object.defineProperty, objPrototype = Object.prototype;
  
  var created = create(null);
  module.exports = function (desc) {
    var postfix = 0, name, ie11BugWorkaround;
    while (created[desc + (postfix || "")]) ++postfix;
    desc += postfix || "";
    created[desc] = true;
    name = "@@" + desc;
    defineProperty(
      objPrototype,
      name,
      d.gs(null, function (value) {
        // For IE11 issue see:
        // https://connect.microsoft.com/IE/feedbackdetail/view/1928508/
        //    ie11-broken-getters-on-dom-objects
        // https://github.com/medikoo/es6-symbol/issues/12
        if (ie11BugWorkaround) return;
        ie11BugWorkaround = true;
        defineProperty(this, name, d(value));
        ie11BugWorkaround = false;
      })
    );
    return name;
  };
  
  },{"d":9}],69:[function(require,module,exports){
  "use strict";
  
  var d            = require("d")
    , NativeSymbol = require("ext/global-this").Symbol;
  
  module.exports = function (SymbolPolyfill) {
    return Object.defineProperties(SymbolPolyfill, {
      // To ensure proper interoperability with other native functions (e.g. Array.from)
      // fallback to eventual native implementation of given symbol
      hasInstance: d(
        "", (NativeSymbol && NativeSymbol.hasInstance) || SymbolPolyfill("hasInstance")
      ),
      isConcatSpreadable: d(
        "",
        (NativeSymbol && NativeSymbol.isConcatSpreadable) ||
          SymbolPolyfill("isConcatSpreadable")
      ),
      iterator: d("", (NativeSymbol && NativeSymbol.iterator) || SymbolPolyfill("iterator")),
      match: d("", (NativeSymbol && NativeSymbol.match) || SymbolPolyfill("match")),
      replace: d("", (NativeSymbol && NativeSymbol.replace) || SymbolPolyfill("replace")),
      search: d("", (NativeSymbol && NativeSymbol.search) || SymbolPolyfill("search")),
      species: d("", (NativeSymbol && NativeSymbol.species) || SymbolPolyfill("species")),
      split: d("", (NativeSymbol && NativeSymbol.split) || SymbolPolyfill("split")),
      toPrimitive: d(
        "", (NativeSymbol && NativeSymbol.toPrimitive) || SymbolPolyfill("toPrimitive")
      ),
      toStringTag: d(
        "", (NativeSymbol && NativeSymbol.toStringTag) || SymbolPolyfill("toStringTag")
      ),
      unscopables: d(
        "", (NativeSymbol && NativeSymbol.unscopables) || SymbolPolyfill("unscopables")
      )
    });
  };
  
  },{"d":9,"ext/global-this":95}],70:[function(require,module,exports){
  "use strict";
  
  var d              = require("d")
    , validateSymbol = require("../../../validate-symbol");
  
  var registry = Object.create(null);
  
  module.exports = function (SymbolPolyfill) {
    return Object.defineProperties(SymbolPolyfill, {
      for: d(function (key) {
        if (registry[key]) return registry[key];
        return (registry[key] = SymbolPolyfill(String(key)));
      }),
      keyFor: d(function (symbol) {
        var key;
        validateSymbol(symbol);
        for (key in registry) {
          if (registry[key] === symbol) return key;
        }
        return undefined;
      })
    });
  };
  
  },{"../../../validate-symbol":72,"d":9}],71:[function(require,module,exports){
  // ES2015 Symbol polyfill for environments that do not (or partially) support it
  
  "use strict";
  
  var d                    = require("d")
    , validateSymbol       = require("./validate-symbol")
    , NativeSymbol         = require("ext/global-this").Symbol
    , generateName         = require("./lib/private/generate-name")
    , setupStandardSymbols = require("./lib/private/setup/standard-symbols")
    , setupSymbolRegistry  = require("./lib/private/setup/symbol-registry");
  
  var create = Object.create
    , defineProperties = Object.defineProperties
    , defineProperty = Object.defineProperty;
  
  var SymbolPolyfill, HiddenSymbol, isNativeSafe;
  
  if (typeof NativeSymbol === "function") {
    try {
      String(NativeSymbol());
      isNativeSafe = true;
    } catch (ignore) {}
  } else {
    NativeSymbol = null;
  }
  
  // Internal constructor (not one exposed) for creating Symbol instances.
  // This one is used to ensure that `someSymbol instanceof Symbol` always return false
  HiddenSymbol = function Symbol(description) {
    if (this instanceof HiddenSymbol) throw new TypeError("Symbol is not a constructor");
    return SymbolPolyfill(description);
  };
  
  // Exposed `Symbol` constructor
  // (returns instances of HiddenSymbol)
  module.exports = SymbolPolyfill = function Symbol(description) {
    var symbol;
    if (this instanceof Symbol) throw new TypeError("Symbol is not a constructor");
    if (isNativeSafe) return NativeSymbol(description);
    symbol = create(HiddenSymbol.prototype);
    description = description === undefined ? "" : String(description);
    return defineProperties(symbol, {
      __description__: d("", description),
      __name__: d("", generateName(description))
    });
  };
  
  setupStandardSymbols(SymbolPolyfill);
  setupSymbolRegistry(SymbolPolyfill);
  
  // Internal tweaks for real symbol producer
  defineProperties(HiddenSymbol.prototype, {
    constructor: d(SymbolPolyfill),
    toString: d("", function () { return this.__name__; })
  });
  
  // Proper implementation of methods exposed on Symbol.prototype
  // They won't be accessible on produced symbol instances as they derive from HiddenSymbol.prototype
  defineProperties(SymbolPolyfill.prototype, {
    toString: d(function () { return "Symbol (" + validateSymbol(this).__description__ + ")"; }),
    valueOf: d(function () { return validateSymbol(this); })
  });
  defineProperty(
    SymbolPolyfill.prototype,
    SymbolPolyfill.toPrimitive,
    d("", function () {
      var symbol = validateSymbol(this);
      if (typeof symbol === "symbol") return symbol;
      return symbol.toString();
    })
  );
  defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toStringTag, d("c", "Symbol"));
  
  // Proper implementaton of toPrimitive and toStringTag for returned symbol instances
  defineProperty(
    HiddenSymbol.prototype, SymbolPolyfill.toStringTag,
    d("c", SymbolPolyfill.prototype[SymbolPolyfill.toStringTag])
  );
  
  // Note: It's important to define `toPrimitive` as last one, as some implementations
  // implement `toPrimitive` natively without implementing `toStringTag` (or other specified symbols)
  // And that may invoke error in definition flow:
  // See: https://github.com/medikoo/es6-symbol/issues/13#issuecomment-164146149
  defineProperty(
    HiddenSymbol.prototype, SymbolPolyfill.toPrimitive,
    d("c", SymbolPolyfill.prototype[SymbolPolyfill.toPrimitive])
  );
  
  },{"./lib/private/generate-name":68,"./lib/private/setup/standard-symbols":69,"./lib/private/setup/symbol-registry":70,"./validate-symbol":72,"d":9,"ext/global-this":95}],72:[function(require,module,exports){
  "use strict";
  
  var isSymbol = require("./is-symbol");
  
  module.exports = function (value) {
    if (!isSymbol(value)) throw new TypeError(value + " is not a symbol");
    return value;
  };
  
  },{"./is-symbol":67}],73:[function(require,module,exports){
  "use strict";
  
  module.exports = require("./is-implemented")() ? WeakMap : require("./polyfill");
  
  },{"./is-implemented":74,"./polyfill":76}],74:[function(require,module,exports){
  "use strict";
  
  module.exports = function () {
    var weakMap, obj;
  
    if (typeof WeakMap !== "function") return false;
    try {
      // WebKit doesn't support arguments and crashes
      weakMap = new WeakMap([[obj = {}, "one"], [{}, "two"], [{}, "three"]]);
    } catch (e) {
      return false;
    }
    if (String(weakMap) !== "[object WeakMap]") return false;
    if (typeof weakMap.set !== "function") return false;
    if (weakMap.set({}, 1) !== weakMap) return false;
    if (typeof weakMap.delete !== "function") return false;
    if (typeof weakMap.has !== "function") return false;
    if (weakMap.get(obj) !== "one") return false;
  
    return true;
  };
  
  },{}],75:[function(require,module,exports){
  // Exports true if environment provides native `WeakMap` implementation, whatever that is.
  
  "use strict";
  
  module.exports = (function () {
    if (typeof WeakMap !== "function") return false;
    return Object.prototype.toString.call(new WeakMap()) === "[object WeakMap]";
  }());
  
  },{}],76:[function(require,module,exports){
  "use strict";
  
  var isValue           = require("es5-ext/object/is-value")
    , setPrototypeOf    = require("es5-ext/object/set-prototype-of")
    , object            = require("es5-ext/object/valid-object")
    , ensureValue       = require("es5-ext/object/valid-value")
    , randomUniq        = require("es5-ext/string/random-uniq")
    , d                 = require("d")
    , getIterator       = require("es6-iterator/get")
    , forOf             = require("es6-iterator/for-of")
    , toStringTagSymbol = require("es6-symbol").toStringTag
    , isNative          = require("./is-native-implemented")
  
    , isArray = Array.isArray, defineProperty = Object.defineProperty
    , objHasOwnProperty = Object.prototype.hasOwnProperty, getPrototypeOf = Object.getPrototypeOf
    , WeakMapPoly;
  
  module.exports = WeakMapPoly = function (/* Iterable*/) {
    var iterable = arguments[0], self;
  
    if (!(this instanceof WeakMapPoly)) throw new TypeError("Constructor requires 'new'");
    self = isNative && setPrototypeOf && (WeakMap !== WeakMapPoly)
      ? setPrototypeOf(new WeakMap(), getPrototypeOf(this)) : this;
  
    if (isValue(iterable)) {
      if (!isArray(iterable)) iterable = getIterator(iterable);
    }
    defineProperty(self, "__weakMapData__", d("c", "$weakMap$" + randomUniq()));
    if (!iterable) return self;
    forOf(iterable, function (val) {
      ensureValue(val);
      self.set(val[0], val[1]);
    });
    return self;
  };
  
  if (isNative) {
    if (setPrototypeOf) setPrototypeOf(WeakMapPoly, WeakMap);
    WeakMapPoly.prototype = Object.create(WeakMap.prototype, { constructor: d(WeakMapPoly) });
  }
  
  Object.defineProperties(WeakMapPoly.prototype, {
    delete: d(function (key) {
      if (objHasOwnProperty.call(object(key), this.__weakMapData__)) {
        delete key[this.__weakMapData__];
        return true;
      }
      return false;
    }),
    get: d(function (key) {
      if (!objHasOwnProperty.call(object(key), this.__weakMapData__)) return undefined;
      return key[this.__weakMapData__];
    }),
    has: d(function (key) {
      return objHasOwnProperty.call(object(key), this.__weakMapData__);
    }),
    set: d(function (key, value) {
      defineProperty(object(key), this.__weakMapData__, d("c", value));
      return this;
    }),
    toString: d(function () {
      return "[object WeakMap]";
    })
  });
  defineProperty(WeakMapPoly.prototype, toStringTagSymbol, d("c", "WeakMap"));
  
  },{"./is-native-implemented":75,"d":9,"es5-ext/object/is-value":34,"es5-ext/object/set-prototype-of":41,"es5-ext/object/valid-object":45,"es5-ext/object/valid-value":46,"es5-ext/string/random-uniq":51,"es6-iterator/for-of":53,"es6-iterator/get":54,"es6-symbol":65}],77:[function(require,module,exports){
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Definition = exports.ParameterDefinition = undefined;
  
  var _variable = require('./variable');
  
  var _variable2 = _interopRequireDefault(_variable);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
  
  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
  
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /*
                                                                                                                                                              Copyright (C) 2015 Yusuke Suzuki <utatane.tea@gmail.com>
                                                                                                                                                            
                                                                                                                                                              Redistribution and use in source and binary forms, with or without
                                                                                                                                                              modification, are permitted provided that the following conditions are met:
                                                                                                                                                            
                                                                                                                                                                * Redistributions of source code must retain the above copyright
                                                                                                                                                                  notice, this list of conditions and the following disclaimer.
                                                                                                                                                                * Redistributions in binary form must reproduce the above copyright
                                                                                                                                                                  notice, this list of conditions and the following disclaimer in the
                                                                                                                                                                  documentation and/or other materials provided with the distribution.
                                                                                                                                                            
                                                                                                                                                              THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
                                                                                                                                                              AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
                                                                                                                                                              IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
                                                                                                                                                              ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
                                                                                                                                                              DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
                                                                                                                                                              (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
                                                                                                                                                              LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
                                                                                                                                                              ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
                                                                                                                                                              (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
                                                                                                                                                              THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
                                                                                                                                                            */
  
  /**
   * @class Definition
   */
  
  var Definition = function Definition(type, name, node, parent, index, kind) {
    _classCallCheck(this, Definition);
  
    /**
     * @member {String} Definition#type - type of the occurrence (e.g. "Parameter", "Variable", ...).
     */
    this.type = type;
    /**
     * @member {esprima.Identifier} Definition#name - the identifier AST node of the occurrence.
     */
    this.name = name;
    /**
     * @member {esprima.Node} Definition#node - the enclosing node of the identifier.
     */
    this.node = node;
    /**
     * @member {esprima.Node?} Definition#parent - the enclosing statement node of the identifier.
     */
    this.parent = parent;
    /**
     * @member {Number?} Definition#index - the index in the declaration statement.
     */
    this.index = index;
    /**
     * @member {String?} Definition#kind - the kind of the declaration statement.
     */
    this.kind = kind;
  };
  
  /**
   * @class ParameterDefinition
   */
  
  
  exports.default = Definition;
  
  var ParameterDefinition = function (_Definition) {
    _inherits(ParameterDefinition, _Definition);
  
    function ParameterDefinition(name, node, index, rest) {
      _classCallCheck(this, ParameterDefinition);
  
      /**
       * Whether the parameter definition is a part of a rest parameter.
       * @member {boolean} ParameterDefinition#rest
       */
  
      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ParameterDefinition).call(this, _variable2.default.Parameter, name, node, null, index, null));
  
      _this.rest = rest;
      return _this;
    }
  
    return ParameterDefinition;
  }(Definition);
  
  exports.ParameterDefinition = ParameterDefinition;
  exports.Definition = Definition;
  
  /* vim: set sw=4 ts=4 et tw=80 : */
  
  
  },{"./variable":84}],78:[function(require,module,exports){
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.ScopeManager = exports.Scope = exports.Variable = exports.Reference = exports.version = undefined;
  
  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /*
                                                                                                                                                                                                                                                      Copyright (C) 2012-2014 Yusuke Suzuki <utatane.tea@gmail.com>
                                                                                                                                                                                                                                                      Copyright (C) 2013 Alex Seville <hi@alexanderseville.com>
                                                                                                                                                                                                                                                      Copyright (C) 2014 Thiago de Arruda <tpadilha84@gmail.com>
                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                      Redistribution and use in source and binary forms, with or without
                                                                                                                                                                                                                                                      modification, are permitted provided that the following conditions are met:
                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                        * Redistributions of source code must retain the above copyright
                                                                                                                                                                                                                                                          notice, this list of conditions and the following disclaimer.
                                                                                                                                                                                                                                                        * Redistributions in binary form must reproduce the above copyright
                                                                                                                                                                                                                                                          notice, this list of conditions and the following disclaimer in the
                                                                                                                                                                                                                                                          documentation and/or other materials provided with the distribution.
                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                      THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
                                                                                                                                                                                                                                                      AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
                                                                                                                                                                                                                                                      IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
                                                                                                                                                                                                                                                      ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
                                                                                                                                                                                                                                                      DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
                                                                                                                                                                                                                                                      (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
                                                                                                                                                                                                                                                      LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
                                                                                                                                                                                                                                                      ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
                                                                                                                                                                                                                                                      (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
                                                                                                                                                                                                                                                      THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
                                                                                                                                                                                                                                                    */
  
  /**
   * Escope (<a href="http://github.com/estools/escope">escope</a>) is an <a
   * href="http://www.ecma-international.org/publications/standards/Ecma-262.htm">ECMAScript</a>
   * scope analyzer extracted from the <a
   * href="http://github.com/estools/esmangle">esmangle project</a/>.
   * <p>
   * <em>escope</em> finds lexical scopes in a source program, i.e. areas of that
   * program where different occurrences of the same identifier refer to the same
   * variable. With each scope the contained variables are collected, and each
   * identifier reference in code is linked to its corresponding variable (if
   * possible).
   * <p>
   * <em>escope</em> works on a syntax tree of the parsed source code which has
   * to adhere to the <a
   * href="https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API">
   * Mozilla Parser API</a>. E.g. <a href="http://esprima.org">esprima</a> is a parser
   * that produces such syntax trees.
   * <p>
   * The main interface is the {@link analyze} function.
   * @module escope
   */
  
  /*jslint bitwise:true */
  
  exports.analyze = analyze;
  
  var _assert = require('assert');
  
  var _assert2 = _interopRequireDefault(_assert);
  
  var _scopeManager = require('./scope-manager');
  
  var _scopeManager2 = _interopRequireDefault(_scopeManager);
  
  var _referencer = require('./referencer');
  
  var _referencer2 = _interopRequireDefault(_referencer);
  
  var _reference = require('./reference');
  
  var _reference2 = _interopRequireDefault(_reference);
  
  var _variable = require('./variable');
  
  var _variable2 = _interopRequireDefault(_variable);
  
  var _scope = require('./scope');
  
  var _scope2 = _interopRequireDefault(_scope);
  
  var _package = require('../package.json');
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function defaultOptions() {
      return {
          optimistic: false,
          directive: false,
          nodejsScope: false,
          impliedStrict: false,
          sourceType: 'script', // one of ['script', 'module']
          ecmaVersion: 5,
          childVisitorKeys: null,
          fallback: 'iteration'
      };
  }
  
  function updateDeeply(target, override) {
      var key, val;
  
      function isHashObject(target) {
          return (typeof target === 'undefined' ? 'undefined' : _typeof(target)) === 'object' && target instanceof Object && !(target instanceof Array) && !(target instanceof RegExp);
      }
  
      for (key in override) {
          if (override.hasOwnProperty(key)) {
              val = override[key];
              if (isHashObject(val)) {
                  if (isHashObject(target[key])) {
                      updateDeeply(target[key], val);
                  } else {
                      target[key] = updateDeeply({}, val);
                  }
              } else {
                  target[key] = val;
              }
          }
      }
      return target;
  }
  
  /**
   * Main interface function. Takes an Esprima syntax tree and returns the
   * analyzed scopes.
   * @function analyze
   * @param {esprima.Tree} tree
   * @param {Object} providedOptions - Options that tailor the scope analysis
   * @param {boolean} [providedOptions.optimistic=false] - the optimistic flag
   * @param {boolean} [providedOptions.directive=false]- the directive flag
   * @param {boolean} [providedOptions.ignoreEval=false]- whether to check 'eval()' calls
   * @param {boolean} [providedOptions.nodejsScope=false]- whether the whole
   * script is executed under node.js environment. When enabled, escope adds
   * a function scope immediately following the global scope.
   * @param {boolean} [providedOptions.impliedStrict=false]- implied strict mode
   * (if ecmaVersion >= 5).
   * @param {string} [providedOptions.sourceType='script']- the source type of the script. one of 'script' and 'module'
   * @param {number} [providedOptions.ecmaVersion=5]- which ECMAScript version is considered
   * @param {Object} [providedOptions.childVisitorKeys=null] - Additional known visitor keys. See [esrecurse](https://github.com/estools/esrecurse)'s the `childVisitorKeys` option.
   * @param {string} [providedOptions.fallback='iteration'] - A kind of the fallback in order to encounter with unknown node. See [esrecurse](https://github.com/estools/esrecurse)'s the `fallback` option.
   * @return {ScopeManager}
   */
  function analyze(tree, providedOptions) {
      var scopeManager, referencer, options;
  
      options = updateDeeply(defaultOptions(), providedOptions);
  
      scopeManager = new _scopeManager2.default(options);
  
      referencer = new _referencer2.default(options, scopeManager);
      referencer.visit(tree);
  
      (0, _assert2.default)(scopeManager.__currentScope === null, 'currentScope should be null.');
  
      return scopeManager;
  }
  
  exports.
  /** @name module:escope.version */
  version = _package.version;
  exports.
  /** @name module:escope.Reference */
  Reference = _reference2.default;
  exports.
  /** @name module:escope.Variable */
  Variable = _variable2.default;
  exports.
  /** @name module:escope.Scope */
  Scope = _scope2.default;
  exports.
  /** @name module:escope.ScopeManager */
  ScopeManager = _scopeManager2.default;
  
  /* vim: set sw=4 ts=4 et tw=80 : */
  
  
  },{"../package.json":87,"./reference":80,"./referencer":81,"./scope":83,"./scope-manager":82,"./variable":84,"assert":1}],79:[function(require,module,exports){
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
  
  var _estraverse = require('estraverse');
  
  var _esrecurse = require('esrecurse');
  
  var _esrecurse2 = _interopRequireDefault(_esrecurse);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  
  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
  
  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   Copyright (C) 2015 Yusuke Suzuki <utatane.tea@gmail.com>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   Redistribution and use in source and binary forms, with or without
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   modification, are permitted provided that the following conditions are met:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Redistributions of source code must retain the above copyright
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       notice, this list of conditions and the following disclaimer.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Redistributions in binary form must reproduce the above copyright
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       notice, this list of conditions and the following disclaimer in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       documentation and/or other materials provided with the distribution.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 */
  
  function getLast(xs) {
      return xs[xs.length - 1] || null;
  }
  
  var PatternVisitor = function (_esrecurse$Visitor) {
      _inherits(PatternVisitor, _esrecurse$Visitor);
  
      _createClass(PatternVisitor, null, [{
          key: 'isPattern',
          value: function isPattern(node) {
              var nodeType = node.type;
              return nodeType === _estraverse.Syntax.Identifier || nodeType === _estraverse.Syntax.ObjectPattern || nodeType === _estraverse.Syntax.ArrayPattern || nodeType === _estraverse.Syntax.SpreadElement || nodeType === _estraverse.Syntax.RestElement || nodeType === _estraverse.Syntax.AssignmentPattern;
          }
      }]);
  
      function PatternVisitor(options, rootPattern, callback) {
          _classCallCheck(this, PatternVisitor);
  
          var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(PatternVisitor).call(this, null, options));
  
          _this.rootPattern = rootPattern;
          _this.callback = callback;
          _this.assignments = [];
          _this.rightHandNodes = [];
          _this.restElements = [];
          return _this;
      }
  
      _createClass(PatternVisitor, [{
          key: 'Identifier',
          value: function Identifier(pattern) {
              var lastRestElement = getLast(this.restElements);
              this.callback(pattern, {
                  topLevel: pattern === this.rootPattern,
                  rest: lastRestElement != null && lastRestElement.argument === pattern,
                  assignments: this.assignments
              });
          }
      }, {
          key: 'Property',
          value: function Property(property) {
              // Computed property's key is a right hand node.
              if (property.computed) {
                  this.rightHandNodes.push(property.key);
              }
  
              // If it's shorthand, its key is same as its value.
              // If it's shorthand and has its default value, its key is same as its value.left (the value is AssignmentPattern).
              // If it's not shorthand, the name of new variable is its value's.
              this.visit(property.value);
          }
      }, {
          key: 'ArrayPattern',
          value: function ArrayPattern(pattern) {
              var i, iz, element;
              for (i = 0, iz = pattern.elements.length; i < iz; ++i) {
                  element = pattern.elements[i];
                  this.visit(element);
              }
          }
      }, {
          key: 'AssignmentPattern',
          value: function AssignmentPattern(pattern) {
              this.assignments.push(pattern);
              this.visit(pattern.left);
              this.rightHandNodes.push(pattern.right);
              this.assignments.pop();
          }
      }, {
          key: 'RestElement',
          value: function RestElement(pattern) {
              this.restElements.push(pattern);
              this.visit(pattern.argument);
              this.restElements.pop();
          }
      }, {
          key: 'MemberExpression',
          value: function MemberExpression(node) {
              // Computed property's key is a right hand node.
              if (node.computed) {
                  this.rightHandNodes.push(node.property);
              }
              // the object is only read, write to its property.
              this.rightHandNodes.push(node.object);
          }
  
          //
          // ForInStatement.left and AssignmentExpression.left are LeftHandSideExpression.
          // By spec, LeftHandSideExpression is Pattern or MemberExpression.
          //   (see also: https://github.com/estree/estree/pull/20#issuecomment-74584758)
          // But espree 2.0 and esprima 2.0 parse to ArrayExpression, ObjectExpression, etc...
          //
  
      }, {
          key: 'SpreadElement',
          value: function SpreadElement(node) {
              this.visit(node.argument);
          }
      }, {
          key: 'ArrayExpression',
          value: function ArrayExpression(node) {
              node.elements.forEach(this.visit, this);
          }
      }, {
          key: 'AssignmentExpression',
          value: function AssignmentExpression(node) {
              this.assignments.push(node);
              this.visit(node.left);
              this.rightHandNodes.push(node.right);
              this.assignments.pop();
          }
      }, {
          key: 'CallExpression',
          value: function CallExpression(node) {
              var _this2 = this;
  
              // arguments are right hand nodes.
              node.arguments.forEach(function (a) {
                  _this2.rightHandNodes.push(a);
              });
              this.visit(node.callee);
          }
      }]);
  
      return PatternVisitor;
  }(_esrecurse2.default.Visitor);
  
  /* vim: set sw=4 ts=4 et tw=80 : */
  
  
  exports.default = PatternVisitor;
  
  
  },{"esrecurse":89,"estraverse":85}],80:[function(require,module,exports){
  "use strict";
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
  
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  
  /*
    Copyright (C) 2015 Yusuke Suzuki <utatane.tea@gmail.com>
  
    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:
  
      * Redistributions of source code must retain the above copyright
        notice, this list of conditions and the following disclaimer.
      * Redistributions in binary form must reproduce the above copyright
        notice, this list of conditions and the following disclaimer in the
        documentation and/or other materials provided with the distribution.
  
    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
    AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
    ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
    DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
    (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
    ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
    THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  */
  
  var READ = 0x1;
  var WRITE = 0x2;
  var RW = READ | WRITE;
  
  /**
   * A Reference represents a single occurrence of an identifier in code.
   * @class Reference
   */
  
  var Reference = function () {
    function Reference(ident, scope, flag, writeExpr, maybeImplicitGlobal, partial, init) {
      _classCallCheck(this, Reference);
  
      /**
       * Identifier syntax node.
       * @member {esprima#Identifier} Reference#identifier
       */
      this.identifier = ident;
      /**
       * Reference to the enclosing Scope.
       * @member {Scope} Reference#from
       */
      this.from = scope;
      /**
       * Whether the reference comes from a dynamic scope (such as 'eval',
       * 'with', etc.), and may be trapped by dynamic scopes.
       * @member {boolean} Reference#tainted
       */
      this.tainted = false;
      /**
       * The variable this reference is resolved with.
       * @member {Variable} Reference#resolved
       */
      this.resolved = null;
      /**
       * The read-write mode of the reference. (Value is one of {@link
       * Reference.READ}, {@link Reference.RW}, {@link Reference.WRITE}).
       * @member {number} Reference#flag
       * @private
       */
      this.flag = flag;
      if (this.isWrite()) {
        /**
         * If reference is writeable, this is the tree being written to it.
         * @member {esprima#Node} Reference#writeExpr
         */
        this.writeExpr = writeExpr;
        /**
         * Whether the Reference might refer to a partial value of writeExpr.
         * @member {boolean} Reference#partial
         */
        this.partial = partial;
        /**
         * Whether the Reference is to write of initialization.
         * @member {boolean} Reference#init
         */
        this.init = init;
      }
      this.__maybeImplicitGlobal = maybeImplicitGlobal;
    }
  
    /**
     * Whether the reference is static.
     * @method Reference#isStatic
     * @return {boolean}
     */
  
  
    _createClass(Reference, [{
      key: "isStatic",
      value: function isStatic() {
        return !this.tainted && this.resolved && this.resolved.scope.isStatic();
      }
  
      /**
       * Whether the reference is writeable.
       * @method Reference#isWrite
       * @return {boolean}
       */
  
    }, {
      key: "isWrite",
      value: function isWrite() {
        return !!(this.flag & Reference.WRITE);
      }
  
      /**
       * Whether the reference is readable.
       * @method Reference#isRead
       * @return {boolean}
       */
  
    }, {
      key: "isRead",
      value: function isRead() {
        return !!(this.flag & Reference.READ);
      }
  
      /**
       * Whether the reference is read-only.
       * @method Reference#isReadOnly
       * @return {boolean}
       */
  
    }, {
      key: "isReadOnly",
      value: function isReadOnly() {
        return this.flag === Reference.READ;
      }
  
      /**
       * Whether the reference is write-only.
       * @method Reference#isWriteOnly
       * @return {boolean}
       */
  
    }, {
      key: "isWriteOnly",
      value: function isWriteOnly() {
        return this.flag === Reference.WRITE;
      }
  
      /**
       * Whether the reference is read-write.
       * @method Reference#isReadWrite
       * @return {boolean}
       */
  
    }, {
      key: "isReadWrite",
      value: function isReadWrite() {
        return this.flag === Reference.RW;
      }
    }]);
  
    return Reference;
  }();
  
  /**
   * @constant Reference.READ
   * @private
   */
  
  
  exports.default = Reference;
  Reference.READ = READ;
  /**
   * @constant Reference.WRITE
   * @private
   */
  Reference.WRITE = WRITE;
  /**
   * @constant Reference.RW
   * @private
   */
  Reference.RW = RW;
  
  /* vim: set sw=4 ts=4 et tw=80 : */
  
  
  },{}],81:[function(require,module,exports){
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
  
  var _estraverse = require('estraverse');
  
  var _esrecurse = require('esrecurse');
  
  var _esrecurse2 = _interopRequireDefault(_esrecurse);
  
  var _reference = require('./reference');
  
  var _reference2 = _interopRequireDefault(_reference);
  
  var _variable = require('./variable');
  
  var _variable2 = _interopRequireDefault(_variable);
  
  var _patternVisitor = require('./pattern-visitor');
  
  var _patternVisitor2 = _interopRequireDefault(_patternVisitor);
  
  var _definition = require('./definition');
  
  var _assert = require('assert');
  
  var _assert2 = _interopRequireDefault(_assert);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  
  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
  
  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   Copyright (C) 2015 Yusuke Suzuki <utatane.tea@gmail.com>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   Redistribution and use in source and binary forms, with or without
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   modification, are permitted provided that the following conditions are met:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Redistributions of source code must retain the above copyright
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       notice, this list of conditions and the following disclaimer.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * Redistributions in binary form must reproduce the above copyright
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       notice, this list of conditions and the following disclaimer in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       documentation and/or other materials provided with the distribution.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 */
  
  
  function traverseIdentifierInPattern(options, rootPattern, referencer, callback) {
      // Call the callback at left hand identifier nodes, and Collect right hand nodes.
      var visitor = new _patternVisitor2.default(options, rootPattern, callback);
      visitor.visit(rootPattern);
  
      // Process the right hand nodes recursively.
      if (referencer != null) {
          visitor.rightHandNodes.forEach(referencer.visit, referencer);
      }
  }
  
  // Importing ImportDeclaration.
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-moduledeclarationinstantiation
  // https://github.com/estree/estree/blob/master/es6.md#importdeclaration
  // FIXME: Now, we don't create module environment, because the context is
  // implementation dependent.
  
  var Importer = function (_esrecurse$Visitor) {
      _inherits(Importer, _esrecurse$Visitor);
  
      function Importer(declaration, referencer) {
          _classCallCheck(this, Importer);
  
          var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Importer).call(this, null, referencer.options));
  
          _this.declaration = declaration;
          _this.referencer = referencer;
          return _this;
      }
  
      _createClass(Importer, [{
          key: 'visitImport',
          value: function visitImport(id, specifier) {
              var _this2 = this;
  
              this.referencer.visitPattern(id, function (pattern) {
                  _this2.referencer.currentScope().__define(pattern, new _definition.Definition(_variable2.default.ImportBinding, pattern, specifier, _this2.declaration, null, null));
              });
          }
      }, {
          key: 'ImportNamespaceSpecifier',
          value: function ImportNamespaceSpecifier(node) {
              var local = node.local || node.id;
              if (local) {
                  this.visitImport(local, node);
              }
          }
      }, {
          key: 'ImportDefaultSpecifier',
          value: function ImportDefaultSpecifier(node) {
              var local = node.local || node.id;
              this.visitImport(local, node);
          }
      }, {
          key: 'ImportSpecifier',
          value: function ImportSpecifier(node) {
              var local = node.local || node.id;
              if (node.name) {
                  this.visitImport(node.name, node);
              } else {
                  this.visitImport(local, node);
              }
          }
      }]);
  
      return Importer;
  }(_esrecurse2.default.Visitor);
  
  // Referencing variables and creating bindings.
  
  
  var Referencer = function (_esrecurse$Visitor2) {
      _inherits(Referencer, _esrecurse$Visitor2);
  
      function Referencer(options, scopeManager) {
          _classCallCheck(this, Referencer);
  
          var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(Referencer).call(this, null, options));
  
          _this3.options = options;
          _this3.scopeManager = scopeManager;
          _this3.parent = null;
          _this3.isInnerMethodDefinition = false;
          return _this3;
      }
  
      _createClass(Referencer, [{
          key: 'currentScope',
          value: function currentScope() {
              return this.scopeManager.__currentScope;
          }
      }, {
          key: 'close',
          value: function close(node) {
              while (this.currentScope() && node === this.currentScope().block) {
                  this.scopeManager.__currentScope = this.currentScope().__close(this.scopeManager);
              }
          }
      }, {
          key: 'pushInnerMethodDefinition',
          value: function pushInnerMethodDefinition(isInnerMethodDefinition) {
              var previous = this.isInnerMethodDefinition;
              this.isInnerMethodDefinition = isInnerMethodDefinition;
              return previous;
          }
      }, {
          key: 'popInnerMethodDefinition',
          value: function popInnerMethodDefinition(isInnerMethodDefinition) {
              this.isInnerMethodDefinition = isInnerMethodDefinition;
          }
      }, {
          key: 'materializeTDZScope',
          value: function materializeTDZScope(node, iterationNode) {
              // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-runtime-semantics-forin-div-ofexpressionevaluation-abstract-operation
              // TDZ scope hides the declaration's names.
              this.scopeManager.__nestTDZScope(node, iterationNode);
              this.visitVariableDeclaration(this.currentScope(), _variable2.default.TDZ, iterationNode.left, 0, true);
          }
      }, {
          key: 'materializeIterationScope',
          value: function materializeIterationScope(node) {
              var _this4 = this;
  
              // Generate iteration scope for upper ForIn/ForOf Statements.
              var letOrConstDecl;
              this.scopeManager.__nestForScope(node);
              letOrConstDecl = node.left;
              this.visitVariableDeclaration(this.currentScope(), _variable2.default.Variable, letOrConstDecl, 0);
              this.visitPattern(letOrConstDecl.declarations[0].id, function (pattern) {
                  _this4.currentScope().__referencing(pattern, _reference2.default.WRITE, node.right, null, true, true);
              });
          }
      }, {
          key: 'referencingDefaultValue',
          value: function referencingDefaultValue(pattern, assignments, maybeImplicitGlobal, init) {
              var scope = this.currentScope();
              assignments.forEach(function (assignment) {
                  scope.__referencing(pattern, _reference2.default.WRITE, assignment.right, maybeImplicitGlobal, pattern !== assignment.left, init);
              });
          }
      }, {
          key: 'visitPattern',
          value: function visitPattern(node, options, callback) {
              if (typeof options === 'function') {
                  callback = options;
                  options = { processRightHandNodes: false };
              }
              traverseIdentifierInPattern(this.options, node, options.processRightHandNodes ? this : null, callback);
          }
      }, {
          key: 'visitFunction',
          value: function visitFunction(node) {
              var _this5 = this;
  
              var i, iz;
              // FunctionDeclaration name is defined in upper scope
              // NOTE: Not referring variableScope. It is intended.
              // Since
              //  in ES5, FunctionDeclaration should be in FunctionBody.
              //  in ES6, FunctionDeclaration should be block scoped.
              if (node.type === _estraverse.Syntax.FunctionDeclaration) {
                  // id is defined in upper scope
                  this.currentScope().__define(node.id, new _definition.Definition(_variable2.default.FunctionName, node.id, node, null, null, null));
              }
  
              // FunctionExpression with name creates its special scope;
              // FunctionExpressionNameScope.
              if (node.type === _estraverse.Syntax.FunctionExpression && node.id) {
                  this.scopeManager.__nestFunctionExpressionNameScope(node);
              }
  
              // Consider this function is in the MethodDefinition.
              this.scopeManager.__nestFunctionScope(node, this.isInnerMethodDefinition);
  
              // Process parameter declarations.
              for (i = 0, iz = node.params.length; i < iz; ++i) {
                  this.visitPattern(node.params[i], { processRightHandNodes: true }, function (pattern, info) {
                      _this5.currentScope().__define(pattern, new _definition.ParameterDefinition(pattern, node, i, info.rest));
  
                      _this5.referencingDefaultValue(pattern, info.assignments, null, true);
                  });
              }
  
              // if there's a rest argument, add that
              if (node.rest) {
                  this.visitPattern({
                      type: 'RestElement',
                      argument: node.rest
                  }, function (pattern) {
                      _this5.currentScope().__define(pattern, new _definition.ParameterDefinition(pattern, node, node.params.length, true));
                  });
              }
  
              // Skip BlockStatement to prevent creating BlockStatement scope.
              if (node.body.type === _estraverse.Syntax.BlockStatement) {
                  this.visitChildren(node.body);
              } else {
                  this.visit(node.body);
              }
  
              this.close(node);
          }
      }, {
          key: 'visitClass',
          value: function visitClass(node) {
              if (node.type === _estraverse.Syntax.ClassDeclaration) {
                  this.currentScope().__define(node.id, new _definition.Definition(_variable2.default.ClassName, node.id, node, null, null, null));
              }
  
              // FIXME: Maybe consider TDZ.
              this.visit(node.superClass);
  
              this.scopeManager.__nestClassScope(node);
  
              if (node.id) {
                  this.currentScope().__define(node.id, new _definition.Definition(_variable2.default.ClassName, node.id, node));
              }
              this.visit(node.body);
  
              this.close(node);
          }
      }, {
          key: 'visitProperty',
          value: function visitProperty(node) {
              var previous, isMethodDefinition;
              if (node.computed) {
                  this.visit(node.key);
              }
  
              isMethodDefinition = node.type === _estraverse.Syntax.MethodDefinition;
              if (isMethodDefinition) {
                  previous = this.pushInnerMethodDefinition(true);
              }
              this.visit(node.value);
              if (isMethodDefinition) {
                  this.popInnerMethodDefinition(previous);
              }
          }
      }, {
          key: 'visitForIn',
          value: function visitForIn(node) {
              var _this6 = this;
  
              if (node.left.type === _estraverse.Syntax.VariableDeclaration && node.left.kind !== 'var') {
                  this.materializeTDZScope(node.right, node);
                  this.visit(node.right);
                  this.close(node.right);
  
                  this.materializeIterationScope(node);
                  this.visit(node.body);
                  this.close(node);
              } else {
                  if (node.left.type === _estraverse.Syntax.VariableDeclaration) {
                      this.visit(node.left);
                      this.visitPattern(node.left.declarations[0].id, function (pattern) {
                          _this6.currentScope().__referencing(pattern, _reference2.default.WRITE, node.right, null, true, true);
                      });
                  } else {
                      this.visitPattern(node.left, { processRightHandNodes: true }, function (pattern, info) {
                          var maybeImplicitGlobal = null;
                          if (!_this6.currentScope().isStrict) {
                              maybeImplicitGlobal = {
                                  pattern: pattern,
                                  node: node
                              };
                          }
                          _this6.referencingDefaultValue(pattern, info.assignments, maybeImplicitGlobal, false);
                          _this6.currentScope().__referencing(pattern, _reference2.default.WRITE, node.right, maybeImplicitGlobal, true, false);
                      });
                  }
                  this.visit(node.right);
                  this.visit(node.body);
              }
          }
      }, {
          key: 'visitVariableDeclaration',
          value: function visitVariableDeclaration(variableTargetScope, type, node, index, fromTDZ) {
              var _this7 = this;
  
              // If this was called to initialize a TDZ scope, this needs to make definitions, but doesn't make references.
              var decl, init;
  
              decl = node.declarations[index];
              init = decl.init;
              this.visitPattern(decl.id, { processRightHandNodes: !fromTDZ }, function (pattern, info) {
                  variableTargetScope.__define(pattern, new _definition.Definition(type, pattern, decl, node, index, node.kind));
  
                  if (!fromTDZ) {
                      _this7.referencingDefaultValue(pattern, info.assignments, null, true);
                  }
                  if (init) {
                      _this7.currentScope().__referencing(pattern, _reference2.default.WRITE, init, null, !info.topLevel, true);
                  }
              });
          }
      }, {
          key: 'AssignmentExpression',
          value: function AssignmentExpression(node) {
              var _this8 = this;
  
              if (_patternVisitor2.default.isPattern(node.left)) {
                  if (node.operator === '=') {
                      this.visitPattern(node.left, { processRightHandNodes: true }, function (pattern, info) {
                          var maybeImplicitGlobal = null;
                          if (!_this8.currentScope().isStrict) {
                              maybeImplicitGlobal = {
                                  pattern: pattern,
                                  node: node
                              };
                          }
                          _this8.referencingDefaultValue(pattern, info.assignments, maybeImplicitGlobal, false);
                          _this8.currentScope().__referencing(pattern, _reference2.default.WRITE, node.right, maybeImplicitGlobal, !info.topLevel, false);
                      });
                  } else {
                      this.currentScope().__referencing(node.left, _reference2.default.RW, node.right);
                  }
              } else {
                  this.visit(node.left);
              }
              this.visit(node.right);
          }
      }, {
          key: 'CatchClause',
          value: function CatchClause(node) {
              var _this9 = this;
  
              this.scopeManager.__nestCatchScope(node);
  
              this.visitPattern(node.param, { processRightHandNodes: true }, function (pattern, info) {
                  _this9.currentScope().__define(pattern, new _definition.Definition(_variable2.default.CatchClause, node.param, node, null, null, null));
                  _this9.referencingDefaultValue(pattern, info.assignments, null, true);
              });
              this.visit(node.body);
  
              this.close(node);
          }
      }, {
          key: 'Program',
          value: function Program(node) {
              this.scopeManager.__nestGlobalScope(node);
  
              if (this.scopeManager.__isNodejsScope()) {
                  // Force strictness of GlobalScope to false when using node.js scope.
                  this.currentScope().isStrict = false;
                  this.scopeManager.__nestFunctionScope(node, false);
              }
  
              if (this.scopeManager.__isES6() && this.scopeManager.isModule()) {
                  this.scopeManager.__nestModuleScope(node);
              }
  
              if (this.scopeManager.isStrictModeSupported() && this.scopeManager.isImpliedStrict()) {
                  this.currentScope().isStrict = true;
              }
  
              this.visitChildren(node);
              this.close(node);
          }
      }, {
          key: 'Identifier',
          value: function Identifier(node) {
              this.currentScope().__referencing(node);
          }
      }, {
          key: 'UpdateExpression',
          value: function UpdateExpression(node) {
              if (_patternVisitor2.default.isPattern(node.argument)) {
                  this.currentScope().__referencing(node.argument, _reference2.default.RW, null);
              } else {
                  this.visitChildren(node);
              }
          }
      }, {
          key: 'MemberExpression',
          value: function MemberExpression(node) {
              this.visit(node.object);
              if (node.computed) {
                  this.visit(node.property);
              }
          }
      }, {
          key: 'Property',
          value: function Property(node) {
              this.visitProperty(node);
          }
      }, {
          key: 'MethodDefinition',
          value: function MethodDefinition(node) {
              this.visitProperty(node);
          }
      }, {
          key: 'BreakStatement',
          value: function BreakStatement() {}
      }, {
          key: 'ContinueStatement',
          value: function ContinueStatement() {}
      }, {
          key: 'LabeledStatement',
          value: function LabeledStatement(node) {
              this.visit(node.body);
          }
      }, {
          key: 'ForStatement',
          value: function ForStatement(node) {
              // Create ForStatement declaration.
              // NOTE: In ES6, ForStatement dynamically generates
              // per iteration environment. However, escope is
              // a static analyzer, we only generate one scope for ForStatement.
              if (node.init && node.init.type === _estraverse.Syntax.VariableDeclaration && node.init.kind !== 'var') {
                  this.scopeManager.__nestForScope(node);
              }
  
              this.visitChildren(node);
  
              this.close(node);
          }
      }, {
          key: 'ClassExpression',
          value: function ClassExpression(node) {
              this.visitClass(node);
          }
      }, {
          key: 'ClassDeclaration',
          value: function ClassDeclaration(node) {
              this.visitClass(node);
          }
      }, {
          key: 'CallExpression',
          value: function CallExpression(node) {
              // Check this is direct call to eval
              if (!this.scopeManager.__ignoreEval() && node.callee.type === _estraverse.Syntax.Identifier && node.callee.name === 'eval') {
                  // NOTE: This should be `variableScope`. Since direct eval call always creates Lexical environment and
                  // let / const should be enclosed into it. Only VariableDeclaration affects on the caller's environment.
                  this.currentScope().variableScope.__detectEval();
              }
              this.visitChildren(node);
          }
      }, {
          key: 'BlockStatement',
          value: function BlockStatement(node) {
              if (this.scopeManager.__isES6()) {
                  this.scopeManager.__nestBlockScope(node);
              }
  
              this.visitChildren(node);
  
              this.close(node);
          }
      }, {
          key: 'ThisExpression',
          value: function ThisExpression() {
              this.currentScope().variableScope.__detectThis();
          }
      }, {
          key: 'WithStatement',
          value: function WithStatement(node) {
              this.visit(node.object);
              // Then nest scope for WithStatement.
              this.scopeManager.__nestWithScope(node);
  
              this.visit(node.body);
  
              this.close(node);
          }
      }, {
          key: 'VariableDeclaration',
          value: function VariableDeclaration(node) {
              var variableTargetScope, i, iz, decl;
              variableTargetScope = node.kind === 'var' ? this.currentScope().variableScope : this.currentScope();
              for (i = 0, iz = node.declarations.length; i < iz; ++i) {
                  decl = node.declarations[i];
                  this.visitVariableDeclaration(variableTargetScope, _variable2.default.Variable, node, i);
                  if (decl.init) {
                      this.visit(decl.init);
                  }
              }
          }
  
          // sec 13.11.8
  
      }, {
          key: 'SwitchStatement',
          value: function SwitchStatement(node) {
              var i, iz;
  
              this.visit(node.discriminant);
  
              if (this.scopeManager.__isES6()) {
                  this.scopeManager.__nestSwitchScope(node);
              }
  
              for (i = 0, iz = node.cases.length; i < iz; ++i) {
                  this.visit(node.cases[i]);
              }
  
              this.close(node);
          }
      }, {
          key: 'FunctionDeclaration',
          value: function FunctionDeclaration(node) {
              this.visitFunction(node);
          }
      }, {
          key: 'FunctionExpression',
          value: function FunctionExpression(node) {
              this.visitFunction(node);
          }
      }, {
          key: 'ForOfStatement',
          value: function ForOfStatement(node) {
              this.visitForIn(node);
          }
      }, {
          key: 'ForInStatement',
          value: function ForInStatement(node) {
              this.visitForIn(node);
          }
      }, {
          key: 'ArrowFunctionExpression',
          value: function ArrowFunctionExpression(node) {
              this.visitFunction(node);
          }
      }, {
          key: 'ImportDeclaration',
          value: function ImportDeclaration(node) {
              var importer;
  
              (0, _assert2.default)(this.scopeManager.__isES6() && this.scopeManager.isModule(), 'ImportDeclaration should appear when the mode is ES6 and in the module context.');
  
              importer = new Importer(node, this);
              importer.visit(node);
          }
      }, {
          key: 'visitExportDeclaration',
          value: function visitExportDeclaration(node) {
              if (node.source) {
                  return;
              }
              if (node.declaration) {
                  this.visit(node.declaration);
                  return;
              }
  
              this.visitChildren(node);
          }
      }, {
          key: 'ExportDeclaration',
          value: function ExportDeclaration(node) {
              this.visitExportDeclaration(node);
          }
      }, {
          key: 'ExportNamedDeclaration',
          value: function ExportNamedDeclaration(node) {
              this.visitExportDeclaration(node);
          }
      }, {
          key: 'ExportSpecifier',
          value: function ExportSpecifier(node) {
              var local = node.id || node.local;
              this.visit(local);
          }
      }, {
          key: 'MetaProperty',
          value: function MetaProperty() {
              // do nothing.
          }
      }]);
  
      return Referencer;
  }(_esrecurse2.default.Visitor);
  
  /* vim: set sw=4 ts=4 et tw=80 : */
  
  
  exports.default = Referencer;
  
  
  },{"./definition":77,"./pattern-visitor":79,"./reference":80,"./variable":84,"assert":1,"esrecurse":89,"estraverse":85}],82:[function(require,module,exports){
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         Copyright (C) 2015 Yusuke Suzuki <utatane.tea@gmail.com>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         Redistribution and use in source and binary forms, with or without
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         modification, are permitted provided that the following conditions are met:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * Redistributions of source code must retain the above copyright
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             notice, this list of conditions and the following disclaimer.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * Redistributions in binary form must reproduce the above copyright
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             notice, this list of conditions and the following disclaimer in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             documentation and/or other materials provided with the distribution.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       */
  
  var _es6WeakMap = require('es6-weak-map');
  
  var _es6WeakMap2 = _interopRequireDefault(_es6WeakMap);
  
  var _scope = require('./scope');
  
  var _scope2 = _interopRequireDefault(_scope);
  
  var _assert = require('assert');
  
  var _assert2 = _interopRequireDefault(_assert);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  
  /**
   * @class ScopeManager
   */
  
  var ScopeManager = function () {
      function ScopeManager(options) {
          _classCallCheck(this, ScopeManager);
  
          this.scopes = [];
          this.globalScope = null;
          this.__nodeToScope = new _es6WeakMap2.default();
          this.__currentScope = null;
          this.__options = options;
          this.__declaredVariables = new _es6WeakMap2.default();
      }
  
      _createClass(ScopeManager, [{
          key: '__useDirective',
          value: function __useDirective() {
              return this.__options.directive;
          }
      }, {
          key: '__isOptimistic',
          value: function __isOptimistic() {
              return this.__options.optimistic;
          }
      }, {
          key: '__ignoreEval',
          value: function __ignoreEval() {
              return this.__options.ignoreEval;
          }
      }, {
          key: '__isNodejsScope',
          value: function __isNodejsScope() {
              return this.__options.nodejsScope;
          }
      }, {
          key: 'isModule',
          value: function isModule() {
              return this.__options.sourceType === 'module';
          }
      }, {
          key: 'isImpliedStrict',
          value: function isImpliedStrict() {
              return this.__options.impliedStrict;
          }
      }, {
          key: 'isStrictModeSupported',
          value: function isStrictModeSupported() {
              return this.__options.ecmaVersion >= 5;
          }
  
          // Returns appropriate scope for this node.
  
      }, {
          key: '__get',
          value: function __get(node) {
              return this.__nodeToScope.get(node);
          }
  
          /**
           * Get variables that are declared by the node.
           *
           * "are declared by the node" means the node is same as `Variable.defs[].node` or `Variable.defs[].parent`.
           * If the node declares nothing, this method returns an empty array.
           * CAUTION: This API is experimental. See https://github.com/estools/escope/pull/69 for more details.
           *
           * @param {Esprima.Node} node - a node to get.
           * @returns {Variable[]} variables that declared by the node.
           */
  
      }, {
          key: 'getDeclaredVariables',
          value: function getDeclaredVariables(node) {
              return this.__declaredVariables.get(node) || [];
          }
  
          /**
           * acquire scope from node.
           * @method ScopeManager#acquire
           * @param {Esprima.Node} node - node for the acquired scope.
           * @param {boolean=} inner - look up the most inner scope, default value is false.
           * @return {Scope?}
           */
  
      }, {
          key: 'acquire',
          value: function acquire(node, inner) {
              var scopes, scope, i, iz;
  
              function predicate(scope) {
                  if (scope.type === 'function' && scope.functionExpressionScope) {
                      return false;
                  }
                  if (scope.type === 'TDZ') {
                      return false;
                  }
                  return true;
              }
  
              scopes = this.__get(node);
              if (!scopes || scopes.length === 0) {
                  return null;
              }
  
              // Heuristic selection from all scopes.
              // If you would like to get all scopes, please use ScopeManager#acquireAll.
              if (scopes.length === 1) {
                  return scopes[0];
              }
  
              if (inner) {
                  for (i = scopes.length - 1; i >= 0; --i) {
                      scope = scopes[i];
                      if (predicate(scope)) {
                          return scope;
                      }
                  }
              } else {
                  for (i = 0, iz = scopes.length; i < iz; ++i) {
                      scope = scopes[i];
                      if (predicate(scope)) {
                          return scope;
                      }
                  }
              }
  
              return null;
          }
  
          /**
           * acquire all scopes from node.
           * @method ScopeManager#acquireAll
           * @param {Esprima.Node} node - node for the acquired scope.
           * @return {Scope[]?}
           */
  
      }, {
          key: 'acquireAll',
          value: function acquireAll(node) {
              return this.__get(node);
          }
  
          /**
           * release the node.
           * @method ScopeManager#release
           * @param {Esprima.Node} node - releasing node.
           * @param {boolean=} inner - look up the most inner scope, default value is false.
           * @return {Scope?} upper scope for the node.
           */
  
      }, {
          key: 'release',
          value: function release(node, inner) {
              var scopes, scope;
              scopes = this.__get(node);
              if (scopes && scopes.length) {
                  scope = scopes[0].upper;
                  if (!scope) {
                      return null;
                  }
                  return this.acquire(scope.block, inner);
              }
              return null;
          }
      }, {
          key: 'attach',
          value: function attach() {}
      }, {
          key: 'detach',
          value: function detach() {}
      }, {
          key: '__nestScope',
          value: function __nestScope(scope) {
              if (scope instanceof _scope.GlobalScope) {
                  (0, _assert2.default)(this.__currentScope === null);
                  this.globalScope = scope;
              }
              this.__currentScope = scope;
              return scope;
          }
      }, {
          key: '__nestGlobalScope',
          value: function __nestGlobalScope(node) {
              return this.__nestScope(new _scope.GlobalScope(this, node));
          }
      }, {
          key: '__nestBlockScope',
          value: function __nestBlockScope(node, isMethodDefinition) {
              return this.__nestScope(new _scope.BlockScope(this, this.__currentScope, node));
          }
      }, {
          key: '__nestFunctionScope',
          value: function __nestFunctionScope(node, isMethodDefinition) {
              return this.__nestScope(new _scope.FunctionScope(this, this.__currentScope, node, isMethodDefinition));
          }
      }, {
          key: '__nestForScope',
          value: function __nestForScope(node) {
              return this.__nestScope(new _scope.ForScope(this, this.__currentScope, node));
          }
      }, {
          key: '__nestCatchScope',
          value: function __nestCatchScope(node) {
              return this.__nestScope(new _scope.CatchScope(this, this.__currentScope, node));
          }
      }, {
          key: '__nestWithScope',
          value: function __nestWithScope(node) {
              return this.__nestScope(new _scope.WithScope(this, this.__currentScope, node));
          }
      }, {
          key: '__nestClassScope',
          value: function __nestClassScope(node) {
              return this.__nestScope(new _scope.ClassScope(this, this.__currentScope, node));
          }
      }, {
          key: '__nestSwitchScope',
          value: function __nestSwitchScope(node) {
              return this.__nestScope(new _scope.SwitchScope(this, this.__currentScope, node));
          }
      }, {
          key: '__nestModuleScope',
          value: function __nestModuleScope(node) {
              return this.__nestScope(new _scope.ModuleScope(this, this.__currentScope, node));
          }
      }, {
          key: '__nestTDZScope',
          value: function __nestTDZScope(node) {
              return this.__nestScope(new _scope.TDZScope(this, this.__currentScope, node));
          }
      }, {
          key: '__nestFunctionExpressionNameScope',
          value: function __nestFunctionExpressionNameScope(node) {
              return this.__nestScope(new _scope.FunctionExpressionNameScope(this, this.__currentScope, node));
          }
      }, {
          key: '__isES6',
          value: function __isES6() {
              return this.__options.ecmaVersion >= 6;
          }
      }]);
  
      return ScopeManager;
  }();
  
  /* vim: set sw=4 ts=4 et tw=80 : */
  
  
  exports.default = ScopeManager;
  
  
  },{"./scope":83,"assert":1,"es6-weak-map":73}],83:[function(require,module,exports){
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.ClassScope = exports.ForScope = exports.FunctionScope = exports.SwitchScope = exports.BlockScope = exports.TDZScope = exports.WithScope = exports.CatchScope = exports.FunctionExpressionNameScope = exports.ModuleScope = exports.GlobalScope = undefined;
  
  var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };
  
  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         Copyright (C) 2015 Yusuke Suzuki <utatane.tea@gmail.com>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         Redistribution and use in source and binary forms, with or without
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         modification, are permitted provided that the following conditions are met:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * Redistributions of source code must retain the above copyright
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             notice, this list of conditions and the following disclaimer.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * Redistributions in binary form must reproduce the above copyright
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             notice, this list of conditions and the following disclaimer in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             documentation and/or other materials provided with the distribution.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       */
  
  var _estraverse = require('estraverse');
  
  var _es6Map = require('es6-map');
  
  var _es6Map2 = _interopRequireDefault(_es6Map);
  
  var _reference = require('./reference');
  
  var _reference2 = _interopRequireDefault(_reference);
  
  var _variable = require('./variable');
  
  var _variable2 = _interopRequireDefault(_variable);
  
  var _definition = require('./definition');
  
  var _definition2 = _interopRequireDefault(_definition);
  
  var _assert = require('assert');
  
  var _assert2 = _interopRequireDefault(_assert);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
  
  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
  
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  
  function isStrictScope(scope, block, isMethodDefinition, useDirective) {
      var body, i, iz, stmt, expr;
  
      // When upper scope is exists and strict, inner scope is also strict.
      if (scope.upper && scope.upper.isStrict) {
          return true;
      }
  
      // ArrowFunctionExpression's scope is always strict scope.
      if (block.type === _estraverse.Syntax.ArrowFunctionExpression) {
          return true;
      }
  
      if (isMethodDefinition) {
          return true;
      }
  
      if (scope.type === 'class' || scope.type === 'module') {
          return true;
      }
  
      if (scope.type === 'block' || scope.type === 'switch') {
          return false;
      }
  
      if (scope.type === 'function') {
          if (block.type === _estraverse.Syntax.Program) {
              body = block;
          } else {
              body = block.body;
          }
      } else if (scope.type === 'global') {
          body = block;
      } else {
          return false;
      }
  
      // Search 'use strict' directive.
      if (useDirective) {
          for (i = 0, iz = body.body.length; i < iz; ++i) {
              stmt = body.body[i];
              if (stmt.type !== _estraverse.Syntax.DirectiveStatement) {
                  break;
              }
              if (stmt.raw === '"use strict"' || stmt.raw === '\'use strict\'') {
                  return true;
              }
          }
      } else {
          for (i = 0, iz = body.body.length; i < iz; ++i) {
              stmt = body.body[i];
              if (stmt.type !== _estraverse.Syntax.ExpressionStatement) {
                  break;
              }
              expr = stmt.expression;
              if (expr.type !== _estraverse.Syntax.Literal || typeof expr.value !== 'string') {
                  break;
              }
              if (expr.raw != null) {
                  if (expr.raw === '"use strict"' || expr.raw === '\'use strict\'') {
                      return true;
                  }
              } else {
                  if (expr.value === 'use strict') {
                      return true;
                  }
              }
          }
      }
      return false;
  }
  
  function registerScope(scopeManager, scope) {
      var scopes;
  
      scopeManager.scopes.push(scope);
  
      scopes = scopeManager.__nodeToScope.get(scope.block);
      if (scopes) {
          scopes.push(scope);
      } else {
          scopeManager.__nodeToScope.set(scope.block, [scope]);
      }
  }
  
  function shouldBeStatically(def) {
      return def.type === _variable2.default.ClassName || def.type === _variable2.default.Variable && def.parent.kind !== 'var';
  }
  
  /**
   * @class Scope
   */
  
  var Scope = function () {
      function Scope(scopeManager, type, upperScope, block, isMethodDefinition) {
          _classCallCheck(this, Scope);
  
          /**
           * One of 'TDZ', 'module', 'block', 'switch', 'function', 'catch', 'with', 'function', 'class', 'global'.
           * @member {String} Scope#type
           */
          this.type = type;
          /**
          * The scoped {@link Variable}s of this scope, as <code>{ Variable.name
          * : Variable }</code>.
          * @member {Map} Scope#set
          */
          this.set = new _es6Map2.default();
          /**
           * The tainted variables of this scope, as <code>{ Variable.name :
           * boolean }</code>.
           * @member {Map} Scope#taints */
          this.taints = new _es6Map2.default();
          /**
           * Generally, through the lexical scoping of JS you can always know
           * which variable an identifier in the source code refers to. There are
           * a few exceptions to this rule. With 'global' and 'with' scopes you
           * can only decide at runtime which variable a reference refers to.
           * Moreover, if 'eval()' is used in a scope, it might introduce new
           * bindings in this or its parent scopes.
           * All those scopes are considered 'dynamic'.
           * @member {boolean} Scope#dynamic
           */
          this.dynamic = this.type === 'global' || this.type === 'with';
          /**
           * A reference to the scope-defining syntax node.
           * @member {esprima.Node} Scope#block
           */
          this.block = block;
          /**
          * The {@link Reference|references} that are not resolved with this scope.
          * @member {Reference[]} Scope#through
          */
          this.through = [];
          /**
          * The scoped {@link Variable}s of this scope. In the case of a
          * 'function' scope this includes the automatic argument <em>arguments</em> as
          * its first element, as well as all further formal arguments.
          * @member {Variable[]} Scope#variables
          */
          this.variables = [];
          /**
          * Any variable {@link Reference|reference} found in this scope. This
          * includes occurrences of local variables as well as variables from
          * parent scopes (including the global scope). For local variables
          * this also includes defining occurrences (like in a 'var' statement).
          * In a 'function' scope this does not include the occurrences of the
          * formal parameter in the parameter list.
          * @member {Reference[]} Scope#references
          */
          this.references = [];
  
          /**
          * For 'global' and 'function' scopes, this is a self-reference. For
          * other scope types this is the <em>variableScope</em> value of the
          * parent scope.
          * @member {Scope} Scope#variableScope
          */
          this.variableScope = this.type === 'global' || this.type === 'function' || this.type === 'module' ? this : upperScope.variableScope;
          /**
          * Whether this scope is created by a FunctionExpression.
          * @member {boolean} Scope#functionExpressionScope
          */
          this.functionExpressionScope = false;
          /**
          * Whether this is a scope that contains an 'eval()' invocation.
          * @member {boolean} Scope#directCallToEvalScope
          */
          this.directCallToEvalScope = false;
          /**
          * @member {boolean} Scope#thisFound
          */
          this.thisFound = false;
  
          this.__left = [];
  
          /**
          * Reference to the parent {@link Scope|scope}.
          * @member {Scope} Scope#upper
          */
          this.upper = upperScope;
          /**
          * Whether 'use strict' is in effect in this scope.
          * @member {boolean} Scope#isStrict
          */
          this.isStrict = isStrictScope(this, block, isMethodDefinition, scopeManager.__useDirective());
  
          /**
          * List of nested {@link Scope}s.
          * @member {Scope[]} Scope#childScopes
          */
          this.childScopes = [];
          if (this.upper) {
              this.upper.childScopes.push(this);
          }
  
          this.__declaredVariables = scopeManager.__declaredVariables;
  
          registerScope(scopeManager, this);
      }
  
      _createClass(Scope, [{
          key: '__shouldStaticallyClose',
          value: function __shouldStaticallyClose(scopeManager) {
              return !this.dynamic || scopeManager.__isOptimistic();
          }
      }, {
          key: '__shouldStaticallyCloseForGlobal',
          value: function __shouldStaticallyCloseForGlobal(ref) {
              // On global scope, let/const/class declarations should be resolved statically.
              var name = ref.identifier.name;
              if (!this.set.has(name)) {
                  return false;
              }
  
              var variable = this.set.get(name);
              var defs = variable.defs;
              return defs.length > 0 && defs.every(shouldBeStatically);
          }
      }, {
          key: '__staticCloseRef',
          value: function __staticCloseRef(ref) {
              if (!this.__resolve(ref)) {
                  this.__delegateToUpperScope(ref);
              }
          }
      }, {
          key: '__dynamicCloseRef',
          value: function __dynamicCloseRef(ref) {
              // notify all names are through to global
              var current = this;
              do {
                  current.through.push(ref);
                  current = current.upper;
              } while (current);
          }
      }, {
          key: '__globalCloseRef',
          value: function __globalCloseRef(ref) {
              // let/const/class declarations should be resolved statically.
              // others should be resolved dynamically.
              if (this.__shouldStaticallyCloseForGlobal(ref)) {
                  this.__staticCloseRef(ref);
              } else {
                  this.__dynamicCloseRef(ref);
              }
          }
      }, {
          key: '__close',
          value: function __close(scopeManager) {
              var closeRef;
              if (this.__shouldStaticallyClose(scopeManager)) {
                  closeRef = this.__staticCloseRef;
              } else if (this.type !== 'global') {
                  closeRef = this.__dynamicCloseRef;
              } else {
                  closeRef = this.__globalCloseRef;
              }
  
              // Try Resolving all references in this scope.
              for (var i = 0, iz = this.__left.length; i < iz; ++i) {
                  var ref = this.__left[i];
                  closeRef.call(this, ref);
              }
              this.__left = null;
  
              return this.upper;
          }
      }, {
          key: '__resolve',
          value: function __resolve(ref) {
              var variable, name;
              name = ref.identifier.name;
              if (this.set.has(name)) {
                  variable = this.set.get(name);
                  variable.references.push(ref);
                  variable.stack = variable.stack && ref.from.variableScope === this.variableScope;
                  if (ref.tainted) {
                      variable.tainted = true;
                      this.taints.set(variable.name, true);
                  }
                  ref.resolved = variable;
                  return true;
              }
              return false;
          }
      }, {
          key: '__delegateToUpperScope',
          value: function __delegateToUpperScope(ref) {
              if (this.upper) {
                  this.upper.__left.push(ref);
              }
              this.through.push(ref);
          }
      }, {
          key: '__addDeclaredVariablesOfNode',
          value: function __addDeclaredVariablesOfNode(variable, node) {
              if (node == null) {
                  return;
              }
  
              var variables = this.__declaredVariables.get(node);
              if (variables == null) {
                  variables = [];
                  this.__declaredVariables.set(node, variables);
              }
              if (variables.indexOf(variable) === -1) {
                  variables.push(variable);
              }
          }
      }, {
          key: '__defineGeneric',
          value: function __defineGeneric(name, set, variables, node, def) {
              var variable;
  
              variable = set.get(name);
              if (!variable) {
                  variable = new _variable2.default(name, this);
                  set.set(name, variable);
                  variables.push(variable);
              }
  
              if (def) {
                  variable.defs.push(def);
                  if (def.type !== _variable2.default.TDZ) {
                      this.__addDeclaredVariablesOfNode(variable, def.node);
                      this.__addDeclaredVariablesOfNode(variable, def.parent);
                  }
              }
              if (node) {
                  variable.identifiers.push(node);
              }
          }
      }, {
          key: '__define',
          value: function __define(node, def) {
              if (node && node.type === _estraverse.Syntax.Identifier) {
                  this.__defineGeneric(node.name, this.set, this.variables, node, def);
              }
          }
      }, {
          key: '__referencing',
          value: function __referencing(node, assign, writeExpr, maybeImplicitGlobal, partial, init) {
              // because Array element may be null
              if (!node || node.type !== _estraverse.Syntax.Identifier) {
                  return;
              }
  
              // Specially handle like `this`.
              if (node.name === 'super') {
                  return;
              }
  
              var ref = new _reference2.default(node, this, assign || _reference2.default.READ, writeExpr, maybeImplicitGlobal, !!partial, !!init);
              this.references.push(ref);
              this.__left.push(ref);
          }
      }, {
          key: '__detectEval',
          value: function __detectEval() {
              var current;
              current = this;
              this.directCallToEvalScope = true;
              do {
                  current.dynamic = true;
                  current = current.upper;
              } while (current);
          }
      }, {
          key: '__detectThis',
          value: function __detectThis() {
              this.thisFound = true;
          }
      }, {
          key: '__isClosed',
          value: function __isClosed() {
              return this.__left === null;
          }
  
          /**
           * returns resolved {Reference}
           * @method Scope#resolve
           * @param {Esprima.Identifier} ident - identifier to be resolved.
           * @return {Reference}
           */
  
      }, {
          key: 'resolve',
          value: function resolve(ident) {
              var ref, i, iz;
              (0, _assert2.default)(this.__isClosed(), 'Scope should be closed.');
              (0, _assert2.default)(ident.type === _estraverse.Syntax.Identifier, 'Target should be identifier.');
              for (i = 0, iz = this.references.length; i < iz; ++i) {
                  ref = this.references[i];
                  if (ref.identifier === ident) {
                      return ref;
                  }
              }
              return null;
          }
  
          /**
           * returns this scope is static
           * @method Scope#isStatic
           * @return {boolean}
           */
  
      }, {
          key: 'isStatic',
          value: function isStatic() {
              return !this.dynamic;
          }
  
          /**
           * returns this scope has materialized arguments
           * @method Scope#isArgumentsMaterialized
           * @return {boolean}
           */
  
      }, {
          key: 'isArgumentsMaterialized',
          value: function isArgumentsMaterialized() {
              return true;
          }
  
          /**
           * returns this scope has materialized `this` reference
           * @method Scope#isThisMaterialized
           * @return {boolean}
           */
  
      }, {
          key: 'isThisMaterialized',
          value: function isThisMaterialized() {
              return true;
          }
      }, {
          key: 'isUsedName',
          value: function isUsedName(name) {
              if (this.set.has(name)) {
                  return true;
              }
              for (var i = 0, iz = this.through.length; i < iz; ++i) {
                  if (this.through[i].identifier.name === name) {
                      return true;
                  }
              }
              return false;
          }
      }]);
  
      return Scope;
  }();
  
  exports.default = Scope;
  
  var GlobalScope = exports.GlobalScope = function (_Scope) {
      _inherits(GlobalScope, _Scope);
  
      function GlobalScope(scopeManager, block) {
          _classCallCheck(this, GlobalScope);
  
          var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(GlobalScope).call(this, scopeManager, 'global', null, block, false));
  
          _this.implicit = {
              set: new _es6Map2.default(),
              variables: [],
              /**
              * List of {@link Reference}s that are left to be resolved (i.e. which
              * need to be linked to the variable they refer to).
              * @member {Reference[]} Scope#implicit#left
              */
              left: []
          };
          return _this;
      }
  
      _createClass(GlobalScope, [{
          key: '__close',
          value: function __close(scopeManager) {
              var implicit = [];
              for (var i = 0, iz = this.__left.length; i < iz; ++i) {
                  var ref = this.__left[i];
                  if (ref.__maybeImplicitGlobal && !this.set.has(ref.identifier.name)) {
                      implicit.push(ref.__maybeImplicitGlobal);
                  }
              }
  
              // create an implicit global variable from assignment expression
              for (var _i = 0, _iz = implicit.length; _i < _iz; ++_i) {
                  var info = implicit[_i];
                  this.__defineImplicit(info.pattern, new _definition2.default(_variable2.default.ImplicitGlobalVariable, info.pattern, info.node, null, null, null));
              }
  
              this.implicit.left = this.__left;
  
              return _get(Object.getPrototypeOf(GlobalScope.prototype), '__close', this).call(this, scopeManager);
          }
      }, {
          key: '__defineImplicit',
          value: function __defineImplicit(node, def) {
              if (node && node.type === _estraverse.Syntax.Identifier) {
                  this.__defineGeneric(node.name, this.implicit.set, this.implicit.variables, node, def);
              }
          }
      }]);
  
      return GlobalScope;
  }(Scope);
  
  var ModuleScope = exports.ModuleScope = function (_Scope2) {
      _inherits(ModuleScope, _Scope2);
  
      function ModuleScope(scopeManager, upperScope, block) {
          _classCallCheck(this, ModuleScope);
  
          return _possibleConstructorReturn(this, Object.getPrototypeOf(ModuleScope).call(this, scopeManager, 'module', upperScope, block, false));
      }
  
      return ModuleScope;
  }(Scope);
  
  var FunctionExpressionNameScope = exports.FunctionExpressionNameScope = function (_Scope3) {
      _inherits(FunctionExpressionNameScope, _Scope3);
  
      function FunctionExpressionNameScope(scopeManager, upperScope, block) {
          _classCallCheck(this, FunctionExpressionNameScope);
  
          var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(FunctionExpressionNameScope).call(this, scopeManager, 'function-expression-name', upperScope, block, false));
  
          _this3.__define(block.id, new _definition2.default(_variable2.default.FunctionName, block.id, block, null, null, null));
          _this3.functionExpressionScope = true;
          return _this3;
      }
  
      return FunctionExpressionNameScope;
  }(Scope);
  
  var CatchScope = exports.CatchScope = function (_Scope4) {
      _inherits(CatchScope, _Scope4);
  
      function CatchScope(scopeManager, upperScope, block) {
          _classCallCheck(this, CatchScope);
  
          return _possibleConstructorReturn(this, Object.getPrototypeOf(CatchScope).call(this, scopeManager, 'catch', upperScope, block, false));
      }
  
      return CatchScope;
  }(Scope);
  
  var WithScope = exports.WithScope = function (_Scope5) {
      _inherits(WithScope, _Scope5);
  
      function WithScope(scopeManager, upperScope, block) {
          _classCallCheck(this, WithScope);
  
          return _possibleConstructorReturn(this, Object.getPrototypeOf(WithScope).call(this, scopeManager, 'with', upperScope, block, false));
      }
  
      _createClass(WithScope, [{
          key: '__close',
          value: function __close(scopeManager) {
              if (this.__shouldStaticallyClose(scopeManager)) {
                  return _get(Object.getPrototypeOf(WithScope.prototype), '__close', this).call(this, scopeManager);
              }
  
              for (var i = 0, iz = this.__left.length; i < iz; ++i) {
                  var ref = this.__left[i];
                  ref.tainted = true;
                  this.__delegateToUpperScope(ref);
              }
              this.__left = null;
  
              return this.upper;
          }
      }]);
  
      return WithScope;
  }(Scope);
  
  var TDZScope = exports.TDZScope = function (_Scope6) {
      _inherits(TDZScope, _Scope6);
  
      function TDZScope(scopeManager, upperScope, block) {
          _classCallCheck(this, TDZScope);
  
          return _possibleConstructorReturn(this, Object.getPrototypeOf(TDZScope).call(this, scopeManager, 'TDZ', upperScope, block, false));
      }
  
      return TDZScope;
  }(Scope);
  
  var BlockScope = exports.BlockScope = function (_Scope7) {
      _inherits(BlockScope, _Scope7);
  
      function BlockScope(scopeManager, upperScope, block) {
          _classCallCheck(this, BlockScope);
  
          return _possibleConstructorReturn(this, Object.getPrototypeOf(BlockScope).call(this, scopeManager, 'block', upperScope, block, false));
      }
  
      return BlockScope;
  }(Scope);
  
  var SwitchScope = exports.SwitchScope = function (_Scope8) {
      _inherits(SwitchScope, _Scope8);
  
      function SwitchScope(scopeManager, upperScope, block) {
          _classCallCheck(this, SwitchScope);
  
          return _possibleConstructorReturn(this, Object.getPrototypeOf(SwitchScope).call(this, scopeManager, 'switch', upperScope, block, false));
      }
  
      return SwitchScope;
  }(Scope);
  
  var FunctionScope = exports.FunctionScope = function (_Scope9) {
      _inherits(FunctionScope, _Scope9);
  
      function FunctionScope(scopeManager, upperScope, block, isMethodDefinition) {
          _classCallCheck(this, FunctionScope);
  
          // section 9.2.13, FunctionDeclarationInstantiation.
          // NOTE Arrow functions never have an arguments objects.
  
          var _this9 = _possibleConstructorReturn(this, Object.getPrototypeOf(FunctionScope).call(this, scopeManager, 'function', upperScope, block, isMethodDefinition));
  
          if (_this9.block.type !== _estraverse.Syntax.ArrowFunctionExpression) {
              _this9.__defineArguments();
          }
          return _this9;
      }
  
      _createClass(FunctionScope, [{
          key: 'isArgumentsMaterialized',
          value: function isArgumentsMaterialized() {
              // TODO(Constellation)
              // We can more aggressive on this condition like this.
              //
              // function t() {
              //     // arguments of t is always hidden.
              //     function arguments() {
              //     }
              // }
              if (this.block.type === _estraverse.Syntax.ArrowFunctionExpression) {
                  return false;
              }
  
              if (!this.isStatic()) {
                  return true;
              }
  
              var variable = this.set.get('arguments');
              (0, _assert2.default)(variable, 'Always have arguments variable.');
              return variable.tainted || variable.references.length !== 0;
          }
      }, {
          key: 'isThisMaterialized',
          value: function isThisMaterialized() {
              if (!this.isStatic()) {
                  return true;
              }
              return this.thisFound;
          }
      }, {
          key: '__defineArguments',
          value: function __defineArguments() {
              this.__defineGeneric('arguments', this.set, this.variables, null, null);
              this.taints.set('arguments', true);
          }
      }]);
  
      return FunctionScope;
  }(Scope);
  
  var ForScope = exports.ForScope = function (_Scope10) {
      _inherits(ForScope, _Scope10);
  
      function ForScope(scopeManager, upperScope, block) {
          _classCallCheck(this, ForScope);
  
          return _possibleConstructorReturn(this, Object.getPrototypeOf(ForScope).call(this, scopeManager, 'for', upperScope, block, false));
      }
  
      return ForScope;
  }(Scope);
  
  var ClassScope = exports.ClassScope = function (_Scope11) {
      _inherits(ClassScope, _Scope11);
  
      function ClassScope(scopeManager, upperScope, block) {
          _classCallCheck(this, ClassScope);
  
          return _possibleConstructorReturn(this, Object.getPrototypeOf(ClassScope).call(this, scopeManager, 'class', upperScope, block, false));
      }
  
      return ClassScope;
  }(Scope);
  
  /* vim: set sw=4 ts=4 et tw=80 : */
  
  
  },{"./definition":77,"./reference":80,"./variable":84,"assert":1,"es6-map":59,"estraverse":85}],84:[function(require,module,exports){
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  
  /*
    Copyright (C) 2015 Yusuke Suzuki <utatane.tea@gmail.com>
  
    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:
  
      * Redistributions of source code must retain the above copyright
        notice, this list of conditions and the following disclaimer.
      * Redistributions in binary form must reproduce the above copyright
        notice, this list of conditions and the following disclaimer in the
        documentation and/or other materials provided with the distribution.
  
    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
    AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
    ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
    DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
    (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
    ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
    THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  */
  
  /**
   * A Variable represents a locally scoped identifier. These include arguments to
   * functions.
   * @class Variable
   */
  
  var Variable = function Variable(name, scope) {
    _classCallCheck(this, Variable);
  
    /**
     * The variable name, as given in the source code.
     * @member {String} Variable#name
     */
    this.name = name;
    /**
     * List of defining occurrences of this variable (like in 'var ...'
     * statements or as parameter), as AST nodes.
     * @member {esprima.Identifier[]} Variable#identifiers
     */
    this.identifiers = [];
    /**
     * List of {@link Reference|references} of this variable (excluding parameter entries)
     * in its defining scope and all nested scopes. For defining
     * occurrences only see {@link Variable#defs}.
     * @member {Reference[]} Variable#references
     */
    this.references = [];
  
    /**
     * List of defining occurrences of this variable (like in 'var ...'
     * statements or as parameter), as custom objects.
     * @member {Definition[]} Variable#defs
     */
    this.defs = [];
  
    this.tainted = false;
    /**
     * Whether this is a stack variable.
     * @member {boolean} Variable#stack
     */
    this.stack = true;
    /**
     * Reference to the enclosing Scope.
     * @member {Scope} Variable#scope
     */
    this.scope = scope;
  };
  
  exports.default = Variable;
  
  
  Variable.CatchClause = 'CatchClause';
  Variable.Parameter = 'Parameter';
  Variable.FunctionName = 'FunctionName';
  Variable.ClassName = 'ClassName';
  Variable.Variable = 'Variable';
  Variable.ImportBinding = 'ImportBinding';
  Variable.TDZ = 'TDZ';
  Variable.ImplicitGlobalVariable = 'ImplicitGlobalVariable';
  
  /* vim: set sw=4 ts=4 et tw=80 : */
  
  
  },{}],85:[function(require,module,exports){
  /*
    Copyright (C) 2012-2013 Yusuke Suzuki <utatane.tea@gmail.com>
    Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>
  
    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:
  
      * Redistributions of source code must retain the above copyright
        notice, this list of conditions and the following disclaimer.
      * Redistributions in binary form must reproduce the above copyright
        notice, this list of conditions and the following disclaimer in the
        documentation and/or other materials provided with the distribution.
  
    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
    AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
    ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
    DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
    (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
    ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
    THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  */
  /*jslint vars:false, bitwise:true*/
  /*jshint indent:4*/
  /*global exports:true*/
  (function clone(exports) {
      'use strict';
  
      var Syntax,
          VisitorOption,
          VisitorKeys,
          BREAK,
          SKIP,
          REMOVE;
  
      function deepCopy(obj) {
          var ret = {}, key, val;
          for (key in obj) {
              if (obj.hasOwnProperty(key)) {
                  val = obj[key];
                  if (typeof val === 'object' && val !== null) {
                      ret[key] = deepCopy(val);
                  } else {
                      ret[key] = val;
                  }
              }
          }
          return ret;
      }
  
      // based on LLVM libc++ upper_bound / lower_bound
      // MIT License
  
      function upperBound(array, func) {
          var diff, len, i, current;
  
          len = array.length;
          i = 0;
  
          while (len) {
              diff = len >>> 1;
              current = i + diff;
              if (func(array[current])) {
                  len = diff;
              } else {
                  i = current + 1;
                  len -= diff + 1;
              }
          }
          return i;
      }
  
      Syntax = {
          AssignmentExpression: 'AssignmentExpression',
          AssignmentPattern: 'AssignmentPattern',
          ArrayExpression: 'ArrayExpression',
          ArrayPattern: 'ArrayPattern',
          ArrowFunctionExpression: 'ArrowFunctionExpression',
          AwaitExpression: 'AwaitExpression', // CAUTION: It's deferred to ES7.
          BlockStatement: 'BlockStatement',
          BinaryExpression: 'BinaryExpression',
          BreakStatement: 'BreakStatement',
          CallExpression: 'CallExpression',
          CatchClause: 'CatchClause',
          ClassBody: 'ClassBody',
          ClassDeclaration: 'ClassDeclaration',
          ClassExpression: 'ClassExpression',
          ComprehensionBlock: 'ComprehensionBlock',  // CAUTION: It's deferred to ES7.
          ComprehensionExpression: 'ComprehensionExpression',  // CAUTION: It's deferred to ES7.
          ConditionalExpression: 'ConditionalExpression',
          ContinueStatement: 'ContinueStatement',
          DebuggerStatement: 'DebuggerStatement',
          DirectiveStatement: 'DirectiveStatement',
          DoWhileStatement: 'DoWhileStatement',
          EmptyStatement: 'EmptyStatement',
          ExportAllDeclaration: 'ExportAllDeclaration',
          ExportDefaultDeclaration: 'ExportDefaultDeclaration',
          ExportNamedDeclaration: 'ExportNamedDeclaration',
          ExportSpecifier: 'ExportSpecifier',
          ExpressionStatement: 'ExpressionStatement',
          ForStatement: 'ForStatement',
          ForInStatement: 'ForInStatement',
          ForOfStatement: 'ForOfStatement',
          FunctionDeclaration: 'FunctionDeclaration',
          FunctionExpression: 'FunctionExpression',
          GeneratorExpression: 'GeneratorExpression',  // CAUTION: It's deferred to ES7.
          Identifier: 'Identifier',
          IfStatement: 'IfStatement',
          ImportExpression: 'ImportExpression',
          ImportDeclaration: 'ImportDeclaration',
          ImportDefaultSpecifier: 'ImportDefaultSpecifier',
          ImportNamespaceSpecifier: 'ImportNamespaceSpecifier',
          ImportSpecifier: 'ImportSpecifier',
          Literal: 'Literal',
          LabeledStatement: 'LabeledStatement',
          LogicalExpression: 'LogicalExpression',
          MemberExpression: 'MemberExpression',
          MetaProperty: 'MetaProperty',
          MethodDefinition: 'MethodDefinition',
          ModuleSpecifier: 'ModuleSpecifier',
          NewExpression: 'NewExpression',
          ObjectExpression: 'ObjectExpression',
          ObjectPattern: 'ObjectPattern',
          Program: 'Program',
          Property: 'Property',
          RestElement: 'RestElement',
          ReturnStatement: 'ReturnStatement',
          SequenceExpression: 'SequenceExpression',
          SpreadElement: 'SpreadElement',
          Super: 'Super',
          SwitchStatement: 'SwitchStatement',
          SwitchCase: 'SwitchCase',
          TaggedTemplateExpression: 'TaggedTemplateExpression',
          TemplateElement: 'TemplateElement',
          TemplateLiteral: 'TemplateLiteral',
          ThisExpression: 'ThisExpression',
          ThrowStatement: 'ThrowStatement',
          TryStatement: 'TryStatement',
          UnaryExpression: 'UnaryExpression',
          UpdateExpression: 'UpdateExpression',
          VariableDeclaration: 'VariableDeclaration',
          VariableDeclarator: 'VariableDeclarator',
          WhileStatement: 'WhileStatement',
          WithStatement: 'WithStatement',
          YieldExpression: 'YieldExpression'
      };
  
      VisitorKeys = {
          AssignmentExpression: ['left', 'right'],
          AssignmentPattern: ['left', 'right'],
          ArrayExpression: ['elements'],
          ArrayPattern: ['elements'],
          ArrowFunctionExpression: ['params', 'body'],
          AwaitExpression: ['argument'], // CAUTION: It's deferred to ES7.
          BlockStatement: ['body'],
          BinaryExpression: ['left', 'right'],
          BreakStatement: ['label'],
          CallExpression: ['callee', 'arguments'],
          CatchClause: ['param', 'body'],
          ClassBody: ['body'],
          ClassDeclaration: ['id', 'superClass', 'body'],
          ClassExpression: ['id', 'superClass', 'body'],
          ComprehensionBlock: ['left', 'right'],  // CAUTION: It's deferred to ES7.
          ComprehensionExpression: ['blocks', 'filter', 'body'],  // CAUTION: It's deferred to ES7.
          ConditionalExpression: ['test', 'consequent', 'alternate'],
          ContinueStatement: ['label'],
          DebuggerStatement: [],
          DirectiveStatement: [],
          DoWhileStatement: ['body', 'test'],
          EmptyStatement: [],
          ExportAllDeclaration: ['source'],
          ExportDefaultDeclaration: ['declaration'],
          ExportNamedDeclaration: ['declaration', 'specifiers', 'source'],
          ExportSpecifier: ['exported', 'local'],
          ExpressionStatement: ['expression'],
          ForStatement: ['init', 'test', 'update', 'body'],
          ForInStatement: ['left', 'right', 'body'],
          ForOfStatement: ['left', 'right', 'body'],
          FunctionDeclaration: ['id', 'params', 'body'],
          FunctionExpression: ['id', 'params', 'body'],
          GeneratorExpression: ['blocks', 'filter', 'body'],  // CAUTION: It's deferred to ES7.
          Identifier: [],
          IfStatement: ['test', 'consequent', 'alternate'],
          ImportExpression: ['source'],
          ImportDeclaration: ['specifiers', 'source'],
          ImportDefaultSpecifier: ['local'],
          ImportNamespaceSpecifier: ['local'],
          ImportSpecifier: ['imported', 'local'],
          Literal: [],
          LabeledStatement: ['label', 'body'],
          LogicalExpression: ['left', 'right'],
          MemberExpression: ['object', 'property'],
          MetaProperty: ['meta', 'property'],
          MethodDefinition: ['key', 'value'],
          ModuleSpecifier: [],
          NewExpression: ['callee', 'arguments'],
          ObjectExpression: ['properties'],
          ObjectPattern: ['properties'],
          Program: ['body'],
          Property: ['key', 'value'],
          RestElement: [ 'argument' ],
          ReturnStatement: ['argument'],
          SequenceExpression: ['expressions'],
          SpreadElement: ['argument'],
          Super: [],
          SwitchStatement: ['discriminant', 'cases'],
          SwitchCase: ['test', 'consequent'],
          TaggedTemplateExpression: ['tag', 'quasi'],
          TemplateElement: [],
          TemplateLiteral: ['quasis', 'expressions'],
          ThisExpression: [],
          ThrowStatement: ['argument'],
          TryStatement: ['block', 'handler', 'finalizer'],
          UnaryExpression: ['argument'],
          UpdateExpression: ['argument'],
          VariableDeclaration: ['declarations'],
          VariableDeclarator: ['id', 'init'],
          WhileStatement: ['test', 'body'],
          WithStatement: ['object', 'body'],
          YieldExpression: ['argument']
      };
  
      // unique id
      BREAK = {};
      SKIP = {};
      REMOVE = {};
  
      VisitorOption = {
          Break: BREAK,
          Skip: SKIP,
          Remove: REMOVE
      };
  
      function Reference(parent, key) {
          this.parent = parent;
          this.key = key;
      }
  
      Reference.prototype.replace = function replace(node) {
          this.parent[this.key] = node;
      };
  
      Reference.prototype.remove = function remove() {
          if (Array.isArray(this.parent)) {
              this.parent.splice(this.key, 1);
              return true;
          } else {
              this.replace(null);
              return false;
          }
      };
  
      function Element(node, path, wrap, ref) {
          this.node = node;
          this.path = path;
          this.wrap = wrap;
          this.ref = ref;
      }
  
      function Controller() { }
  
      // API:
      // return property path array from root to current node
      Controller.prototype.path = function path() {
          var i, iz, j, jz, result, element;
  
          function addToPath(result, path) {
              if (Array.isArray(path)) {
                  for (j = 0, jz = path.length; j < jz; ++j) {
                      result.push(path[j]);
                  }
              } else {
                  result.push(path);
              }
          }
  
          // root node
          if (!this.__current.path) {
              return null;
          }
  
          // first node is sentinel, second node is root element
          result = [];
          for (i = 2, iz = this.__leavelist.length; i < iz; ++i) {
              element = this.__leavelist[i];
              addToPath(result, element.path);
          }
          addToPath(result, this.__current.path);
          return result;
      };
  
      // API:
      // return type of current node
      Controller.prototype.type = function () {
          var node = this.current();
          return node.type || this.__current.wrap;
      };
  
      // API:
      // return array of parent elements
      Controller.prototype.parents = function parents() {
          var i, iz, result;
  
          // first node is sentinel
          result = [];
          for (i = 1, iz = this.__leavelist.length; i < iz; ++i) {
              result.push(this.__leavelist[i].node);
          }
  
          return result;
      };
  
      // API:
      // return current node
      Controller.prototype.current = function current() {
          return this.__current.node;
      };
  
      Controller.prototype.__execute = function __execute(callback, element) {
          var previous, result;
  
          result = undefined;
  
          previous  = this.__current;
          this.__current = element;
          this.__state = null;
          if (callback) {
              result = callback.call(this, element.node, this.__leavelist[this.__leavelist.length - 1].node);
          }
          this.__current = previous;
  
          return result;
      };
  
      // API:
      // notify control skip / break
      Controller.prototype.notify = function notify(flag) {
          this.__state = flag;
      };
  
      // API:
      // skip child nodes of current node
      Controller.prototype.skip = function () {
          this.notify(SKIP);
      };
  
      // API:
      // break traversals
      Controller.prototype['break'] = function () {
          this.notify(BREAK);
      };
  
      // API:
      // remove node
      Controller.prototype.remove = function () {
          this.notify(REMOVE);
      };
  
      Controller.prototype.__initialize = function(root, visitor) {
          this.visitor = visitor;
          this.root = root;
          this.__worklist = [];
          this.__leavelist = [];
          this.__current = null;
          this.__state = null;
          this.__fallback = null;
          if (visitor.fallback === 'iteration') {
              this.__fallback = Object.keys;
          } else if (typeof visitor.fallback === 'function') {
              this.__fallback = visitor.fallback;
          }
  
          this.__keys = VisitorKeys;
          if (visitor.keys) {
              this.__keys = Object.assign(Object.create(this.__keys), visitor.keys);
          }
      };
  
      function isNode(node) {
          if (node == null) {
              return false;
          }
          return typeof node === 'object' && typeof node.type === 'string';
      }
  
      function isProperty(nodeType, key) {
          return (nodeType === Syntax.ObjectExpression || nodeType === Syntax.ObjectPattern) && 'properties' === key;
      }
  
      Controller.prototype.traverse = function traverse(root, visitor) {
          var worklist,
              leavelist,
              element,
              node,
              nodeType,
              ret,
              key,
              current,
              current2,
              candidates,
              candidate,
              sentinel;
  
          this.__initialize(root, visitor);
  
          sentinel = {};
  
          // reference
          worklist = this.__worklist;
          leavelist = this.__leavelist;
  
          // initialize
          worklist.push(new Element(root, null, null, null));
          leavelist.push(new Element(null, null, null, null));
  
          while (worklist.length) {
              element = worklist.pop();
  
              if (element === sentinel) {
                  element = leavelist.pop();
  
                  ret = this.__execute(visitor.leave, element);
  
                  if (this.__state === BREAK || ret === BREAK) {
                      return;
                  }
                  continue;
              }
  
              if (element.node) {
  
                  ret = this.__execute(visitor.enter, element);
  
                  if (this.__state === BREAK || ret === BREAK) {
                      return;
                  }
  
                  worklist.push(sentinel);
                  leavelist.push(element);
  
                  if (this.__state === SKIP || ret === SKIP) {
                      continue;
                  }
  
                  node = element.node;
                  nodeType = node.type || element.wrap;
                  candidates = this.__keys[nodeType];
                  if (!candidates) {
                      if (this.__fallback) {
                          candidates = this.__fallback(node);
                      } else {
                          throw new Error('Unknown node type ' + nodeType + '.');
                      }
                  }
  
                  current = candidates.length;
                  while ((current -= 1) >= 0) {
                      key = candidates[current];
                      candidate = node[key];
                      if (!candidate) {
                          continue;
                      }
  
                      if (Array.isArray(candidate)) {
                          current2 = candidate.length;
                          while ((current2 -= 1) >= 0) {
                              if (!candidate[current2]) {
                                  continue;
                              }
                              if (isProperty(nodeType, candidates[current])) {
                                  element = new Element(candidate[current2], [key, current2], 'Property', null);
                              } else if (isNode(candidate[current2])) {
                                  element = new Element(candidate[current2], [key, current2], null, null);
                              } else {
                                  continue;
                              }
                              worklist.push(element);
                          }
                      } else if (isNode(candidate)) {
                          worklist.push(new Element(candidate, key, null, null));
                      }
                  }
              }
          }
      };
  
      Controller.prototype.replace = function replace(root, visitor) {
          var worklist,
              leavelist,
              node,
              nodeType,
              target,
              element,
              current,
              current2,
              candidates,
              candidate,
              sentinel,
              outer,
              key;
  
          function removeElem(element) {
              var i,
                  key,
                  nextElem,
                  parent;
  
              if (element.ref.remove()) {
                  // When the reference is an element of an array.
                  key = element.ref.key;
                  parent = element.ref.parent;
  
                  // If removed from array, then decrease following items' keys.
                  i = worklist.length;
                  while (i--) {
                      nextElem = worklist[i];
                      if (nextElem.ref && nextElem.ref.parent === parent) {
                          if  (nextElem.ref.key < key) {
                              break;
                          }
                          --nextElem.ref.key;
                      }
                  }
              }
          }
  
          this.__initialize(root, visitor);
  
          sentinel = {};
  
          // reference
          worklist = this.__worklist;
          leavelist = this.__leavelist;
  
          // initialize
          outer = {
              root: root
          };
          element = new Element(root, null, null, new Reference(outer, 'root'));
          worklist.push(element);
          leavelist.push(element);
  
          while (worklist.length) {
              element = worklist.pop();
  
              if (element === sentinel) {
                  element = leavelist.pop();
  
                  target = this.__execute(visitor.leave, element);
  
                  // node may be replaced with null,
                  // so distinguish between undefined and null in this place
                  if (target !== undefined && target !== BREAK && target !== SKIP && target !== REMOVE) {
                      // replace
                      element.ref.replace(target);
                  }
  
                  if (this.__state === REMOVE || target === REMOVE) {
                      removeElem(element);
                  }
  
                  if (this.__state === BREAK || target === BREAK) {
                      return outer.root;
                  }
                  continue;
              }
  
              target = this.__execute(visitor.enter, element);
  
              // node may be replaced with null,
              // so distinguish between undefined and null in this place
              if (target !== undefined && target !== BREAK && target !== SKIP && target !== REMOVE) {
                  // replace
                  element.ref.replace(target);
                  element.node = target;
              }
  
              if (this.__state === REMOVE || target === REMOVE) {
                  removeElem(element);
                  element.node = null;
              }
  
              if (this.__state === BREAK || target === BREAK) {
                  return outer.root;
              }
  
              // node may be null
              node = element.node;
              if (!node) {
                  continue;
              }
  
              worklist.push(sentinel);
              leavelist.push(element);
  
              if (this.__state === SKIP || target === SKIP) {
                  continue;
              }
  
              nodeType = node.type || element.wrap;
              candidates = this.__keys[nodeType];
              if (!candidates) {
                  if (this.__fallback) {
                      candidates = this.__fallback(node);
                  } else {
                      throw new Error('Unknown node type ' + nodeType + '.');
                  }
              }
  
              current = candidates.length;
              while ((current -= 1) >= 0) {
                  key = candidates[current];
                  candidate = node[key];
                  if (!candidate) {
                      continue;
                  }
  
                  if (Array.isArray(candidate)) {
                      current2 = candidate.length;
                      while ((current2 -= 1) >= 0) {
                          if (!candidate[current2]) {
                              continue;
                          }
                          if (isProperty(nodeType, candidates[current])) {
                              element = new Element(candidate[current2], [key, current2], 'Property', new Reference(candidate, current2));
                          } else if (isNode(candidate[current2])) {
                              element = new Element(candidate[current2], [key, current2], null, new Reference(candidate, current2));
                          } else {
                              continue;
                          }
                          worklist.push(element);
                      }
                  } else if (isNode(candidate)) {
                      worklist.push(new Element(candidate, key, null, new Reference(node, key)));
                  }
              }
          }
  
          return outer.root;
      };
  
      function traverse(root, visitor) {
          var controller = new Controller();
          return controller.traverse(root, visitor);
      }
  
      function replace(root, visitor) {
          var controller = new Controller();
          return controller.replace(root, visitor);
      }
  
      function extendCommentRange(comment, tokens) {
          var target;
  
          target = upperBound(tokens, function search(token) {
              return token.range[0] > comment.range[0];
          });
  
          comment.extendedRange = [comment.range[0], comment.range[1]];
  
          if (target !== tokens.length) {
              comment.extendedRange[1] = tokens[target].range[0];
          }
  
          target -= 1;
          if (target >= 0) {
              comment.extendedRange[0] = tokens[target].range[1];
          }
  
          return comment;
      }
  
      function attachComments(tree, providedComments, tokens) {
          // At first, we should calculate extended comment ranges.
          var comments = [], comment, len, i, cursor;
  
          if (!tree.range) {
              throw new Error('attachComments needs range information');
          }
  
          // tokens array is empty, we attach comments to tree as 'leadingComments'
          if (!tokens.length) {
              if (providedComments.length) {
                  for (i = 0, len = providedComments.length; i < len; i += 1) {
                      comment = deepCopy(providedComments[i]);
                      comment.extendedRange = [0, tree.range[0]];
                      comments.push(comment);
                  }
                  tree.leadingComments = comments;
              }
              return tree;
          }
  
          for (i = 0, len = providedComments.length; i < len; i += 1) {
              comments.push(extendCommentRange(deepCopy(providedComments[i]), tokens));
          }
  
          // This is based on John Freeman's implementation.
          cursor = 0;
          traverse(tree, {
              enter: function (node) {
                  var comment;
  
                  while (cursor < comments.length) {
                      comment = comments[cursor];
                      if (comment.extendedRange[1] > node.range[0]) {
                          break;
                      }
  
                      if (comment.extendedRange[1] === node.range[0]) {
                          if (!node.leadingComments) {
                              node.leadingComments = [];
                          }
                          node.leadingComments.push(comment);
                          comments.splice(cursor, 1);
                      } else {
                          cursor += 1;
                      }
                  }
  
                  // already out of owned node
                  if (cursor === comments.length) {
                      return VisitorOption.Break;
                  }
  
                  if (comments[cursor].extendedRange[0] > node.range[1]) {
                      return VisitorOption.Skip;
                  }
              }
          });
  
          cursor = 0;
          traverse(tree, {
              leave: function (node) {
                  var comment;
  
                  while (cursor < comments.length) {
                      comment = comments[cursor];
                      if (node.range[1] < comment.extendedRange[0]) {
                          break;
                      }
  
                      if (node.range[1] === comment.extendedRange[0]) {
                          if (!node.trailingComments) {
                              node.trailingComments = [];
                          }
                          node.trailingComments.push(comment);
                          comments.splice(cursor, 1);
                      } else {
                          cursor += 1;
                      }
                  }
  
                  // already out of owned node
                  if (cursor === comments.length) {
                      return VisitorOption.Break;
                  }
  
                  if (comments[cursor].extendedRange[0] > node.range[1]) {
                      return VisitorOption.Skip;
                  }
              }
          });
  
          return tree;
      }
  
      exports.version = require('./package.json').version;
      exports.Syntax = Syntax;
      exports.traverse = traverse;
      exports.replace = replace;
      exports.attachComments = attachComments;
      exports.VisitorKeys = VisitorKeys;
      exports.VisitorOption = VisitorOption;
      exports.Controller = Controller;
      exports.cloneEnvironment = function () { return clone({}); };
  
      return exports;
  }(exports));
  /* vim: set sw=4 ts=4 et tw=80 : */
  
  },{"./package.json":86}],86:[function(require,module,exports){
  module.exports={
    "_from": "estraverse@^4.1.1",
    "_id": "estraverse@4.3.0",
    "_inBundle": false,
    "_integrity": "sha512-39nnKffWz8xN1BU/2c79n9nB9HDzo0niYUqx6xyqUnyoAnQyyWpOTdZEeiCch8BBu515t4wp9ZmgVfVhn9EBpw==",
    "_location": "/escope/estraverse",
    "_phantomChildren": {},
    "_requested": {
      "type": "range",
      "registry": true,
      "raw": "estraverse@^4.1.1",
      "name": "estraverse",
      "escapedName": "estraverse",
      "rawSpec": "^4.1.1",
      "saveSpec": null,
      "fetchSpec": "^4.1.1"
    },
    "_requiredBy": [
      "/escope"
    ],
    "_resolved": "https://registry.npmjs.org/estraverse/-/estraverse-4.3.0.tgz",
    "_shasum": "398ad3f3c5a24948be7725e83d11a7de28cdbd1d",
    "_spec": "estraverse@^4.1.1",
    "_where": "C:\\Users\\MarcPC\\node_modules\\escope",
    "bugs": {
      "url": "https://github.com/estools/estraverse/issues"
    },
    "bundleDependencies": false,
    "deprecated": false,
    "description": "ECMAScript JS AST traversal functions",
    "devDependencies": {
      "babel-preset-env": "^1.6.1",
      "babel-register": "^6.3.13",
      "chai": "^2.1.1",
      "espree": "^1.11.0",
      "gulp": "^3.8.10",
      "gulp-bump": "^0.2.2",
      "gulp-filter": "^2.0.0",
      "gulp-git": "^1.0.1",
      "gulp-tag-version": "^1.3.0",
      "jshint": "^2.5.6",
      "mocha": "^2.1.0"
    },
    "engines": {
      "node": ">=4.0"
    },
    "homepage": "https://github.com/estools/estraverse",
    "license": "BSD-2-Clause",
    "main": "estraverse.js",
    "maintainers": [
      {
        "name": "Yusuke Suzuki",
        "email": "utatane.tea@gmail.com",
        "url": "http://github.com/Constellation"
      }
    ],
    "name": "estraverse",
    "repository": {
      "type": "git",
      "url": "git+ssh://git@github.com/estools/estraverse.git"
    },
    "scripts": {
      "lint": "jshint estraverse.js",
      "test": "npm run-script lint && npm run-script unit-test",
      "unit-test": "mocha --compilers js:babel-register"
    },
    "version": "4.3.0"
  }
  
  },{}],87:[function(require,module,exports){
  module.exports={
    "_from": "escope",
    "_id": "escope@3.6.0",
    "_inBundle": false,
    "_integrity": "sha1-4Bl16BJ4GhY6ba392AOY3GTIicM=",
    "_location": "/escope",
    "_phantomChildren": {},
    "_requested": {
      "type": "tag",
      "registry": true,
      "raw": "escope",
      "name": "escope",
      "escapedName": "escope",
      "rawSpec": "",
      "saveSpec": null,
      "fetchSpec": "latest"
    },
    "_requiredBy": [
      "#USER",
      "/"
    ],
    "_resolved": "https://registry.npmjs.org/escope/-/escope-3.6.0.tgz",
    "_shasum": "e01975e812781a163a6dadfdd80398dc64c889c3",
    "_spec": "escope",
    "_where": "C:\\Users\\MarcPC\\Desktop\\Web Development\\STANDARD\\3-pillars-project\\scopes",
    "bugs": {
      "url": "https://github.com/estools/escope/issues"
    },
    "bundleDependencies": false,
    "dependencies": {
      "es6-map": "^0.1.3",
      "es6-weak-map": "^2.0.1",
      "esrecurse": "^4.1.0",
      "estraverse": "^4.1.1"
    },
    "deprecated": false,
    "description": "ECMAScript scope analyzer",
    "devDependencies": {
      "babel": "^6.3.26",
      "babel-preset-es2015": "^6.3.13",
      "babel-register": "^6.3.13",
      "browserify": "^13.0.0",
      "chai": "^3.4.1",
      "espree": "^3.1.1",
      "esprima": "^2.7.1",
      "gulp": "^3.9.0",
      "gulp-babel": "^6.1.1",
      "gulp-bump": "^1.0.0",
      "gulp-eslint": "^1.1.1",
      "gulp-espower": "^1.0.2",
      "gulp-filter": "^3.0.1",
      "gulp-git": "^1.6.1",
      "gulp-mocha": "^2.2.0",
      "gulp-plumber": "^1.0.1",
      "gulp-sourcemaps": "^1.6.0",
      "gulp-tag-version": "^1.3.0",
      "jsdoc": "^3.4.0",
      "lazypipe": "^1.0.1",
      "vinyl-source-stream": "^1.1.0"
    },
    "engines": {
      "node": ">=0.4.0"
    },
    "homepage": "http://github.com/estools/escope",
    "license": "BSD-2-Clause",
    "main": "lib/index.js",
    "maintainers": [
      {
        "name": "Yusuke Suzuki",
        "email": "utatane.tea@gmail.com",
        "url": "http://github.com/Constellation"
      }
    ],
    "name": "escope",
    "repository": {
      "type": "git",
      "url": "git+https://github.com/estools/escope.git"
    },
    "scripts": {
      "jsdoc": "jsdoc src/*.js README.md",
      "lint": "gulp lint",
      "test": "gulp travis",
      "unit-test": "gulp test"
    },
    "version": "3.6.0"
  }
  
  },{}],88:[function(require,module,exports){
  (function webpackUniversalModuleDefinition(root, factory) {
  /* istanbul ignore next */
    if(typeof exports === 'object' && typeof module === 'object')
      module.exports = factory();
    else if(typeof define === 'function' && define.amd)
      define([], factory);
  /* istanbul ignore next */
    else if(typeof exports === 'object')
      exports["esprima"] = factory();
    else
      root["esprima"] = factory();
  })(this, function() {
  return /******/ (function(modules) { // webpackBootstrap
  /******/ 	// The module cache
  /******/ 	var installedModules = {};
  
  /******/ 	// The require function
  /******/ 	function __webpack_require__(moduleId) {
  
  /******/ 		// Check if module is in cache
  /* istanbul ignore if */
  /******/ 		if(installedModules[moduleId])
  /******/ 			return installedModules[moduleId].exports;
  
  /******/ 		// Create a new module (and put it into the cache)
  /******/ 		var module = installedModules[moduleId] = {
  /******/ 			exports: {},
  /******/ 			id: moduleId,
  /******/ 			loaded: false
  /******/ 		};
  
  /******/ 		// Execute the module function
  /******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
  
  /******/ 		// Flag the module as loaded
  /******/ 		module.loaded = true;
  
  /******/ 		// Return the exports of the module
  /******/ 		return module.exports;
  /******/ 	}
  
  
  /******/ 	// expose the modules object (__webpack_modules__)
  /******/ 	__webpack_require__.m = modules;
  
  /******/ 	// expose the module cache
  /******/ 	__webpack_require__.c = installedModules;
  
  /******/ 	// __webpack_public_path__
  /******/ 	__webpack_require__.p = "";
  
  /******/ 	// Load entry module and return exports
  /******/ 	return __webpack_require__(0);
  /******/ })
  /************************************************************************/
  /******/ ([
  /* 0 */
  /***/ function(module, exports, __webpack_require__) {
  
    "use strict";
    /*
      Copyright JS Foundation and other contributors, https://js.foundation/
  
      Redistribution and use in source and binary forms, with or without
      modification, are permitted provided that the following conditions are met:
  
        * Redistributions of source code must retain the above copyright
          notice, this list of conditions and the following disclaimer.
        * Redistributions in binary form must reproduce the above copyright
          notice, this list of conditions and the following disclaimer in the
          documentation and/or other materials provided with the distribution.
  
      THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
      AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
      IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
      ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
      DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
      (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
      LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
      ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
      (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
      THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
    */
    Object.defineProperty(exports, "__esModule", { value: true });
    var comment_handler_1 = __webpack_require__(1);
    var jsx_parser_1 = __webpack_require__(3);
    var parser_1 = __webpack_require__(8);
    var tokenizer_1 = __webpack_require__(15);
    function parse(code, options, delegate) {
        var commentHandler = null;
        var proxyDelegate = function (node, metadata) {
            if (delegate) {
                delegate(node, metadata);
            }
            if (commentHandler) {
                commentHandler.visit(node, metadata);
            }
        };
        var parserDelegate = (typeof delegate === 'function') ? proxyDelegate : null;
        var collectComment = false;
        if (options) {
            collectComment = (typeof options.comment === 'boolean' && options.comment);
            var attachComment = (typeof options.attachComment === 'boolean' && options.attachComment);
            if (collectComment || attachComment) {
                commentHandler = new comment_handler_1.CommentHandler();
                commentHandler.attach = attachComment;
                options.comment = true;
                parserDelegate = proxyDelegate;
            }
        }
        var isModule = false;
        if (options && typeof options.sourceType === 'string') {
            isModule = (options.sourceType === 'module');
        }
        var parser;
        if (options && typeof options.jsx === 'boolean' && options.jsx) {
            parser = new jsx_parser_1.JSXParser(code, options, parserDelegate);
        }
        else {
            parser = new parser_1.Parser(code, options, parserDelegate);
        }
        var program = isModule ? parser.parseModule() : parser.parseScript();
        var ast = program;
        if (collectComment && commentHandler) {
            ast.comments = commentHandler.comments;
        }
        if (parser.config.tokens) {
            ast.tokens = parser.tokens;
        }
        if (parser.config.tolerant) {
            ast.errors = parser.errorHandler.errors;
        }
        return ast;
    }
    exports.parse = parse;
    function parseModule(code, options, delegate) {
        var parsingOptions = options || {};
        parsingOptions.sourceType = 'module';
        return parse(code, parsingOptions, delegate);
    }
    exports.parseModule = parseModule;
    function parseScript(code, options, delegate) {
        var parsingOptions = options || {};
        parsingOptions.sourceType = 'script';
        return parse(code, parsingOptions, delegate);
    }
    exports.parseScript = parseScript;
    function tokenize(code, options, delegate) {
        var tokenizer = new tokenizer_1.Tokenizer(code, options);
        var tokens;
        tokens = [];
        try {
            while (true) {
                var token = tokenizer.getNextToken();
                if (!token) {
                    break;
                }
                if (delegate) {
                    token = delegate(token);
                }
                tokens.push(token);
            }
        }
        catch (e) {
            tokenizer.errorHandler.tolerate(e);
        }
        if (tokenizer.errorHandler.tolerant) {
            tokens.errors = tokenizer.errors();
        }
        return tokens;
    }
    exports.tokenize = tokenize;
    var syntax_1 = __webpack_require__(2);
    exports.Syntax = syntax_1.Syntax;
    // Sync with *.json manifests.
    exports.version = '4.0.1';
  
  
  /***/ },
  /* 1 */
  /***/ function(module, exports, __webpack_require__) {
  
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var syntax_1 = __webpack_require__(2);
    var CommentHandler = (function () {
        function CommentHandler() {
            this.attach = false;
            this.comments = [];
            this.stack = [];
            this.leading = [];
            this.trailing = [];
        }
        CommentHandler.prototype.insertInnerComments = function (node, metadata) {
            //  innnerComments for properties empty block
            //  `function a() {/** comments **\/}`
            if (node.type === syntax_1.Syntax.BlockStatement && node.body.length === 0) {
                var innerComments = [];
                for (var i = this.leading.length - 1; i >= 0; --i) {
                    var entry = this.leading[i];
                    if (metadata.end.offset >= entry.start) {
                        innerComments.unshift(entry.comment);
                        this.leading.splice(i, 1);
                        this.trailing.splice(i, 1);
                    }
                }
                if (innerComments.length) {
                    node.innerComments = innerComments;
                }
            }
        };
        CommentHandler.prototype.findTrailingComments = function (metadata) {
            var trailingComments = [];
            if (this.trailing.length > 0) {
                for (var i = this.trailing.length - 1; i >= 0; --i) {
                    var entry_1 = this.trailing[i];
                    if (entry_1.start >= metadata.end.offset) {
                        trailingComments.unshift(entry_1.comment);
                    }
                }
                this.trailing.length = 0;
                return trailingComments;
            }
            var entry = this.stack[this.stack.length - 1];
            if (entry && entry.node.trailingComments) {
                var firstComment = entry.node.trailingComments[0];
                if (firstComment && firstComment.range[0] >= metadata.end.offset) {
                    trailingComments = entry.node.trailingComments;
                    delete entry.node.trailingComments;
                }
            }
            return trailingComments;
        };
        CommentHandler.prototype.findLeadingComments = function (metadata) {
            var leadingComments = [];
            var target;
            while (this.stack.length > 0) {
                var entry = this.stack[this.stack.length - 1];
                if (entry && entry.start >= metadata.start.offset) {
                    target = entry.node;
                    this.stack.pop();
                }
                else {
                    break;
                }
            }
            if (target) {
                var count = target.leadingComments ? target.leadingComments.length : 0;
                for (var i = count - 1; i >= 0; --i) {
                    var comment = target.leadingComments[i];
                    if (comment.range[1] <= metadata.start.offset) {
                        leadingComments.unshift(comment);
                        target.leadingComments.splice(i, 1);
                    }
                }
                if (target.leadingComments && target.leadingComments.length === 0) {
                    delete target.leadingComments;
                }
                return leadingComments;
            }
            for (var i = this.leading.length - 1; i >= 0; --i) {
                var entry = this.leading[i];
                if (entry.start <= metadata.start.offset) {
                    leadingComments.unshift(entry.comment);
                    this.leading.splice(i, 1);
                }
            }
            return leadingComments;
        };
        CommentHandler.prototype.visitNode = function (node, metadata) {
            if (node.type === syntax_1.Syntax.Program && node.body.length > 0) {
                return;
            }
            this.insertInnerComments(node, metadata);
            var trailingComments = this.findTrailingComments(metadata);
            var leadingComments = this.findLeadingComments(metadata);
            if (leadingComments.length > 0) {
                node.leadingComments = leadingComments;
            }
            if (trailingComments.length > 0) {
                node.trailingComments = trailingComments;
            }
            this.stack.push({
                node: node,
                start: metadata.start.offset
            });
        };
        CommentHandler.prototype.visitComment = function (node, metadata) {
            var type = (node.type[0] === 'L') ? 'Line' : 'Block';
            var comment = {
                type: type,
                value: node.value
            };
            if (node.range) {
                comment.range = node.range;
            }
            if (node.loc) {
                comment.loc = node.loc;
            }
            this.comments.push(comment);
            if (this.attach) {
                var entry = {
                    comment: {
                        type: type,
                        value: node.value,
                        range: [metadata.start.offset, metadata.end.offset]
                    },
                    start: metadata.start.offset
                };
                if (node.loc) {
                    entry.comment.loc = node.loc;
                }
                node.type = type;
                this.leading.push(entry);
                this.trailing.push(entry);
            }
        };
        CommentHandler.prototype.visit = function (node, metadata) {
            if (node.type === 'LineComment') {
                this.visitComment(node, metadata);
            }
            else if (node.type === 'BlockComment') {
                this.visitComment(node, metadata);
            }
            else if (this.attach) {
                this.visitNode(node, metadata);
            }
        };
        return CommentHandler;
    }());
    exports.CommentHandler = CommentHandler;
  
  
  /***/ },
  /* 2 */
  /***/ function(module, exports) {
  
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        AssignmentPattern: 'AssignmentPattern',
        ArrayExpression: 'ArrayExpression',
        ArrayPattern: 'ArrayPattern',
        ArrowFunctionExpression: 'ArrowFunctionExpression',
        AwaitExpression: 'AwaitExpression',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ClassBody: 'ClassBody',
        ClassDeclaration: 'ClassDeclaration',
        ClassExpression: 'ClassExpression',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DoWhileStatement: 'DoWhileStatement',
        DebuggerStatement: 'DebuggerStatement',
        EmptyStatement: 'EmptyStatement',
        ExportAllDeclaration: 'ExportAllDeclaration',
        ExportDefaultDeclaration: 'ExportDefaultDeclaration',
        ExportNamedDeclaration: 'ExportNamedDeclaration',
        ExportSpecifier: 'ExportSpecifier',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForOfStatement: 'ForOfStatement',
        ForInStatement: 'ForInStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        ImportDeclaration: 'ImportDeclaration',
        ImportDefaultSpecifier: 'ImportDefaultSpecifier',
        ImportNamespaceSpecifier: 'ImportNamespaceSpecifier',
        ImportSpecifier: 'ImportSpecifier',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        MetaProperty: 'MetaProperty',
        MethodDefinition: 'MethodDefinition',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        ObjectPattern: 'ObjectPattern',
        Program: 'Program',
        Property: 'Property',
        RestElement: 'RestElement',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SpreadElement: 'SpreadElement',
        Super: 'Super',
        SwitchCase: 'SwitchCase',
        SwitchStatement: 'SwitchStatement',
        TaggedTemplateExpression: 'TaggedTemplateExpression',
        TemplateElement: 'TemplateElement',
        TemplateLiteral: 'TemplateLiteral',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement',
        YieldExpression: 'YieldExpression'
    };
  
  
  /***/ },
  /* 3 */
  /***/ function(module, exports, __webpack_require__) {
  
    "use strict";
  /* istanbul ignore next */
    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    var character_1 = __webpack_require__(4);
    var JSXNode = __webpack_require__(5);
    var jsx_syntax_1 = __webpack_require__(6);
    var Node = __webpack_require__(7);
    var parser_1 = __webpack_require__(8);
    var token_1 = __webpack_require__(13);
    var xhtml_entities_1 = __webpack_require__(14);
    token_1.TokenName[100 /* Identifier */] = 'JSXIdentifier';
    token_1.TokenName[101 /* Text */] = 'JSXText';
    // Fully qualified element name, e.g. <svg:path> returns "svg:path"
    function getQualifiedElementName(elementName) {
        var qualifiedName;
        switch (elementName.type) {
            case jsx_syntax_1.JSXSyntax.JSXIdentifier:
                var id = elementName;
                qualifiedName = id.name;
                break;
            case jsx_syntax_1.JSXSyntax.JSXNamespacedName:
                var ns = elementName;
                qualifiedName = getQualifiedElementName(ns.namespace) + ':' +
                    getQualifiedElementName(ns.name);
                break;
            case jsx_syntax_1.JSXSyntax.JSXMemberExpression:
                var expr = elementName;
                qualifiedName = getQualifiedElementName(expr.object) + '.' +
                    getQualifiedElementName(expr.property);
                break;
            /* istanbul ignore next */
            default:
                break;
        }
        return qualifiedName;
    }
    var JSXParser = (function (_super) {
        __extends(JSXParser, _super);
        function JSXParser(code, options, delegate) {
            return _super.call(this, code, options, delegate) || this;
        }
        JSXParser.prototype.parsePrimaryExpression = function () {
            return this.match('<') ? this.parseJSXRoot() : _super.prototype.parsePrimaryExpression.call(this);
        };
        JSXParser.prototype.startJSX = function () {
            // Unwind the scanner before the lookahead token.
            this.scanner.index = this.startMarker.index;
            this.scanner.lineNumber = this.startMarker.line;
            this.scanner.lineStart = this.startMarker.index - this.startMarker.column;
        };
        JSXParser.prototype.finishJSX = function () {
            // Prime the next lookahead.
            this.nextToken();
        };
        JSXParser.prototype.reenterJSX = function () {
            this.startJSX();
            this.expectJSX('}');
            // Pop the closing '}' added from the lookahead.
            if (this.config.tokens) {
                this.tokens.pop();
            }
        };
        JSXParser.prototype.createJSXNode = function () {
            this.collectComments();
            return {
                index: this.scanner.index,
                line: this.scanner.lineNumber,
                column: this.scanner.index - this.scanner.lineStart
            };
        };
        JSXParser.prototype.createJSXChildNode = function () {
            return {
                index: this.scanner.index,
                line: this.scanner.lineNumber,
                column: this.scanner.index - this.scanner.lineStart
            };
        };
        JSXParser.prototype.scanXHTMLEntity = function (quote) {
            var result = '&';
            var valid = true;
            var terminated = false;
            var numeric = false;
            var hex = false;
            while (!this.scanner.eof() && valid && !terminated) {
                var ch = this.scanner.source[this.scanner.index];
                if (ch === quote) {
                    break;
                }
                terminated = (ch === ';');
                result += ch;
                ++this.scanner.index;
                if (!terminated) {
                    switch (result.length) {
                        case 2:
                            // e.g. '&#123;'
                            numeric = (ch === '#');
                            break;
                        case 3:
                            if (numeric) {
                                // e.g. '&#x41;'
                                hex = (ch === 'x');
                                valid = hex || character_1.Character.isDecimalDigit(ch.charCodeAt(0));
                                numeric = numeric && !hex;
                            }
                            break;
                        default:
                            valid = valid && !(numeric && !character_1.Character.isDecimalDigit(ch.charCodeAt(0)));
                            valid = valid && !(hex && !character_1.Character.isHexDigit(ch.charCodeAt(0)));
                            break;
                    }
                }
            }
            if (valid && terminated && result.length > 2) {
                // e.g. '&#x41;' becomes just '#x41'
                var str = result.substr(1, result.length - 2);
                if (numeric && str.length > 1) {
                    result = String.fromCharCode(parseInt(str.substr(1), 10));
                }
                else if (hex && str.length > 2) {
                    result = String.fromCharCode(parseInt('0' + str.substr(1), 16));
                }
                else if (!numeric && !hex && xhtml_entities_1.XHTMLEntities[str]) {
                    result = xhtml_entities_1.XHTMLEntities[str];
                }
            }
            return result;
        };
        // Scan the next JSX token. This replaces Scanner#lex when in JSX mode.
        JSXParser.prototype.lexJSX = function () {
            var cp = this.scanner.source.charCodeAt(this.scanner.index);
            // < > / : = { }
            if (cp === 60 || cp === 62 || cp === 47 || cp === 58 || cp === 61 || cp === 123 || cp === 125) {
                var value = this.scanner.source[this.scanner.index++];
                return {
                    type: 7 /* Punctuator */,
                    value: value,
                    lineNumber: this.scanner.lineNumber,
                    lineStart: this.scanner.lineStart,
                    start: this.scanner.index - 1,
                    end: this.scanner.index
                };
            }
            // " '
            if (cp === 34 || cp === 39) {
                var start = this.scanner.index;
                var quote = this.scanner.source[this.scanner.index++];
                var str = '';
                while (!this.scanner.eof()) {
                    var ch = this.scanner.source[this.scanner.index++];
                    if (ch === quote) {
                        break;
                    }
                    else if (ch === '&') {
                        str += this.scanXHTMLEntity(quote);
                    }
                    else {
                        str += ch;
                    }
                }
                return {
                    type: 8 /* StringLiteral */,
                    value: str,
                    lineNumber: this.scanner.lineNumber,
                    lineStart: this.scanner.lineStart,
                    start: start,
                    end: this.scanner.index
                };
            }
            // ... or .
            if (cp === 46) {
                var n1 = this.scanner.source.charCodeAt(this.scanner.index + 1);
                var n2 = this.scanner.source.charCodeAt(this.scanner.index + 2);
                var value = (n1 === 46 && n2 === 46) ? '...' : '.';
                var start = this.scanner.index;
                this.scanner.index += value.length;
                return {
                    type: 7 /* Punctuator */,
                    value: value,
                    lineNumber: this.scanner.lineNumber,
                    lineStart: this.scanner.lineStart,
                    start: start,
                    end: this.scanner.index
                };
            }
            // `
            if (cp === 96) {
                // Only placeholder, since it will be rescanned as a real assignment expression.
                return {
                    type: 10 /* Template */,
                    value: '',
                    lineNumber: this.scanner.lineNumber,
                    lineStart: this.scanner.lineStart,
                    start: this.scanner.index,
                    end: this.scanner.index
                };
            }
            // Identifer can not contain backslash (char code 92).
            if (character_1.Character.isIdentifierStart(cp) && (cp !== 92)) {
                var start = this.scanner.index;
                ++this.scanner.index;
                while (!this.scanner.eof()) {
                    var ch = this.scanner.source.charCodeAt(this.scanner.index);
                    if (character_1.Character.isIdentifierPart(ch) && (ch !== 92)) {
                        ++this.scanner.index;
                    }
                    else if (ch === 45) {
                        // Hyphen (char code 45) can be part of an identifier.
                        ++this.scanner.index;
                    }
                    else {
                        break;
                    }
                }
                var id = this.scanner.source.slice(start, this.scanner.index);
                return {
                    type: 100 /* Identifier */,
                    value: id,
                    lineNumber: this.scanner.lineNumber,
                    lineStart: this.scanner.lineStart,
                    start: start,
                    end: this.scanner.index
                };
            }
            return this.scanner.lex();
        };
        JSXParser.prototype.nextJSXToken = function () {
            this.collectComments();
            this.startMarker.index = this.scanner.index;
            this.startMarker.line = this.scanner.lineNumber;
            this.startMarker.column = this.scanner.index - this.scanner.lineStart;
            var token = this.lexJSX();
            this.lastMarker.index = this.scanner.index;
            this.lastMarker.line = this.scanner.lineNumber;
            this.lastMarker.column = this.scanner.index - this.scanner.lineStart;
            if (this.config.tokens) {
                this.tokens.push(this.convertToken(token));
            }
            return token;
        };
        JSXParser.prototype.nextJSXText = function () {
            this.startMarker.index = this.scanner.index;
            this.startMarker.line = this.scanner.lineNumber;
            this.startMarker.column = this.scanner.index - this.scanner.lineStart;
            var start = this.scanner.index;
            var text = '';
            while (!this.scanner.eof()) {
                var ch = this.scanner.source[this.scanner.index];
                if (ch === '{' || ch === '<') {
                    break;
                }
                ++this.scanner.index;
                text += ch;
                if (character_1.Character.isLineTerminator(ch.charCodeAt(0))) {
                    ++this.scanner.lineNumber;
                    if (ch === '\r' && this.scanner.source[this.scanner.index] === '\n') {
                        ++this.scanner.index;
                    }
                    this.scanner.lineStart = this.scanner.index;
                }
            }
            this.lastMarker.index = this.scanner.index;
            this.lastMarker.line = this.scanner.lineNumber;
            this.lastMarker.column = this.scanner.index - this.scanner.lineStart;
            var token = {
                type: 101 /* Text */,
                value: text,
                lineNumber: this.scanner.lineNumber,
                lineStart: this.scanner.lineStart,
                start: start,
                end: this.scanner.index
            };
            if ((text.length > 0) && this.config.tokens) {
                this.tokens.push(this.convertToken(token));
            }
            return token;
        };
        JSXParser.prototype.peekJSXToken = function () {
            var state = this.scanner.saveState();
            this.scanner.scanComments();
            var next = this.lexJSX();
            this.scanner.restoreState(state);
            return next;
        };
        // Expect the next JSX token to match the specified punctuator.
        // If not, an exception will be thrown.
        JSXParser.prototype.expectJSX = function (value) {
            var token = this.nextJSXToken();
            if (token.type !== 7 /* Punctuator */ || token.value !== value) {
                this.throwUnexpectedToken(token);
            }
        };
        // Return true if the next JSX token matches the specified punctuator.
        JSXParser.prototype.matchJSX = function (value) {
            var next = this.peekJSXToken();
            return next.type === 7 /* Punctuator */ && next.value === value;
        };
        JSXParser.prototype.parseJSXIdentifier = function () {
            var node = this.createJSXNode();
            var token = this.nextJSXToken();
            if (token.type !== 100 /* Identifier */) {
                this.throwUnexpectedToken(token);
            }
            return this.finalize(node, new JSXNode.JSXIdentifier(token.value));
        };
        JSXParser.prototype.parseJSXElementName = function () {
            var node = this.createJSXNode();
            var elementName = this.parseJSXIdentifier();
            if (this.matchJSX(':')) {
                var namespace = elementName;
                this.expectJSX(':');
                var name_1 = this.parseJSXIdentifier();
                elementName = this.finalize(node, new JSXNode.JSXNamespacedName(namespace, name_1));
            }
            else if (this.matchJSX('.')) {
                while (this.matchJSX('.')) {
                    var object = elementName;
                    this.expectJSX('.');
                    var property = this.parseJSXIdentifier();
                    elementName = this.finalize(node, new JSXNode.JSXMemberExpression(object, property));
                }
            }
            return elementName;
        };
        JSXParser.prototype.parseJSXAttributeName = function () {
            var node = this.createJSXNode();
            var attributeName;
            var identifier = this.parseJSXIdentifier();
            if (this.matchJSX(':')) {
                var namespace = identifier;
                this.expectJSX(':');
                var name_2 = this.parseJSXIdentifier();
                attributeName = this.finalize(node, new JSXNode.JSXNamespacedName(namespace, name_2));
            }
            else {
                attributeName = identifier;
            }
            return attributeName;
        };
        JSXParser.prototype.parseJSXStringLiteralAttribute = function () {
            var node = this.createJSXNode();
            var token = this.nextJSXToken();
            if (token.type !== 8 /* StringLiteral */) {
                this.throwUnexpectedToken(token);
            }
            var raw = this.getTokenRaw(token);
            return this.finalize(node, new Node.Literal(token.value, raw));
        };
        JSXParser.prototype.parseJSXExpressionAttribute = function () {
            var node = this.createJSXNode();
            this.expectJSX('{');
            this.finishJSX();
            if (this.match('}')) {
                this.tolerateError('JSX attributes must only be assigned a non-empty expression');
            }
            var expression = this.parseAssignmentExpression();
            this.reenterJSX();
            return this.finalize(node, new JSXNode.JSXExpressionContainer(expression));
        };
        JSXParser.prototype.parseJSXAttributeValue = function () {
            return this.matchJSX('{') ? this.parseJSXExpressionAttribute() :
                this.matchJSX('<') ? this.parseJSXElement() : this.parseJSXStringLiteralAttribute();
        };
        JSXParser.prototype.parseJSXNameValueAttribute = function () {
            var node = this.createJSXNode();
            var name = this.parseJSXAttributeName();
            var value = null;
            if (this.matchJSX('=')) {
                this.expectJSX('=');
                value = this.parseJSXAttributeValue();
            }
            return this.finalize(node, new JSXNode.JSXAttribute(name, value));
        };
        JSXParser.prototype.parseJSXSpreadAttribute = function () {
            var node = this.createJSXNode();
            this.expectJSX('{');
            this.expectJSX('...');
            this.finishJSX();
            var argument = this.parseAssignmentExpression();
            this.reenterJSX();
            return this.finalize(node, new JSXNode.JSXSpreadAttribute(argument));
        };
        JSXParser.prototype.parseJSXAttributes = function () {
            var attributes = [];
            while (!this.matchJSX('/') && !this.matchJSX('>')) {
                var attribute = this.matchJSX('{') ? this.parseJSXSpreadAttribute() :
                    this.parseJSXNameValueAttribute();
                attributes.push(attribute);
            }
            return attributes;
        };
        JSXParser.prototype.parseJSXOpeningElement = function () {
            var node = this.createJSXNode();
            this.expectJSX('<');
            var name = this.parseJSXElementName();
            var attributes = this.parseJSXAttributes();
            var selfClosing = this.matchJSX('/');
            if (selfClosing) {
                this.expectJSX('/');
            }
            this.expectJSX('>');
            return this.finalize(node, new JSXNode.JSXOpeningElement(name, selfClosing, attributes));
        };
        JSXParser.prototype.parseJSXBoundaryElement = function () {
            var node = this.createJSXNode();
            this.expectJSX('<');
            if (this.matchJSX('/')) {
                this.expectJSX('/');
                var name_3 = this.parseJSXElementName();
                this.expectJSX('>');
                return this.finalize(node, new JSXNode.JSXClosingElement(name_3));
            }
            var name = this.parseJSXElementName();
            var attributes = this.parseJSXAttributes();
            var selfClosing = this.matchJSX('/');
            if (selfClosing) {
                this.expectJSX('/');
            }
            this.expectJSX('>');
            return this.finalize(node, new JSXNode.JSXOpeningElement(name, selfClosing, attributes));
        };
        JSXParser.prototype.parseJSXEmptyExpression = function () {
            var node = this.createJSXChildNode();
            this.collectComments();
            this.lastMarker.index = this.scanner.index;
            this.lastMarker.line = this.scanner.lineNumber;
            this.lastMarker.column = this.scanner.index - this.scanner.lineStart;
            return this.finalize(node, new JSXNode.JSXEmptyExpression());
        };
        JSXParser.prototype.parseJSXExpressionContainer = function () {
            var node = this.createJSXNode();
            this.expectJSX('{');
            var expression;
            if (this.matchJSX('}')) {
                expression = this.parseJSXEmptyExpression();
                this.expectJSX('}');
            }
            else {
                this.finishJSX();
                expression = this.parseAssignmentExpression();
                this.reenterJSX();
            }
            return this.finalize(node, new JSXNode.JSXExpressionContainer(expression));
        };
        JSXParser.prototype.parseJSXChildren = function () {
            var children = [];
            while (!this.scanner.eof()) {
                var node = this.createJSXChildNode();
                var token = this.nextJSXText();
                if (token.start < token.end) {
                    var raw = this.getTokenRaw(token);
                    var child = this.finalize(node, new JSXNode.JSXText(token.value, raw));
                    children.push(child);
                }
                if (this.scanner.source[this.scanner.index] === '{') {
                    var container = this.parseJSXExpressionContainer();
                    children.push(container);
                }
                else {
                    break;
                }
            }
            return children;
        };
        JSXParser.prototype.parseComplexJSXElement = function (el) {
            var stack = [];
            while (!this.scanner.eof()) {
                el.children = el.children.concat(this.parseJSXChildren());
                var node = this.createJSXChildNode();
                var element = this.parseJSXBoundaryElement();
                if (element.type === jsx_syntax_1.JSXSyntax.JSXOpeningElement) {
                    var opening = element;
                    if (opening.selfClosing) {
                        var child = this.finalize(node, new JSXNode.JSXElement(opening, [], null));
                        el.children.push(child);
                    }
                    else {
                        stack.push(el);
                        el = { node: node, opening: opening, closing: null, children: [] };
                    }
                }
                if (element.type === jsx_syntax_1.JSXSyntax.JSXClosingElement) {
                    el.closing = element;
                    var open_1 = getQualifiedElementName(el.opening.name);
                    var close_1 = getQualifiedElementName(el.closing.name);
                    if (open_1 !== close_1) {
                        this.tolerateError('Expected corresponding JSX closing tag for %0', open_1);
                    }
                    if (stack.length > 0) {
                        var child = this.finalize(el.node, new JSXNode.JSXElement(el.opening, el.children, el.closing));
                        el = stack[stack.length - 1];
                        el.children.push(child);
                        stack.pop();
                    }
                    else {
                        break;
                    }
                }
            }
            return el;
        };
        JSXParser.prototype.parseJSXElement = function () {
            var node = this.createJSXNode();
            var opening = this.parseJSXOpeningElement();
            var children = [];
            var closing = null;
            if (!opening.selfClosing) {
                var el = this.parseComplexJSXElement({ node: node, opening: opening, closing: closing, children: children });
                children = el.children;
                closing = el.closing;
            }
            return this.finalize(node, new JSXNode.JSXElement(opening, children, closing));
        };
        JSXParser.prototype.parseJSXRoot = function () {
            // Pop the opening '<' added from the lookahead.
            if (this.config.tokens) {
                this.tokens.pop();
            }
            this.startJSX();
            var element = this.parseJSXElement();
            this.finishJSX();
            return element;
        };
        JSXParser.prototype.isStartOfExpression = function () {
            return _super.prototype.isStartOfExpression.call(this) || this.match('<');
        };
        return JSXParser;
    }(parser_1.Parser));
    exports.JSXParser = JSXParser;
  
  
  /***/ },
  /* 4 */
  /***/ function(module, exports) {
  
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // See also tools/generate-unicode-regex.js.
    var Regex = {
        // Unicode v8.0.0 NonAsciiIdentifierStart:
        NonAsciiIdentifierStart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]/,
        // Unicode v8.0.0 NonAsciiIdentifierPart:
        NonAsciiIdentifierPart: /[\xAA\xB5\xB7\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B4\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u1371\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDCA-\uDDCC\uDDD0-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9\uDF00-\uDF19\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDCA0-\uDCE9\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/
    };
    exports.Character = {
        /* tslint:disable:no-bitwise */
        fromCodePoint: function (cp) {
            return (cp < 0x10000) ? String.fromCharCode(cp) :
                String.fromCharCode(0xD800 + ((cp - 0x10000) >> 10)) +
                    String.fromCharCode(0xDC00 + ((cp - 0x10000) & 1023));
        },
        // https://tc39.github.io/ecma262/#sec-white-space
        isWhiteSpace: function (cp) {
            return (cp === 0x20) || (cp === 0x09) || (cp === 0x0B) || (cp === 0x0C) || (cp === 0xA0) ||
                (cp >= 0x1680 && [0x1680, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A, 0x202F, 0x205F, 0x3000, 0xFEFF].indexOf(cp) >= 0);
        },
        // https://tc39.github.io/ecma262/#sec-line-terminators
        isLineTerminator: function (cp) {
            return (cp === 0x0A) || (cp === 0x0D) || (cp === 0x2028) || (cp === 0x2029);
        },
        // https://tc39.github.io/ecma262/#sec-names-and-keywords
        isIdentifierStart: function (cp) {
            return (cp === 0x24) || (cp === 0x5F) ||
                (cp >= 0x41 && cp <= 0x5A) ||
                (cp >= 0x61 && cp <= 0x7A) ||
                (cp === 0x5C) ||
                ((cp >= 0x80) && Regex.NonAsciiIdentifierStart.test(exports.Character.fromCodePoint(cp)));
        },
        isIdentifierPart: function (cp) {
            return (cp === 0x24) || (cp === 0x5F) ||
                (cp >= 0x41 && cp <= 0x5A) ||
                (cp >= 0x61 && cp <= 0x7A) ||
                (cp >= 0x30 && cp <= 0x39) ||
                (cp === 0x5C) ||
                ((cp >= 0x80) && Regex.NonAsciiIdentifierPart.test(exports.Character.fromCodePoint(cp)));
        },
        // https://tc39.github.io/ecma262/#sec-literals-numeric-literals
        isDecimalDigit: function (cp) {
            return (cp >= 0x30 && cp <= 0x39); // 0..9
        },
        isHexDigit: function (cp) {
            return (cp >= 0x30 && cp <= 0x39) ||
                (cp >= 0x41 && cp <= 0x46) ||
                (cp >= 0x61 && cp <= 0x66); // a..f
        },
        isOctalDigit: function (cp) {
            return (cp >= 0x30 && cp <= 0x37); // 0..7
        }
    };
  
  
  /***/ },
  /* 5 */
  /***/ function(module, exports, __webpack_require__) {
  
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var jsx_syntax_1 = __webpack_require__(6);
    /* tslint:disable:max-classes-per-file */
    var JSXClosingElement = (function () {
        function JSXClosingElement(name) {
            this.type = jsx_syntax_1.JSXSyntax.JSXClosingElement;
            this.name = name;
        }
        return JSXClosingElement;
    }());
    exports.JSXClosingElement = JSXClosingElement;
    var JSXElement = (function () {
        function JSXElement(openingElement, children, closingElement) {
            this.type = jsx_syntax_1.JSXSyntax.JSXElement;
            this.openingElement = openingElement;
            this.children = children;
            this.closingElement = closingElement;
        }
        return JSXElement;
    }());
    exports.JSXElement = JSXElement;
    var JSXEmptyExpression = (function () {
        function JSXEmptyExpression() {
            this.type = jsx_syntax_1.JSXSyntax.JSXEmptyExpression;
        }
        return JSXEmptyExpression;
    }());
    exports.JSXEmptyExpression = JSXEmptyExpression;
    var JSXExpressionContainer = (function () {
        function JSXExpressionContainer(expression) {
            this.type = jsx_syntax_1.JSXSyntax.JSXExpressionContainer;
            this.expression = expression;
        }
        return JSXExpressionContainer;
    }());
    exports.JSXExpressionContainer = JSXExpressionContainer;
    var JSXIdentifier = (function () {
        function JSXIdentifier(name) {
            this.type = jsx_syntax_1.JSXSyntax.JSXIdentifier;
            this.name = name;
        }
        return JSXIdentifier;
    }());
    exports.JSXIdentifier = JSXIdentifier;
    var JSXMemberExpression = (function () {
        function JSXMemberExpression(object, property) {
            this.type = jsx_syntax_1.JSXSyntax.JSXMemberExpression;
            this.object = object;
            this.property = property;
        }
        return JSXMemberExpression;
    }());
    exports.JSXMemberExpression = JSXMemberExpression;
    var JSXAttribute = (function () {
        function JSXAttribute(name, value) {
            this.type = jsx_syntax_1.JSXSyntax.JSXAttribute;
            this.name = name;
            this.value = value;
        }
        return JSXAttribute;
    }());
    exports.JSXAttribute = JSXAttribute;
    var JSXNamespacedName = (function () {
        function JSXNamespacedName(namespace, name) {
            this.type = jsx_syntax_1.JSXSyntax.JSXNamespacedName;
            this.namespace = namespace;
            this.name = name;
        }
        return JSXNamespacedName;
    }());
    exports.JSXNamespacedName = JSXNamespacedName;
    var JSXOpeningElement = (function () {
        function JSXOpeningElement(name, selfClosing, attributes) {
            this.type = jsx_syntax_1.JSXSyntax.JSXOpeningElement;
            this.name = name;
            this.selfClosing = selfClosing;
            this.attributes = attributes;
        }
        return JSXOpeningElement;
    }());
    exports.JSXOpeningElement = JSXOpeningElement;
    var JSXSpreadAttribute = (function () {
        function JSXSpreadAttribute(argument) {
            this.type = jsx_syntax_1.JSXSyntax.JSXSpreadAttribute;
            this.argument = argument;
        }
        return JSXSpreadAttribute;
    }());
    exports.JSXSpreadAttribute = JSXSpreadAttribute;
    var JSXText = (function () {
        function JSXText(value, raw) {
            this.type = jsx_syntax_1.JSXSyntax.JSXText;
            this.value = value;
            this.raw = raw;
        }
        return JSXText;
    }());
    exports.JSXText = JSXText;
  
  
  /***/ },
  /* 6 */
  /***/ function(module, exports) {
  
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.JSXSyntax = {
        JSXAttribute: 'JSXAttribute',
        JSXClosingElement: 'JSXClosingElement',
        JSXElement: 'JSXElement',
        JSXEmptyExpression: 'JSXEmptyExpression',
        JSXExpressionContainer: 'JSXExpressionContainer',
        JSXIdentifier: 'JSXIdentifier',
        JSXMemberExpression: 'JSXMemberExpression',
        JSXNamespacedName: 'JSXNamespacedName',
        JSXOpeningElement: 'JSXOpeningElement',
        JSXSpreadAttribute: 'JSXSpreadAttribute',
        JSXText: 'JSXText'
    };
  
  
  /***/ },
  /* 7 */
  /***/ function(module, exports, __webpack_require__) {
  
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var syntax_1 = __webpack_require__(2);
    /* tslint:disable:max-classes-per-file */
    var ArrayExpression = (function () {
        function ArrayExpression(elements) {
            this.type = syntax_1.Syntax.ArrayExpression;
            this.elements = elements;
        }
        return ArrayExpression;
    }());
    exports.ArrayExpression = ArrayExpression;
    var ArrayPattern = (function () {
        function ArrayPattern(elements) {
            this.type = syntax_1.Syntax.ArrayPattern;
            this.elements = elements;
        }
        return ArrayPattern;
    }());
    exports.ArrayPattern = ArrayPattern;
    var ArrowFunctionExpression = (function () {
        function ArrowFunctionExpression(params, body, expression) {
            this.type = syntax_1.Syntax.ArrowFunctionExpression;
            this.id = null;
            this.params = params;
            this.body = body;
            this.generator = false;
            this.expression = expression;
            this.async = false;
        }
        return ArrowFunctionExpression;
    }());
    exports.ArrowFunctionExpression = ArrowFunctionExpression;
    var AssignmentExpression = (function () {
        function AssignmentExpression(operator, left, right) {
            this.type = syntax_1.Syntax.AssignmentExpression;
            this.operator = operator;
            this.left = left;
            this.right = right;
        }
        return AssignmentExpression;
    }());
    exports.AssignmentExpression = AssignmentExpression;
    var AssignmentPattern = (function () {
        function AssignmentPattern(left, right) {
            this.type = syntax_1.Syntax.AssignmentPattern;
            this.left = left;
            this.right = right;
        }
        return AssignmentPattern;
    }());
    exports.AssignmentPattern = AssignmentPattern;
    var AsyncArrowFunctionExpression = (function () {
        function AsyncArrowFunctionExpression(params, body, expression) {
            this.type = syntax_1.Syntax.ArrowFunctionExpression;
            this.id = null;
            this.params = params;
            this.body = body;
            this.generator = false;
            this.expression = expression;
            this.async = true;
        }
        return AsyncArrowFunctionExpression;
    }());
    exports.AsyncArrowFunctionExpression = AsyncArrowFunctionExpression;
    var AsyncFunctionDeclaration = (function () {
        function AsyncFunctionDeclaration(id, params, body) {
            this.type = syntax_1.Syntax.FunctionDeclaration;
            this.id = id;
            this.params = params;
            this.body = body;
            this.generator = false;
            this.expression = false;
            this.async = true;
        }
        return AsyncFunctionDeclaration;
    }());
    exports.AsyncFunctionDeclaration = AsyncFunctionDeclaration;
    var AsyncFunctionExpression = (function () {
        function AsyncFunctionExpression(id, params, body) {
            this.type = syntax_1.Syntax.FunctionExpression;
            this.id = id;
            this.params = params;
            this.body = body;
            this.generator = false;
            this.expression = false;
            this.async = true;
        }
        return AsyncFunctionExpression;
    }());
    exports.AsyncFunctionExpression = AsyncFunctionExpression;
    var AwaitExpression = (function () {
        function AwaitExpression(argument) {
            this.type = syntax_1.Syntax.AwaitExpression;
            this.argument = argument;
        }
        return AwaitExpression;
    }());
    exports.AwaitExpression = AwaitExpression;
    var BinaryExpression = (function () {
        function BinaryExpression(operator, left, right) {
            var logical = (operator === '||' || operator === '&&');
            this.type = logical ? syntax_1.Syntax.LogicalExpression : syntax_1.Syntax.BinaryExpression;
            this.operator = operator;
            this.left = left;
            this.right = right;
        }
        return BinaryExpression;
    }());
    exports.BinaryExpression = BinaryExpression;
    var BlockStatement = (function () {
        function BlockStatement(body) {
            this.type = syntax_1.Syntax.BlockStatement;
            this.body = body;
        }
        return BlockStatement;
    }());
    exports.BlockStatement = BlockStatement;
    var BreakStatement = (function () {
        function BreakStatement(label) {
            this.type = syntax_1.Syntax.BreakStatement;
            this.label = label;
        }
        return BreakStatement;
    }());
    exports.BreakStatement = BreakStatement;
    var CallExpression = (function () {
        function CallExpression(callee, args) {
            this.type = syntax_1.Syntax.CallExpression;
            this.callee = callee;
            this.arguments = args;
        }
        return CallExpression;
    }());
    exports.CallExpression = CallExpression;
    var CatchClause = (function () {
        function CatchClause(param, body) {
            this.type = syntax_1.Syntax.CatchClause;
            this.param = param;
            this.body = body;
        }
        return CatchClause;
    }());
    exports.CatchClause = CatchClause;
    var ClassBody = (function () {
        function ClassBody(body) {
            this.type = syntax_1.Syntax.ClassBody;
            this.body = body;
        }
        return ClassBody;
    }());
    exports.ClassBody = ClassBody;
    var ClassDeclaration = (function () {
        function ClassDeclaration(id, superClass, body) {
            this.type = syntax_1.Syntax.ClassDeclaration;
            this.id = id;
            this.superClass = superClass;
            this.body = body;
        }
        return ClassDeclaration;
    }());
    exports.ClassDeclaration = ClassDeclaration;
    var ClassExpression = (function () {
        function ClassExpression(id, superClass, body) {
            this.type = syntax_1.Syntax.ClassExpression;
            this.id = id;
            this.superClass = superClass;
            this.body = body;
        }
        return ClassExpression;
    }());
    exports.ClassExpression = ClassExpression;
    var ComputedMemberExpression = (function () {
        function ComputedMemberExpression(object, property) {
            this.type = syntax_1.Syntax.MemberExpression;
            this.computed = true;
            this.object = object;
            this.property = property;
        }
        return ComputedMemberExpression;
    }());
    exports.ComputedMemberExpression = ComputedMemberExpression;
    var ConditionalExpression = (function () {
        function ConditionalExpression(test, consequent, alternate) {
            this.type = syntax_1.Syntax.ConditionalExpression;
            this.test = test;
            this.consequent = consequent;
            this.alternate = alternate;
        }
        return ConditionalExpression;
    }());
    exports.ConditionalExpression = ConditionalExpression;
    var ContinueStatement = (function () {
        function ContinueStatement(label) {
            this.type = syntax_1.Syntax.ContinueStatement;
            this.label = label;
        }
        return ContinueStatement;
    }());
    exports.ContinueStatement = ContinueStatement;
    var DebuggerStatement = (function () {
        function DebuggerStatement() {
            this.type = syntax_1.Syntax.DebuggerStatement;
        }
        return DebuggerStatement;
    }());
    exports.DebuggerStatement = DebuggerStatement;
    var Directive = (function () {
        function Directive(expression, directive) {
            this.type = syntax_1.Syntax.ExpressionStatement;
            this.expression = expression;
            this.directive = directive;
        }
        return Directive;
    }());
    exports.Directive = Directive;
    var DoWhileStatement = (function () {
        function DoWhileStatement(body, test) {
            this.type = syntax_1.Syntax.DoWhileStatement;
            this.body = body;
            this.test = test;
        }
        return DoWhileStatement;
    }());
    exports.DoWhileStatement = DoWhileStatement;
    var EmptyStatement = (function () {
        function EmptyStatement() {
            this.type = syntax_1.Syntax.EmptyStatement;
        }
        return EmptyStatement;
    }());
    exports.EmptyStatement = EmptyStatement;
    var ExportAllDeclaration = (function () {
        function ExportAllDeclaration(source) {
            this.type = syntax_1.Syntax.ExportAllDeclaration;
            this.source = source;
        }
        return ExportAllDeclaration;
    }());
    exports.ExportAllDeclaration = ExportAllDeclaration;
    var ExportDefaultDeclaration = (function () {
        function ExportDefaultDeclaration(declaration) {
            this.type = syntax_1.Syntax.ExportDefaultDeclaration;
            this.declaration = declaration;
        }
        return ExportDefaultDeclaration;
    }());
    exports.ExportDefaultDeclaration = ExportDefaultDeclaration;
    var ExportNamedDeclaration = (function () {
        function ExportNamedDeclaration(declaration, specifiers, source) {
            this.type = syntax_1.Syntax.ExportNamedDeclaration;
            this.declaration = declaration;
            this.specifiers = specifiers;
            this.source = source;
        }
        return ExportNamedDeclaration;
    }());
    exports.ExportNamedDeclaration = ExportNamedDeclaration;
    var ExportSpecifier = (function () {
        function ExportSpecifier(local, exported) {
            this.type = syntax_1.Syntax.ExportSpecifier;
            this.exported = exported;
            this.local = local;
        }
        return ExportSpecifier;
    }());
    exports.ExportSpecifier = ExportSpecifier;
    var ExpressionStatement = (function () {
        function ExpressionStatement(expression) {
            this.type = syntax_1.Syntax.ExpressionStatement;
            this.expression = expression;
        }
        return ExpressionStatement;
    }());
    exports.ExpressionStatement = ExpressionStatement;
    var ForInStatement = (function () {
        function ForInStatement(left, right, body) {
            this.type = syntax_1.Syntax.ForInStatement;
            this.left = left;
            this.right = right;
            this.body = body;
            this.each = false;
        }
        return ForInStatement;
    }());
    exports.ForInStatement = ForInStatement;
    var ForOfStatement = (function () {
        function ForOfStatement(left, right, body) {
            this.type = syntax_1.Syntax.ForOfStatement;
            this.left = left;
            this.right = right;
            this.body = body;
        }
        return ForOfStatement;
    }());
    exports.ForOfStatement = ForOfStatement;
    var ForStatement = (function () {
        function ForStatement(init, test, update, body) {
            this.type = syntax_1.Syntax.ForStatement;
            this.init = init;
            this.test = test;
            this.update = update;
            this.body = body;
        }
        return ForStatement;
    }());
    exports.ForStatement = ForStatement;
    var FunctionDeclaration = (function () {
        function FunctionDeclaration(id, params, body, generator) {
            this.type = syntax_1.Syntax.FunctionDeclaration;
            this.id = id;
            this.params = params;
            this.body = body;
            this.generator = generator;
            this.expression = false;
            this.async = false;
        }
        return FunctionDeclaration;
    }());
    exports.FunctionDeclaration = FunctionDeclaration;
    var FunctionExpression = (function () {
        function FunctionExpression(id, params, body, generator) {
            this.type = syntax_1.Syntax.FunctionExpression;
            this.id = id;
            this.params = params;
            this.body = body;
            this.generator = generator;
            this.expression = false;
            this.async = false;
        }
        return FunctionExpression;
    }());
    exports.FunctionExpression = FunctionExpression;
    var Identifier = (function () {
        function Identifier(name) {
            this.type = syntax_1.Syntax.Identifier;
            this.name = name;
        }
        return Identifier;
    }());
    exports.Identifier = Identifier;
    var IfStatement = (function () {
        function IfStatement(test, consequent, alternate) {
            this.type = syntax_1.Syntax.IfStatement;
            this.test = test;
            this.consequent = consequent;
            this.alternate = alternate;
        }
        return IfStatement;
    }());
    exports.IfStatement = IfStatement;
    var ImportDeclaration = (function () {
        function ImportDeclaration(specifiers, source) {
            this.type = syntax_1.Syntax.ImportDeclaration;
            this.specifiers = specifiers;
            this.source = source;
        }
        return ImportDeclaration;
    }());
    exports.ImportDeclaration = ImportDeclaration;
    var ImportDefaultSpecifier = (function () {
        function ImportDefaultSpecifier(local) {
            this.type = syntax_1.Syntax.ImportDefaultSpecifier;
            this.local = local;
        }
        return ImportDefaultSpecifier;
    }());
    exports.ImportDefaultSpecifier = ImportDefaultSpecifier;
    var ImportNamespaceSpecifier = (function () {
        function ImportNamespaceSpecifier(local) {
            this.type = syntax_1.Syntax.ImportNamespaceSpecifier;
            this.local = local;
        }
        return ImportNamespaceSpecifier;
    }());
    exports.ImportNamespaceSpecifier = ImportNamespaceSpecifier;
    var ImportSpecifier = (function () {
        function ImportSpecifier(local, imported) {
            this.type = syntax_1.Syntax.ImportSpecifier;
            this.local = local;
            this.imported = imported;
        }
        return ImportSpecifier;
    }());
    exports.ImportSpecifier = ImportSpecifier;
    var LabeledStatement = (function () {
        function LabeledStatement(label, body) {
            this.type = syntax_1.Syntax.LabeledStatement;
            this.label = label;
            this.body = body;
        }
        return LabeledStatement;
    }());
    exports.LabeledStatement = LabeledStatement;
    var Literal = (function () {
        function Literal(value, raw) {
            this.type = syntax_1.Syntax.Literal;
            this.value = value;
            this.raw = raw;
        }
        return Literal;
    }());
    exports.Literal = Literal;
    var MetaProperty = (function () {
        function MetaProperty(meta, property) {
            this.type = syntax_1.Syntax.MetaProperty;
            this.meta = meta;
            this.property = property;
        }
        return MetaProperty;
    }());
    exports.MetaProperty = MetaProperty;
    var MethodDefinition = (function () {
        function MethodDefinition(key, computed, value, kind, isStatic) {
            this.type = syntax_1.Syntax.MethodDefinition;
            this.key = key;
            this.computed = computed;
            this.value = value;
            this.kind = kind;
            this.static = isStatic;
        }
        return MethodDefinition;
    }());
    exports.MethodDefinition = MethodDefinition;
    var Module = (function () {
        function Module(body) {
            this.type = syntax_1.Syntax.Program;
            this.body = body;
            this.sourceType = 'module';
        }
        return Module;
    }());
    exports.Module = Module;
    var NewExpression = (function () {
        function NewExpression(callee, args) {
            this.type = syntax_1.Syntax.NewExpression;
            this.callee = callee;
            this.arguments = args;
        }
        return NewExpression;
    }());
    exports.NewExpression = NewExpression;
    var ObjectExpression = (function () {
        function ObjectExpression(properties) {
            this.type = syntax_1.Syntax.ObjectExpression;
            this.properties = properties;
        }
        return ObjectExpression;
    }());
    exports.ObjectExpression = ObjectExpression;
    var ObjectPattern = (function () {
        function ObjectPattern(properties) {
            this.type = syntax_1.Syntax.ObjectPattern;
            this.properties = properties;
        }
        return ObjectPattern;
    }());
    exports.ObjectPattern = ObjectPattern;
    var Property = (function () {
        function Property(kind, key, computed, value, method, shorthand) {
            this.type = syntax_1.Syntax.Property;
            this.key = key;
            this.computed = computed;
            this.value = value;
            this.kind = kind;
            this.method = method;
            this.shorthand = shorthand;
        }
        return Property;
    }());
    exports.Property = Property;
    var RegexLiteral = (function () {
        function RegexLiteral(value, raw, pattern, flags) {
            this.type = syntax_1.Syntax.Literal;
            this.value = value;
            this.raw = raw;
            this.regex = { pattern: pattern, flags: flags };
        }
        return RegexLiteral;
    }());
    exports.RegexLiteral = RegexLiteral;
    var RestElement = (function () {
        function RestElement(argument) {
            this.type = syntax_1.Syntax.RestElement;
            this.argument = argument;
        }
        return RestElement;
    }());
    exports.RestElement = RestElement;
    var ReturnStatement = (function () {
        function ReturnStatement(argument) {
            this.type = syntax_1.Syntax.ReturnStatement;
            this.argument = argument;
        }
        return ReturnStatement;
    }());
    exports.ReturnStatement = ReturnStatement;
    var Script = (function () {
        function Script(body) {
            this.type = syntax_1.Syntax.Program;
            this.body = body;
            this.sourceType = 'script';
        }
        return Script;
    }());
    exports.Script = Script;
    var SequenceExpression = (function () {
        function SequenceExpression(expressions) {
            this.type = syntax_1.Syntax.SequenceExpression;
            this.expressions = expressions;
        }
        return SequenceExpression;
    }());
    exports.SequenceExpression = SequenceExpression;
    var SpreadElement = (function () {
        function SpreadElement(argument) {
            this.type = syntax_1.Syntax.SpreadElement;
            this.argument = argument;
        }
        return SpreadElement;
    }());
    exports.SpreadElement = SpreadElement;
    var StaticMemberExpression = (function () {
        function StaticMemberExpression(object, property) {
            this.type = syntax_1.Syntax.MemberExpression;
            this.computed = false;
            this.object = object;
            this.property = property;
        }
        return StaticMemberExpression;
    }());
    exports.StaticMemberExpression = StaticMemberExpression;
    var Super = (function () {
        function Super() {
            this.type = syntax_1.Syntax.Super;
        }
        return Super;
    }());
    exports.Super = Super;
    var SwitchCase = (function () {
        function SwitchCase(test, consequent) {
            this.type = syntax_1.Syntax.SwitchCase;
            this.test = test;
            this.consequent = consequent;
        }
        return SwitchCase;
    }());
    exports.SwitchCase = SwitchCase;
    var SwitchStatement = (function () {
        function SwitchStatement(discriminant, cases) {
            this.type = syntax_1.Syntax.SwitchStatement;
            this.discriminant = discriminant;
            this.cases = cases;
        }
        return SwitchStatement;
    }());
    exports.SwitchStatement = SwitchStatement;
    var TaggedTemplateExpression = (function () {
        function TaggedTemplateExpression(tag, quasi) {
            this.type = syntax_1.Syntax.TaggedTemplateExpression;
            this.tag = tag;
            this.quasi = quasi;
        }
        return TaggedTemplateExpression;
    }());
    exports.TaggedTemplateExpression = TaggedTemplateExpression;
    var TemplateElement = (function () {
        function TemplateElement(value, tail) {
            this.type = syntax_1.Syntax.TemplateElement;
            this.value = value;
            this.tail = tail;
        }
        return TemplateElement;
    }());
    exports.TemplateElement = TemplateElement;
    var TemplateLiteral = (function () {
        function TemplateLiteral(quasis, expressions) {
            this.type = syntax_1.Syntax.TemplateLiteral;
            this.quasis = quasis;
            this.expressions = expressions;
        }
        return TemplateLiteral;
    }());
    exports.TemplateLiteral = TemplateLiteral;
    var ThisExpression = (function () {
        function ThisExpression() {
            this.type = syntax_1.Syntax.ThisExpression;
        }
        return ThisExpression;
    }());
    exports.ThisExpression = ThisExpression;
    var ThrowStatement = (function () {
        function ThrowStatement(argument) {
            this.type = syntax_1.Syntax.ThrowStatement;
            this.argument = argument;
        }
        return ThrowStatement;
    }());
    exports.ThrowStatement = ThrowStatement;
    var TryStatement = (function () {
        function TryStatement(block, handler, finalizer) {
            this.type = syntax_1.Syntax.TryStatement;
            this.block = block;
            this.handler = handler;
            this.finalizer = finalizer;
        }
        return TryStatement;
    }());
    exports.TryStatement = TryStatement;
    var UnaryExpression = (function () {
        function UnaryExpression(operator, argument) {
            this.type = syntax_1.Syntax.UnaryExpression;
            this.operator = operator;
            this.argument = argument;
            this.prefix = true;
        }
        return UnaryExpression;
    }());
    exports.UnaryExpression = UnaryExpression;
    var UpdateExpression = (function () {
        function UpdateExpression(operator, argument, prefix) {
            this.type = syntax_1.Syntax.UpdateExpression;
            this.operator = operator;
            this.argument = argument;
            this.prefix = prefix;
        }
        return UpdateExpression;
    }());
    exports.UpdateExpression = UpdateExpression;
    var VariableDeclaration = (function () {
        function VariableDeclaration(declarations, kind) {
            this.type = syntax_1.Syntax.VariableDeclaration;
            this.declarations = declarations;
            this.kind = kind;
        }
        return VariableDeclaration;
    }());
    exports.VariableDeclaration = VariableDeclaration;
    var VariableDeclarator = (function () {
        function VariableDeclarator(id, init) {
            this.type = syntax_1.Syntax.VariableDeclarator;
            this.id = id;
            this.init = init;
        }
        return VariableDeclarator;
    }());
    exports.VariableDeclarator = VariableDeclarator;
    var WhileStatement = (function () {
        function WhileStatement(test, body) {
            this.type = syntax_1.Syntax.WhileStatement;
            this.test = test;
            this.body = body;
        }
        return WhileStatement;
    }());
    exports.WhileStatement = WhileStatement;
    var WithStatement = (function () {
        function WithStatement(object, body) {
            this.type = syntax_1.Syntax.WithStatement;
            this.object = object;
            this.body = body;
        }
        return WithStatement;
    }());
    exports.WithStatement = WithStatement;
    var YieldExpression = (function () {
        function YieldExpression(argument, delegate) {
            this.type = syntax_1.Syntax.YieldExpression;
            this.argument = argument;
            this.delegate = delegate;
        }
        return YieldExpression;
    }());
    exports.YieldExpression = YieldExpression;
  
  
  /***/ },
  /* 8 */
  /***/ function(module, exports, __webpack_require__) {
  
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var assert_1 = __webpack_require__(9);
    var error_handler_1 = __webpack_require__(10);
    var messages_1 = __webpack_require__(11);
    var Node = __webpack_require__(7);
    var scanner_1 = __webpack_require__(12);
    var syntax_1 = __webpack_require__(2);
    var token_1 = __webpack_require__(13);
    var ArrowParameterPlaceHolder = 'ArrowParameterPlaceHolder';
    var Parser = (function () {
        function Parser(code, options, delegate) {
            if (options === void 0) { options = {}; }
            this.config = {
                range: (typeof options.range === 'boolean') && options.range,
                loc: (typeof options.loc === 'boolean') && options.loc,
                source: null,
                tokens: (typeof options.tokens === 'boolean') && options.tokens,
                comment: (typeof options.comment === 'boolean') && options.comment,
                tolerant: (typeof options.tolerant === 'boolean') && options.tolerant
            };
            if (this.config.loc && options.source && options.source !== null) {
                this.config.source = String(options.source);
            }
            this.delegate = delegate;
            this.errorHandler = new error_handler_1.ErrorHandler();
            this.errorHandler.tolerant = this.config.tolerant;
            this.scanner = new scanner_1.Scanner(code, this.errorHandler);
            this.scanner.trackComment = this.config.comment;
            this.operatorPrecedence = {
                ')': 0,
                ';': 0,
                ',': 0,
                '=': 0,
                ']': 0,
                '||': 1,
                '&&': 2,
                '|': 3,
                '^': 4,
                '&': 5,
                '==': 6,
                '!=': 6,
                '===': 6,
                '!==': 6,
                '<': 7,
                '>': 7,
                '<=': 7,
                '>=': 7,
                '<<': 8,
                '>>': 8,
                '>>>': 8,
                '+': 9,
                '-': 9,
                '*': 11,
                '/': 11,
                '%': 11
            };
            this.lookahead = {
                type: 2 /* EOF */,
                value: '',
                lineNumber: this.scanner.lineNumber,
                lineStart: 0,
                start: 0,
                end: 0
            };
            this.hasLineTerminator = false;
            this.context = {
                isModule: false,
                await: false,
                allowIn: true,
                allowStrictDirective: true,
                allowYield: true,
                firstCoverInitializedNameError: null,
                isAssignmentTarget: false,
                isBindingElement: false,
                inFunctionBody: false,
                inIteration: false,
                inSwitch: false,
                labelSet: {},
                strict: false
            };
            this.tokens = [];
            this.startMarker = {
                index: 0,
                line: this.scanner.lineNumber,
                column: 0
            };
            this.lastMarker = {
                index: 0,
                line: this.scanner.lineNumber,
                column: 0
            };
            this.nextToken();
            this.lastMarker = {
                index: this.scanner.index,
                line: this.scanner.lineNumber,
                column: this.scanner.index - this.scanner.lineStart
            };
        }
        Parser.prototype.throwError = function (messageFormat) {
            var values = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                values[_i - 1] = arguments[_i];
            }
            var args = Array.prototype.slice.call(arguments, 1);
            var msg = messageFormat.replace(/%(\d)/g, function (whole, idx) {
                assert_1.assert(idx < args.length, 'Message reference must be in range');
                return args[idx];
            });
            var index = this.lastMarker.index;
            var line = this.lastMarker.line;
            var column = this.lastMarker.column + 1;
            throw this.errorHandler.createError(index, line, column, msg);
        };
        Parser.prototype.tolerateError = function (messageFormat) {
            var values = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                values[_i - 1] = arguments[_i];
            }
            var args = Array.prototype.slice.call(arguments, 1);
            var msg = messageFormat.replace(/%(\d)/g, function (whole, idx) {
                assert_1.assert(idx < args.length, 'Message reference must be in range');
                return args[idx];
            });
            var index = this.lastMarker.index;
            var line = this.scanner.lineNumber;
            var column = this.lastMarker.column + 1;
            this.errorHandler.tolerateError(index, line, column, msg);
        };
        // Throw an exception because of the token.
        Parser.prototype.unexpectedTokenError = function (token, message) {
            var msg = message || messages_1.Messages.UnexpectedToken;
            var value;
            if (token) {
                if (!message) {
                    msg = (token.type === 2 /* EOF */) ? messages_1.Messages.UnexpectedEOS :
                        (token.type === 3 /* Identifier */) ? messages_1.Messages.UnexpectedIdentifier :
                            (token.type === 6 /* NumericLiteral */) ? messages_1.Messages.UnexpectedNumber :
                                (token.type === 8 /* StringLiteral */) ? messages_1.Messages.UnexpectedString :
                                    (token.type === 10 /* Template */) ? messages_1.Messages.UnexpectedTemplate :
                                        messages_1.Messages.UnexpectedToken;
                    if (token.type === 4 /* Keyword */) {
                        if (this.scanner.isFutureReservedWord(token.value)) {
                            msg = messages_1.Messages.UnexpectedReserved;
                        }
                        else if (this.context.strict && this.scanner.isStrictModeReservedWord(token.value)) {
                            msg = messages_1.Messages.StrictReservedWord;
                        }
                    }
                }
                value = token.value;
            }
            else {
                value = 'ILLEGAL';
            }
            msg = msg.replace('%0', value);
            if (token && typeof token.lineNumber === 'number') {
                var index = token.start;
                var line = token.lineNumber;
                var lastMarkerLineStart = this.lastMarker.index - this.lastMarker.column;
                var column = token.start - lastMarkerLineStart + 1;
                return this.errorHandler.createError(index, line, column, msg);
            }
            else {
                var index = this.lastMarker.index;
                var line = this.lastMarker.line;
                var column = this.lastMarker.column + 1;
                return this.errorHandler.createError(index, line, column, msg);
            }
        };
        Parser.prototype.throwUnexpectedToken = function (token, message) {
            throw this.unexpectedTokenError(token, message);
        };
        Parser.prototype.tolerateUnexpectedToken = function (token, message) {
            this.errorHandler.tolerate(this.unexpectedTokenError(token, message));
        };
        Parser.prototype.collectComments = function () {
            if (!this.config.comment) {
                this.scanner.scanComments();
            }
            else {
                var comments = this.scanner.scanComments();
                if (comments.length > 0 && this.delegate) {
                    for (var i = 0; i < comments.length; ++i) {
                        var e = comments[i];
                        var node = void 0;
                        node = {
                            type: e.multiLine ? 'BlockComment' : 'LineComment',
                            value: this.scanner.source.slice(e.slice[0], e.slice[1])
                        };
                        if (this.config.range) {
                            node.range = e.range;
                        }
                        if (this.config.loc) {
                            node.loc = e.loc;
                        }
                        var metadata = {
                            start: {
                                line: e.loc.start.line,
                                column: e.loc.start.column,
                                offset: e.range[0]
                            },
                            end: {
                                line: e.loc.end.line,
                                column: e.loc.end.column,
                                offset: e.range[1]
                            }
                        };
                        this.delegate(node, metadata);
                    }
                }
            }
        };
        // From internal representation to an external structure
        Parser.prototype.getTokenRaw = function (token) {
            return this.scanner.source.slice(token.start, token.end);
        };
        Parser.prototype.convertToken = function (token) {
            var t = {
                type: token_1.TokenName[token.type],
                value: this.getTokenRaw(token)
            };
            if (this.config.range) {
                t.range = [token.start, token.end];
            }
            if (this.config.loc) {
                t.loc = {
                    start: {
                        line: this.startMarker.line,
                        column: this.startMarker.column
                    },
                    end: {
                        line: this.scanner.lineNumber,
                        column: this.scanner.index - this.scanner.lineStart
                    }
                };
            }
            if (token.type === 9 /* RegularExpression */) {
                var pattern = token.pattern;
                var flags = token.flags;
                t.regex = { pattern: pattern, flags: flags };
            }
            return t;
        };
        Parser.prototype.nextToken = function () {
            var token = this.lookahead;
            this.lastMarker.index = this.scanner.index;
            this.lastMarker.line = this.scanner.lineNumber;
            this.lastMarker.column = this.scanner.index - this.scanner.lineStart;
            this.collectComments();
            if (this.scanner.index !== this.startMarker.index) {
                this.startMarker.index = this.scanner.index;
                this.startMarker.line = this.scanner.lineNumber;
                this.startMarker.column = this.scanner.index - this.scanner.lineStart;
            }
            var next = this.scanner.lex();
            this.hasLineTerminator = (token.lineNumber !== next.lineNumber);
            if (next && this.context.strict && next.type === 3 /* Identifier */) {
                if (this.scanner.isStrictModeReservedWord(next.value)) {
                    next.type = 4 /* Keyword */;
                }
            }
            this.lookahead = next;
            if (this.config.tokens && next.type !== 2 /* EOF */) {
                this.tokens.push(this.convertToken(next));
            }
            return token;
        };
        Parser.prototype.nextRegexToken = function () {
            this.collectComments();
            var token = this.scanner.scanRegExp();
            if (this.config.tokens) {
                // Pop the previous token, '/' or '/='
                // This is added from the lookahead token.
                this.tokens.pop();
                this.tokens.push(this.convertToken(token));
            }
            // Prime the next lookahead.
            this.lookahead = token;
            this.nextToken();
            return token;
        };
        Parser.prototype.createNode = function () {
            return {
                index: this.startMarker.index,
                line: this.startMarker.line,
                column: this.startMarker.column
            };
        };
        Parser.prototype.startNode = function (token, lastLineStart) {
            if (lastLineStart === void 0) { lastLineStart = 0; }
            var column = token.start - token.lineStart;
            var line = token.lineNumber;
            if (column < 0) {
                column += lastLineStart;
                line--;
            }
            return {
                index: token.start,
                line: line,
                column: column
            };
        };
        Parser.prototype.finalize = function (marker, node) {
            if (this.config.range) {
                node.range = [marker.index, this.lastMarker.index];
            }
            if (this.config.loc) {
                node.loc = {
                    start: {
                        line: marker.line,
                        column: marker.column,
                    },
                    end: {
                        line: this.lastMarker.line,
                        column: this.lastMarker.column
                    }
                };
                if (this.config.source) {
                    node.loc.source = this.config.source;
                }
            }
            if (this.delegate) {
                var metadata = {
                    start: {
                        line: marker.line,
                        column: marker.column,
                        offset: marker.index
                    },
                    end: {
                        line: this.lastMarker.line,
                        column: this.lastMarker.column,
                        offset: this.lastMarker.index
                    }
                };
                this.delegate(node, metadata);
            }
            return node;
        };
        // Expect the next token to match the specified punctuator.
        // If not, an exception will be thrown.
        Parser.prototype.expect = function (value) {
            var token = this.nextToken();
            if (token.type !== 7 /* Punctuator */ || token.value !== value) {
                this.throwUnexpectedToken(token);
            }
        };
        // Quietly expect a comma when in tolerant mode, otherwise delegates to expect().
        Parser.prototype.expectCommaSeparator = function () {
            if (this.config.tolerant) {
                var token = this.lookahead;
                if (token.type === 7 /* Punctuator */ && token.value === ',') {
                    this.nextToken();
                }
                else if (token.type === 7 /* Punctuator */ && token.value === ';') {
                    this.nextToken();
                    this.tolerateUnexpectedToken(token);
                }
                else {
                    this.tolerateUnexpectedToken(token, messages_1.Messages.UnexpectedToken);
                }
            }
            else {
                this.expect(',');
            }
        };
        // Expect the next token to match the specified keyword.
        // If not, an exception will be thrown.
        Parser.prototype.expectKeyword = function (keyword) {
            var token = this.nextToken();
            if (token.type !== 4 /* Keyword */ || token.value !== keyword) {
                this.throwUnexpectedToken(token);
            }
        };
        // Return true if the next token matches the specified punctuator.
        Parser.prototype.match = function (value) {
            return this.lookahead.type === 7 /* Punctuator */ && this.lookahead.value === value;
        };
        // Return true if the next token matches the specified keyword
        Parser.prototype.matchKeyword = function (keyword) {
            return this.lookahead.type === 4 /* Keyword */ && this.lookahead.value === keyword;
        };
        // Return true if the next token matches the specified contextual keyword
        // (where an identifier is sometimes a keyword depending on the context)
        Parser.prototype.matchContextualKeyword = function (keyword) {
            return this.lookahead.type === 3 /* Identifier */ && this.lookahead.value === keyword;
        };
        // Return true if the next token is an assignment operator
        Parser.prototype.matchAssign = function () {
            if (this.lookahead.type !== 7 /* Punctuator */) {
                return false;
            }
            var op = this.lookahead.value;
            return op === '=' ||
                op === '*=' ||
                op === '**=' ||
                op === '/=' ||
                op === '%=' ||
                op === '+=' ||
                op === '-=' ||
                op === '<<=' ||
                op === '>>=' ||
                op === '>>>=' ||
                op === '&=' ||
                op === '^=' ||
                op === '|=';
        };
        // Cover grammar support.
        //
        // When an assignment expression position starts with an left parenthesis, the determination of the type
        // of the syntax is to be deferred arbitrarily long until the end of the parentheses pair (plus a lookahead)
        // or the first comma. This situation also defers the determination of all the expressions nested in the pair.
        //
        // There are three productions that can be parsed in a parentheses pair that needs to be determined
        // after the outermost pair is closed. They are:
        //
        //   1. AssignmentExpression
        //   2. BindingElements
        //   3. AssignmentTargets
        //
        // In order to avoid exponential backtracking, we use two flags to denote if the production can be
        // binding element or assignment target.
        //
        // The three productions have the relationship:
        //
        //   BindingElements ⊆ AssignmentTargets ⊆ AssignmentExpression
        //
        // with a single exception that CoverInitializedName when used directly in an Expression, generates
        // an early error. Therefore, we need the third state, firstCoverInitializedNameError, to track the
        // first usage of CoverInitializedName and report it when we reached the end of the parentheses pair.
        //
        // isolateCoverGrammar function runs the given parser function with a new cover grammar context, and it does not
        // effect the current flags. This means the production the parser parses is only used as an expression. Therefore
        // the CoverInitializedName check is conducted.
        //
        // inheritCoverGrammar function runs the given parse function with a new cover grammar context, and it propagates
        // the flags outside of the parser. This means the production the parser parses is used as a part of a potential
        // pattern. The CoverInitializedName check is deferred.
        Parser.prototype.isolateCoverGrammar = function (parseFunction) {
            var previousIsBindingElement = this.context.isBindingElement;
            var previousIsAssignmentTarget = this.context.isAssignmentTarget;
            var previousFirstCoverInitializedNameError = this.context.firstCoverInitializedNameError;
            this.context.isBindingElement = true;
            this.context.isAssignmentTarget = true;
            this.context.firstCoverInitializedNameError = null;
            var result = parseFunction.call(this);
            if (this.context.firstCoverInitializedNameError !== null) {
                this.throwUnexpectedToken(this.context.firstCoverInitializedNameError);
            }
            this.context.isBindingElement = previousIsBindingElement;
            this.context.isAssignmentTarget = previousIsAssignmentTarget;
            this.context.firstCoverInitializedNameError = previousFirstCoverInitializedNameError;
            return result;
        };
        Parser.prototype.inheritCoverGrammar = function (parseFunction) {
            var previousIsBindingElement = this.context.isBindingElement;
            var previousIsAssignmentTarget = this.context.isAssignmentTarget;
            var previousFirstCoverInitializedNameError = this.context.firstCoverInitializedNameError;
            this.context.isBindingElement = true;
            this.context.isAssignmentTarget = true;
            this.context.firstCoverInitializedNameError = null;
            var result = parseFunction.call(this);
            this.context.isBindingElement = this.context.isBindingElement && previousIsBindingElement;
            this.context.isAssignmentTarget = this.context.isAssignmentTarget && previousIsAssignmentTarget;
            this.context.firstCoverInitializedNameError = previousFirstCoverInitializedNameError || this.context.firstCoverInitializedNameError;
            return result;
        };
        Parser.prototype.consumeSemicolon = function () {
            if (this.match(';')) {
                this.nextToken();
            }
            else if (!this.hasLineTerminator) {
                if (this.lookahead.type !== 2 /* EOF */ && !this.match('}')) {
                    this.throwUnexpectedToken(this.lookahead);
                }
                this.lastMarker.index = this.startMarker.index;
                this.lastMarker.line = this.startMarker.line;
                this.lastMarker.column = this.startMarker.column;
            }
        };
        // https://tc39.github.io/ecma262/#sec-primary-expression
        Parser.prototype.parsePrimaryExpression = function () {
            var node = this.createNode();
            var expr;
            var token, raw;
            switch (this.lookahead.type) {
                case 3 /* Identifier */:
                    if ((this.context.isModule || this.context.await) && this.lookahead.value === 'await') {
                        this.tolerateUnexpectedToken(this.lookahead);
                    }
                    expr = this.matchAsyncFunction() ? this.parseFunctionExpression() : this.finalize(node, new Node.Identifier(this.nextToken().value));
                    break;
                case 6 /* NumericLiteral */:
                case 8 /* StringLiteral */:
                    if (this.context.strict && this.lookahead.octal) {
                        this.tolerateUnexpectedToken(this.lookahead, messages_1.Messages.StrictOctalLiteral);
                    }
                    this.context.isAssignmentTarget = false;
                    this.context.isBindingElement = false;
                    token = this.nextToken();
                    raw = this.getTokenRaw(token);
                    expr = this.finalize(node, new Node.Literal(token.value, raw));
                    break;
                case 1 /* BooleanLiteral */:
                    this.context.isAssignmentTarget = false;
                    this.context.isBindingElement = false;
                    token = this.nextToken();
                    raw = this.getTokenRaw(token);
                    expr = this.finalize(node, new Node.Literal(token.value === 'true', raw));
                    break;
                case 5 /* NullLiteral */:
                    this.context.isAssignmentTarget = false;
                    this.context.isBindingElement = false;
                    token = this.nextToken();
                    raw = this.getTokenRaw(token);
                    expr = this.finalize(node, new Node.Literal(null, raw));
                    break;
                case 10 /* Template */:
                    expr = this.parseTemplateLiteral();
                    break;
                case 7 /* Punctuator */:
                    switch (this.lookahead.value) {
                        case '(':
                            this.context.isBindingElement = false;
                            expr = this.inheritCoverGrammar(this.parseGroupExpression);
                            break;
                        case '[':
                            expr = this.inheritCoverGrammar(this.parseArrayInitializer);
                            break;
                        case '{':
                            expr = this.inheritCoverGrammar(this.parseObjectInitializer);
                            break;
                        case '/':
                        case '/=':
                            this.context.isAssignmentTarget = false;
                            this.context.isBindingElement = false;
                            this.scanner.index = this.startMarker.index;
                            token = this.nextRegexToken();
                            raw = this.getTokenRaw(token);
                            expr = this.finalize(node, new Node.RegexLiteral(token.regex, raw, token.pattern, token.flags));
                            break;
                        default:
                            expr = this.throwUnexpectedToken(this.nextToken());
                    }
                    break;
                case 4 /* Keyword */:
                    if (!this.context.strict && this.context.allowYield && this.matchKeyword('yield')) {
                        expr = this.parseIdentifierName();
                    }
                    else if (!this.context.strict && this.matchKeyword('let')) {
                        expr = this.finalize(node, new Node.Identifier(this.nextToken().value));
                    }
                    else {
                        this.context.isAssignmentTarget = false;
                        this.context.isBindingElement = false;
                        if (this.matchKeyword('function')) {
                            expr = this.parseFunctionExpression();
                        }
                        else if (this.matchKeyword('this')) {
                            this.nextToken();
                            expr = this.finalize(node, new Node.ThisExpression());
                        }
                        else if (this.matchKeyword('class')) {
                            expr = this.parseClassExpression();
                        }
                        else {
                            expr = this.throwUnexpectedToken(this.nextToken());
                        }
                    }
                    break;
                default:
                    expr = this.throwUnexpectedToken(this.nextToken());
            }
            return expr;
        };
        // https://tc39.github.io/ecma262/#sec-array-initializer
        Parser.prototype.parseSpreadElement = function () {
            var node = this.createNode();
            this.expect('...');
            var arg = this.inheritCoverGrammar(this.parseAssignmentExpression);
            return this.finalize(node, new Node.SpreadElement(arg));
        };
        Parser.prototype.parseArrayInitializer = function () {
            var node = this.createNode();
            var elements = [];
            this.expect('[');
            while (!this.match(']')) {
                if (this.match(',')) {
                    this.nextToken();
                    elements.push(null);
                }
                else if (this.match('...')) {
                    var element = this.parseSpreadElement();
                    if (!this.match(']')) {
                        this.context.isAssignmentTarget = false;
                        this.context.isBindingElement = false;
                        this.expect(',');
                    }
                    elements.push(element);
                }
                else {
                    elements.push(this.inheritCoverGrammar(this.parseAssignmentExpression));
                    if (!this.match(']')) {
                        this.expect(',');
                    }
                }
            }
            this.expect(']');
            return this.finalize(node, new Node.ArrayExpression(elements));
        };
        // https://tc39.github.io/ecma262/#sec-object-initializer
        Parser.prototype.parsePropertyMethod = function (params) {
            this.context.isAssignmentTarget = false;
            this.context.isBindingElement = false;
            var previousStrict = this.context.strict;
            var previousAllowStrictDirective = this.context.allowStrictDirective;
            this.context.allowStrictDirective = params.simple;
            var body = this.isolateCoverGrammar(this.parseFunctionSourceElements);
            if (this.context.strict && params.firstRestricted) {
                this.tolerateUnexpectedToken(params.firstRestricted, params.message);
            }
            if (this.context.strict && params.stricted) {
                this.tolerateUnexpectedToken(params.stricted, params.message);
            }
            this.context.strict = previousStrict;
            this.context.allowStrictDirective = previousAllowStrictDirective;
            return body;
        };
        Parser.prototype.parsePropertyMethodFunction = function () {
            var isGenerator = false;
            var node = this.createNode();
            var previousAllowYield = this.context.allowYield;
            this.context.allowYield = true;
            var params = this.parseFormalParameters();
            var method = this.parsePropertyMethod(params);
            this.context.allowYield = previousAllowYield;
            return this.finalize(node, new Node.FunctionExpression(null, params.params, method, isGenerator));
        };
        Parser.prototype.parsePropertyMethodAsyncFunction = function () {
            var node = this.createNode();
            var previousAllowYield = this.context.allowYield;
            var previousAwait = this.context.await;
            this.context.allowYield = false;
            this.context.await = true;
            var params = this.parseFormalParameters();
            var method = this.parsePropertyMethod(params);
            this.context.allowYield = previousAllowYield;
            this.context.await = previousAwait;
            return this.finalize(node, new Node.AsyncFunctionExpression(null, params.params, method));
        };
        Parser.prototype.parseObjectPropertyKey = function () {
            var node = this.createNode();
            var token = this.nextToken();
            var key;
            switch (token.type) {
                case 8 /* StringLiteral */:
                case 6 /* NumericLiteral */:
                    if (this.context.strict && token.octal) {
                        this.tolerateUnexpectedToken(token, messages_1.Messages.StrictOctalLiteral);
                    }
                    var raw = this.getTokenRaw(token);
                    key = this.finalize(node, new Node.Literal(token.value, raw));
                    break;
                case 3 /* Identifier */:
                case 1 /* BooleanLiteral */:
                case 5 /* NullLiteral */:
                case 4 /* Keyword */:
                    key = this.finalize(node, new Node.Identifier(token.value));
                    break;
                case 7 /* Punctuator */:
                    if (token.value === '[') {
                        key = this.isolateCoverGrammar(this.parseAssignmentExpression);
                        this.expect(']');
                    }
                    else {
                        key = this.throwUnexpectedToken(token);
                    }
                    break;
                default:
                    key = this.throwUnexpectedToken(token);
            }
            return key;
        };
        Parser.prototype.isPropertyKey = function (key, value) {
            return (key.type === syntax_1.Syntax.Identifier && key.name === value) ||
                (key.type === syntax_1.Syntax.Literal && key.value === value);
        };
        Parser.prototype.parseObjectProperty = function (hasProto) {
            var node = this.createNode();
            var token = this.lookahead;
            var kind;
            var key = null;
            var value = null;
            var computed = false;
            var method = false;
            var shorthand = false;
            var isAsync = false;
            if (token.type === 3 /* Identifier */) {
                var id = token.value;
                this.nextToken();
                computed = this.match('[');
                isAsync = !this.hasLineTerminator && (id === 'async') &&
                    !this.match(':') && !this.match('(') && !this.match('*') && !this.match(',');
                key = isAsync ? this.parseObjectPropertyKey() : this.finalize(node, new Node.Identifier(id));
            }
            else if (this.match('*')) {
                this.nextToken();
            }
            else {
                computed = this.match('[');
                key = this.parseObjectPropertyKey();
            }
            var lookaheadPropertyKey = this.qualifiedPropertyName(this.lookahead);
            if (token.type === 3 /* Identifier */ && !isAsync && token.value === 'get' && lookaheadPropertyKey) {
                kind = 'get';
                computed = this.match('[');
                key = this.parseObjectPropertyKey();
                this.context.allowYield = false;
                value = this.parseGetterMethod();
            }
            else if (token.type === 3 /* Identifier */ && !isAsync && token.value === 'set' && lookaheadPropertyKey) {
                kind = 'set';
                computed = this.match('[');
                key = this.parseObjectPropertyKey();
                value = this.parseSetterMethod();
            }
            else if (token.type === 7 /* Punctuator */ && token.value === '*' && lookaheadPropertyKey) {
                kind = 'init';
                computed = this.match('[');
                key = this.parseObjectPropertyKey();
                value = this.parseGeneratorMethod();
                method = true;
            }
            else {
                if (!key) {
                    this.throwUnexpectedToken(this.lookahead);
                }
                kind = 'init';
                if (this.match(':') && !isAsync) {
                    if (!computed && this.isPropertyKey(key, '__proto__')) {
                        if (hasProto.value) {
                            this.tolerateError(messages_1.Messages.DuplicateProtoProperty);
                        }
                        hasProto.value = true;
                    }
                    this.nextToken();
                    value = this.inheritCoverGrammar(this.parseAssignmentExpression);
                }
                else if (this.match('(')) {
                    value = isAsync ? this.parsePropertyMethodAsyncFunction() : this.parsePropertyMethodFunction();
                    method = true;
                }
                else if (token.type === 3 /* Identifier */) {
                    var id = this.finalize(node, new Node.Identifier(token.value));
                    if (this.match('=')) {
                        this.context.firstCoverInitializedNameError = this.lookahead;
                        this.nextToken();
                        shorthand = true;
                        var init = this.isolateCoverGrammar(this.parseAssignmentExpression);
                        value = this.finalize(node, new Node.AssignmentPattern(id, init));
                    }
                    else {
                        shorthand = true;
                        value = id;
                    }
                }
                else {
                    this.throwUnexpectedToken(this.nextToken());
                }
            }
            return this.finalize(node, new Node.Property(kind, key, computed, value, method, shorthand));
        };
        Parser.prototype.parseObjectInitializer = function () {
            var node = this.createNode();
            this.expect('{');
            var properties = [];
            var hasProto = { value: false };
            while (!this.match('}')) {
                properties.push(this.parseObjectProperty(hasProto));
                if (!this.match('}')) {
                    this.expectCommaSeparator();
                }
            }
            this.expect('}');
            return this.finalize(node, new Node.ObjectExpression(properties));
        };
        // https://tc39.github.io/ecma262/#sec-template-literals
        Parser.prototype.parseTemplateHead = function () {
            assert_1.assert(this.lookahead.head, 'Template literal must start with a template head');
            var node = this.createNode();
            var token = this.nextToken();
            var raw = token.value;
            var cooked = token.cooked;
            return this.finalize(node, new Node.TemplateElement({ raw: raw, cooked: cooked }, token.tail));
        };
        Parser.prototype.parseTemplateElement = function () {
            if (this.lookahead.type !== 10 /* Template */) {
                this.throwUnexpectedToken();
            }
            var node = this.createNode();
            var token = this.nextToken();
            var raw = token.value;
            var cooked = token.cooked;
            return this.finalize(node, new Node.TemplateElement({ raw: raw, cooked: cooked }, token.tail));
        };
        Parser.prototype.parseTemplateLiteral = function () {
            var node = this.createNode();
            var expressions = [];
            var quasis = [];
            var quasi = this.parseTemplateHead();
            quasis.push(quasi);
            while (!quasi.tail) {
                expressions.push(this.parseExpression());
                quasi = this.parseTemplateElement();
                quasis.push(quasi);
            }
            return this.finalize(node, new Node.TemplateLiteral(quasis, expressions));
        };
        // https://tc39.github.io/ecma262/#sec-grouping-operator
        Parser.prototype.reinterpretExpressionAsPattern = function (expr) {
            switch (expr.type) {
                case syntax_1.Syntax.Identifier:
                case syntax_1.Syntax.MemberExpression:
                case syntax_1.Syntax.RestElement:
                case syntax_1.Syntax.AssignmentPattern:
                    break;
                case syntax_1.Syntax.SpreadElement:
                    expr.type = syntax_1.Syntax.RestElement;
                    this.reinterpretExpressionAsPattern(expr.argument);
                    break;
                case syntax_1.Syntax.ArrayExpression:
                    expr.type = syntax_1.Syntax.ArrayPattern;
                    for (var i = 0; i < expr.elements.length; i++) {
                        if (expr.elements[i] !== null) {
                            this.reinterpretExpressionAsPattern(expr.elements[i]);
                        }
                    }
                    break;
                case syntax_1.Syntax.ObjectExpression:
                    expr.type = syntax_1.Syntax.ObjectPattern;
                    for (var i = 0; i < expr.properties.length; i++) {
                        this.reinterpretExpressionAsPattern(expr.properties[i].value);
                    }
                    break;
                case syntax_1.Syntax.AssignmentExpression:
                    expr.type = syntax_1.Syntax.AssignmentPattern;
                    delete expr.operator;
                    this.reinterpretExpressionAsPattern(expr.left);
                    break;
                default:
                    // Allow other node type for tolerant parsing.
                    break;
            }
        };
        Parser.prototype.parseGroupExpression = function () {
            var expr;
            this.expect('(');
            if (this.match(')')) {
                this.nextToken();
                if (!this.match('=>')) {
                    this.expect('=>');
                }
                expr = {
                    type: ArrowParameterPlaceHolder,
                    params: [],
                    async: false
                };
            }
            else {
                var startToken = this.lookahead;
                var params = [];
                if (this.match('...')) {
                    expr = this.parseRestElement(params);
                    this.expect(')');
                    if (!this.match('=>')) {
                        this.expect('=>');
                    }
                    expr = {
                        type: ArrowParameterPlaceHolder,
                        params: [expr],
                        async: false
                    };
                }
                else {
                    var arrow = false;
                    this.context.isBindingElement = true;
                    expr = this.inheritCoverGrammar(this.parseAssignmentExpression);
                    if (this.match(',')) {
                        var expressions = [];
                        this.context.isAssignmentTarget = false;
                        expressions.push(expr);
                        while (this.lookahead.type !== 2 /* EOF */) {
                            if (!this.match(',')) {
                                break;
                            }
                            this.nextToken();
                            if (this.match(')')) {
                                this.nextToken();
                                for (var i = 0; i < expressions.length; i++) {
                                    this.reinterpretExpressionAsPattern(expressions[i]);
                                }
                                arrow = true;
                                expr = {
                                    type: ArrowParameterPlaceHolder,
                                    params: expressions,
                                    async: false
                                };
                            }
                            else if (this.match('...')) {
                                if (!this.context.isBindingElement) {
                                    this.throwUnexpectedToken(this.lookahead);
                                }
                                expressions.push(this.parseRestElement(params));
                                this.expect(')');
                                if (!this.match('=>')) {
                                    this.expect('=>');
                                }
                                this.context.isBindingElement = false;
                                for (var i = 0; i < expressions.length; i++) {
                                    this.reinterpretExpressionAsPattern(expressions[i]);
                                }
                                arrow = true;
                                expr = {
                                    type: ArrowParameterPlaceHolder,
                                    params: expressions,
                                    async: false
                                };
                            }
                            else {
                                expressions.push(this.inheritCoverGrammar(this.parseAssignmentExpression));
                            }
                            if (arrow) {
                                break;
                            }
                        }
                        if (!arrow) {
                            expr = this.finalize(this.startNode(startToken), new Node.SequenceExpression(expressions));
                        }
                    }
                    if (!arrow) {
                        this.expect(')');
                        if (this.match('=>')) {
                            if (expr.type === syntax_1.Syntax.Identifier && expr.name === 'yield') {
                                arrow = true;
                                expr = {
                                    type: ArrowParameterPlaceHolder,
                                    params: [expr],
                                    async: false
                                };
                            }
                            if (!arrow) {
                                if (!this.context.isBindingElement) {
                                    this.throwUnexpectedToken(this.lookahead);
                                }
                                if (expr.type === syntax_1.Syntax.SequenceExpression) {
                                    for (var i = 0; i < expr.expressions.length; i++) {
                                        this.reinterpretExpressionAsPattern(expr.expressions[i]);
                                    }
                                }
                                else {
                                    this.reinterpretExpressionAsPattern(expr);
                                }
                                var parameters = (expr.type === syntax_1.Syntax.SequenceExpression ? expr.expressions : [expr]);
                                expr = {
                                    type: ArrowParameterPlaceHolder,
                                    params: parameters,
                                    async: false
                                };
                            }
                        }
                        this.context.isBindingElement = false;
                    }
                }
            }
            return expr;
        };
        // https://tc39.github.io/ecma262/#sec-left-hand-side-expressions
        Parser.prototype.parseArguments = function () {
            this.expect('(');
            var args = [];
            if (!this.match(')')) {
                while (true) {
                    var expr = this.match('...') ? this.parseSpreadElement() :
                        this.isolateCoverGrammar(this.parseAssignmentExpression);
                    args.push(expr);
                    if (this.match(')')) {
                        break;
                    }
                    this.expectCommaSeparator();
                    if (this.match(')')) {
                        break;
                    }
                }
            }
            this.expect(')');
            return args;
        };
        Parser.prototype.isIdentifierName = function (token) {
            return token.type === 3 /* Identifier */ ||
                token.type === 4 /* Keyword */ ||
                token.type === 1 /* BooleanLiteral */ ||
                token.type === 5 /* NullLiteral */;
        };
        Parser.prototype.parseIdentifierName = function () {
            var node = this.createNode();
            var token = this.nextToken();
            if (!this.isIdentifierName(token)) {
                this.throwUnexpectedToken(token);
            }
            return this.finalize(node, new Node.Identifier(token.value));
        };
        Parser.prototype.parseNewExpression = function () {
            var node = this.createNode();
            var id = this.parseIdentifierName();
            assert_1.assert(id.name === 'new', 'New expression must start with `new`');
            var expr;
            if (this.match('.')) {
                this.nextToken();
                if (this.lookahead.type === 3 /* Identifier */ && this.context.inFunctionBody && this.lookahead.value === 'target') {
                    var property = this.parseIdentifierName();
                    expr = new Node.MetaProperty(id, property);
                }
                else {
                    this.throwUnexpectedToken(this.lookahead);
                }
            }
            else {
                var callee = this.isolateCoverGrammar(this.parseLeftHandSideExpression);
                var args = this.match('(') ? this.parseArguments() : [];
                expr = new Node.NewExpression(callee, args);
                this.context.isAssignmentTarget = false;
                this.context.isBindingElement = false;
            }
            return this.finalize(node, expr);
        };
        Parser.prototype.parseAsyncArgument = function () {
            var arg = this.parseAssignmentExpression();
            this.context.firstCoverInitializedNameError = null;
            return arg;
        };
        Parser.prototype.parseAsyncArguments = function () {
            this.expect('(');
            var args = [];
            if (!this.match(')')) {
                while (true) {
                    var expr = this.match('...') ? this.parseSpreadElement() :
                        this.isolateCoverGrammar(this.parseAsyncArgument);
                    args.push(expr);
                    if (this.match(')')) {
                        break;
                    }
                    this.expectCommaSeparator();
                    if (this.match(')')) {
                        break;
                    }
                }
            }
            this.expect(')');
            return args;
        };
        Parser.prototype.parseLeftHandSideExpressionAllowCall = function () {
            var startToken = this.lookahead;
            var maybeAsync = this.matchContextualKeyword('async');
            var previousAllowIn = this.context.allowIn;
            this.context.allowIn = true;
            var expr;
            if (this.matchKeyword('super') && this.context.inFunctionBody) {
                expr = this.createNode();
                this.nextToken();
                expr = this.finalize(expr, new Node.Super());
                if (!this.match('(') && !this.match('.') && !this.match('[')) {
                    this.throwUnexpectedToken(this.lookahead);
                }
            }
            else {
                expr = this.inheritCoverGrammar(this.matchKeyword('new') ? this.parseNewExpression : this.parsePrimaryExpression);
            }
            while (true) {
                if (this.match('.')) {
                    this.context.isBindingElement = false;
                    this.context.isAssignmentTarget = true;
                    this.expect('.');
                    var property = this.parseIdentifierName();
                    expr = this.finalize(this.startNode(startToken), new Node.StaticMemberExpression(expr, property));
                }
                else if (this.match('(')) {
                    var asyncArrow = maybeAsync && (startToken.lineNumber === this.lookahead.lineNumber);
                    this.context.isBindingElement = false;
                    this.context.isAssignmentTarget = false;
                    var args = asyncArrow ? this.parseAsyncArguments() : this.parseArguments();
                    expr = this.finalize(this.startNode(startToken), new Node.CallExpression(expr, args));
                    if (asyncArrow && this.match('=>')) {
                        for (var i = 0; i < args.length; ++i) {
                            this.reinterpretExpressionAsPattern(args[i]);
                        }
                        expr = {
                            type: ArrowParameterPlaceHolder,
                            params: args,
                            async: true
                        };
                    }
                }
                else if (this.match('[')) {
                    this.context.isBindingElement = false;
                    this.context.isAssignmentTarget = true;
                    this.expect('[');
                    var property = this.isolateCoverGrammar(this.parseExpression);
                    this.expect(']');
                    expr = this.finalize(this.startNode(startToken), new Node.ComputedMemberExpression(expr, property));
                }
                else if (this.lookahead.type === 10 /* Template */ && this.lookahead.head) {
                    var quasi = this.parseTemplateLiteral();
                    expr = this.finalize(this.startNode(startToken), new Node.TaggedTemplateExpression(expr, quasi));
                }
                else {
                    break;
                }
            }
            this.context.allowIn = previousAllowIn;
            return expr;
        };
        Parser.prototype.parseSuper = function () {
            var node = this.createNode();
            this.expectKeyword('super');
            if (!this.match('[') && !this.match('.')) {
                this.throwUnexpectedToken(this.lookahead);
            }
            return this.finalize(node, new Node.Super());
        };
        Parser.prototype.parseLeftHandSideExpression = function () {
            assert_1.assert(this.context.allowIn, 'callee of new expression always allow in keyword.');
            var node = this.startNode(this.lookahead);
            var expr = (this.matchKeyword('super') && this.context.inFunctionBody) ? this.parseSuper() :
                this.inheritCoverGrammar(this.matchKeyword('new') ? this.parseNewExpression : this.parsePrimaryExpression);
            while (true) {
                if (this.match('[')) {
                    this.context.isBindingElement = false;
                    this.context.isAssignmentTarget = true;
                    this.expect('[');
                    var property = this.isolateCoverGrammar(this.parseExpression);
                    this.expect(']');
                    expr = this.finalize(node, new Node.ComputedMemberExpression(expr, property));
                }
                else if (this.match('.')) {
                    this.context.isBindingElement = false;
                    this.context.isAssignmentTarget = true;
                    this.expect('.');
                    var property = this.parseIdentifierName();
                    expr = this.finalize(node, new Node.StaticMemberExpression(expr, property));
                }
                else if (this.lookahead.type === 10 /* Template */ && this.lookahead.head) {
                    var quasi = this.parseTemplateLiteral();
                    expr = this.finalize(node, new Node.TaggedTemplateExpression(expr, quasi));
                }
                else {
                    break;
                }
            }
            return expr;
        };
        // https://tc39.github.io/ecma262/#sec-update-expressions
        Parser.prototype.parseUpdateExpression = function () {
            var expr;
            var startToken = this.lookahead;
            if (this.match('++') || this.match('--')) {
                var node = this.startNode(startToken);
                var token = this.nextToken();
                expr = this.inheritCoverGrammar(this.parseUnaryExpression);
                if (this.context.strict && expr.type === syntax_1.Syntax.Identifier && this.scanner.isRestrictedWord(expr.name)) {
                    this.tolerateError(messages_1.Messages.StrictLHSPrefix);
                }
                if (!this.context.isAssignmentTarget) {
                    this.tolerateError(messages_1.Messages.InvalidLHSInAssignment);
                }
                var prefix = true;
                expr = this.finalize(node, new Node.UpdateExpression(token.value, expr, prefix));
                this.context.isAssignmentTarget = false;
                this.context.isBindingElement = false;
            }
            else {
                expr = this.inheritCoverGrammar(this.parseLeftHandSideExpressionAllowCall);
                if (!this.hasLineTerminator && this.lookahead.type === 7 /* Punctuator */) {
                    if (this.match('++') || this.match('--')) {
                        if (this.context.strict && expr.type === syntax_1.Syntax.Identifier && this.scanner.isRestrictedWord(expr.name)) {
                            this.tolerateError(messages_1.Messages.StrictLHSPostfix);
                        }
                        if (!this.context.isAssignmentTarget) {
                            this.tolerateError(messages_1.Messages.InvalidLHSInAssignment);
                        }
                        this.context.isAssignmentTarget = false;
                        this.context.isBindingElement = false;
                        var operator = this.nextToken().value;
                        var prefix = false;
                        expr = this.finalize(this.startNode(startToken), new Node.UpdateExpression(operator, expr, prefix));
                    }
                }
            }
            return expr;
        };
        // https://tc39.github.io/ecma262/#sec-unary-operators
        Parser.prototype.parseAwaitExpression = function () {
            var node = this.createNode();
            this.nextToken();
            var argument = this.parseUnaryExpression();
            return this.finalize(node, new Node.AwaitExpression(argument));
        };
        Parser.prototype.parseUnaryExpression = function () {
            var expr;
            if (this.match('+') || this.match('-') || this.match('~') || this.match('!') ||
                this.matchKeyword('delete') || this.matchKeyword('void') || this.matchKeyword('typeof')) {
                var node = this.startNode(this.lookahead);
                var token = this.nextToken();
                expr = this.inheritCoverGrammar(this.parseUnaryExpression);
                expr = this.finalize(node, new Node.UnaryExpression(token.value, expr));
                if (this.context.strict && expr.operator === 'delete' && expr.argument.type === syntax_1.Syntax.Identifier) {
                    this.tolerateError(messages_1.Messages.StrictDelete);
                }
                this.context.isAssignmentTarget = false;
                this.context.isBindingElement = false;
            }
            else if (this.context.await && this.matchContextualKeyword('await')) {
                expr = this.parseAwaitExpression();
            }
            else {
                expr = this.parseUpdateExpression();
            }
            return expr;
        };
        Parser.prototype.parseExponentiationExpression = function () {
            var startToken = this.lookahead;
            var expr = this.inheritCoverGrammar(this.parseUnaryExpression);
            if (expr.type !== syntax_1.Syntax.UnaryExpression && this.match('**')) {
                this.nextToken();
                this.context.isAssignmentTarget = false;
                this.context.isBindingElement = false;
                var left = expr;
                var right = this.isolateCoverGrammar(this.parseExponentiationExpression);
                expr = this.finalize(this.startNode(startToken), new Node.BinaryExpression('**', left, right));
            }
            return expr;
        };
        // https://tc39.github.io/ecma262/#sec-exp-operator
        // https://tc39.github.io/ecma262/#sec-multiplicative-operators
        // https://tc39.github.io/ecma262/#sec-additive-operators
        // https://tc39.github.io/ecma262/#sec-bitwise-shift-operators
        // https://tc39.github.io/ecma262/#sec-relational-operators
        // https://tc39.github.io/ecma262/#sec-equality-operators
        // https://tc39.github.io/ecma262/#sec-binary-bitwise-operators
        // https://tc39.github.io/ecma262/#sec-binary-logical-operators
        Parser.prototype.binaryPrecedence = function (token) {
            var op = token.value;
            var precedence;
            if (token.type === 7 /* Punctuator */) {
                precedence = this.operatorPrecedence[op] || 0;
            }
            else if (token.type === 4 /* Keyword */) {
                precedence = (op === 'instanceof' || (this.context.allowIn && op === 'in')) ? 7 : 0;
            }
            else {
                precedence = 0;
            }
            return precedence;
        };
        Parser.prototype.parseBinaryExpression = function () {
            var startToken = this.lookahead;
            var expr = this.inheritCoverGrammar(this.parseExponentiationExpression);
            var token = this.lookahead;
            var prec = this.binaryPrecedence(token);
            if (prec > 0) {
                this.nextToken();
                this.context.isAssignmentTarget = false;
                this.context.isBindingElement = false;
                var markers = [startToken, this.lookahead];
                var left = expr;
                var right = this.isolateCoverGrammar(this.parseExponentiationExpression);
                var stack = [left, token.value, right];
                var precedences = [prec];
                while (true) {
                    prec = this.binaryPrecedence(this.lookahead);
                    if (prec <= 0) {
                        break;
                    }
                    // Reduce: make a binary expression from the three topmost entries.
                    while ((stack.length > 2) && (prec <= precedences[precedences.length - 1])) {
                        right = stack.pop();
                        var operator = stack.pop();
                        precedences.pop();
                        left = stack.pop();
                        markers.pop();
                        var node = this.startNode(markers[markers.length - 1]);
                        stack.push(this.finalize(node, new Node.BinaryExpression(operator, left, right)));
                    }
                    // Shift.
                    stack.push(this.nextToken().value);
                    precedences.push(prec);
                    markers.push(this.lookahead);
                    stack.push(this.isolateCoverGrammar(this.parseExponentiationExpression));
                }
                // Final reduce to clean-up the stack.
                var i = stack.length - 1;
                expr = stack[i];
                var lastMarker = markers.pop();
                while (i > 1) {
                    var marker = markers.pop();
                    var lastLineStart = lastMarker && lastMarker.lineStart;
                    var node = this.startNode(marker, lastLineStart);
                    var operator = stack[i - 1];
                    expr = this.finalize(node, new Node.BinaryExpression(operator, stack[i - 2], expr));
                    i -= 2;
                    lastMarker = marker;
                }
            }
            return expr;
        };
        // https://tc39.github.io/ecma262/#sec-conditional-operator
        Parser.prototype.parseConditionalExpression = function () {
            var startToken = this.lookahead;
            var expr = this.inheritCoverGrammar(this.parseBinaryExpression);
            if (this.match('?')) {
                this.nextToken();
                var previousAllowIn = this.context.allowIn;
                this.context.allowIn = true;
                var consequent = this.isolateCoverGrammar(this.parseAssignmentExpression);
                this.context.allowIn = previousAllowIn;
                this.expect(':');
                var alternate = this.isolateCoverGrammar(this.parseAssignmentExpression);
                expr = this.finalize(this.startNode(startToken), new Node.ConditionalExpression(expr, consequent, alternate));
                this.context.isAssignmentTarget = false;
                this.context.isBindingElement = false;
            }
            return expr;
        };
        // https://tc39.github.io/ecma262/#sec-assignment-operators
        Parser.prototype.checkPatternParam = function (options, param) {
            switch (param.type) {
                case syntax_1.Syntax.Identifier:
                    this.validateParam(options, param, param.name);
                    break;
                case syntax_1.Syntax.RestElement:
                    this.checkPatternParam(options, param.argument);
                    break;
                case syntax_1.Syntax.AssignmentPattern:
                    this.checkPatternParam(options, param.left);
                    break;
                case syntax_1.Syntax.ArrayPattern:
                    for (var i = 0; i < param.elements.length; i++) {
                        if (param.elements[i] !== null) {
                            this.checkPatternParam(options, param.elements[i]);
                        }
                    }
                    break;
                case syntax_1.Syntax.ObjectPattern:
                    for (var i = 0; i < param.properties.length; i++) {
                        this.checkPatternParam(options, param.properties[i].value);
                    }
                    break;
                default:
                    break;
            }
            options.simple = options.simple && (param instanceof Node.Identifier);
        };
        Parser.prototype.reinterpretAsCoverFormalsList = function (expr) {
            var params = [expr];
            var options;
            var asyncArrow = false;
            switch (expr.type) {
                case syntax_1.Syntax.Identifier:
                    break;
                case ArrowParameterPlaceHolder:
                    params = expr.params;
                    asyncArrow = expr.async;
                    break;
                default:
                    return null;
            }
            options = {
                simple: true,
                paramSet: {}
            };
            for (var i = 0; i < params.length; ++i) {
                var param = params[i];
                if (param.type === syntax_1.Syntax.AssignmentPattern) {
                    if (param.right.type === syntax_1.Syntax.YieldExpression) {
                        if (param.right.argument) {
                            this.throwUnexpectedToken(this.lookahead);
                        }
                        param.right.type = syntax_1.Syntax.Identifier;
                        param.right.name = 'yield';
                        delete param.right.argument;
                        delete param.right.delegate;
                    }
                }
                else if (asyncArrow && param.type === syntax_1.Syntax.Identifier && param.name === 'await') {
                    this.throwUnexpectedToken(this.lookahead);
                }
                this.checkPatternParam(options, param);
                params[i] = param;
            }
            if (this.context.strict || !this.context.allowYield) {
                for (var i = 0; i < params.length; ++i) {
                    var param = params[i];
                    if (param.type === syntax_1.Syntax.YieldExpression) {
                        this.throwUnexpectedToken(this.lookahead);
                    }
                }
            }
            if (options.message === messages_1.Messages.StrictParamDupe) {
                var token = this.context.strict ? options.stricted : options.firstRestricted;
                this.throwUnexpectedToken(token, options.message);
            }
            return {
                simple: options.simple,
                params: params,
                stricted: options.stricted,
                firstRestricted: options.firstRestricted,
                message: options.message
            };
        };
        Parser.prototype.parseAssignmentExpression = function () {
            var expr;
            if (!this.context.allowYield && this.matchKeyword('yield')) {
                expr = this.parseYieldExpression();
            }
            else {
                var startToken = this.lookahead;
                var token = startToken;
                expr = this.parseConditionalExpression();
                if (token.type === 3 /* Identifier */ && (token.lineNumber === this.lookahead.lineNumber) && token.value === 'async') {
                    if (this.lookahead.type === 3 /* Identifier */ || this.matchKeyword('yield')) {
                        var arg = this.parsePrimaryExpression();
                        this.reinterpretExpressionAsPattern(arg);
                        expr = {
                            type: ArrowParameterPlaceHolder,
                            params: [arg],
                            async: true
                        };
                    }
                }
                if (expr.type === ArrowParameterPlaceHolder || this.match('=>')) {
                    // https://tc39.github.io/ecma262/#sec-arrow-function-definitions
                    this.context.isAssignmentTarget = false;
                    this.context.isBindingElement = false;
                    var isAsync = expr.async;
                    var list = this.reinterpretAsCoverFormalsList(expr);
                    if (list) {
                        if (this.hasLineTerminator) {
                            this.tolerateUnexpectedToken(this.lookahead);
                        }
                        this.context.firstCoverInitializedNameError = null;
                        var previousStrict = this.context.strict;
                        var previousAllowStrictDirective = this.context.allowStrictDirective;
                        this.context.allowStrictDirective = list.simple;
                        var previousAllowYield = this.context.allowYield;
                        var previousAwait = this.context.await;
                        this.context.allowYield = true;
                        this.context.await = isAsync;
                        var node = this.startNode(startToken);
                        this.expect('=>');
                        var body = void 0;
                        if (this.match('{')) {
                            var previousAllowIn = this.context.allowIn;
                            this.context.allowIn = true;
                            body = this.parseFunctionSourceElements();
                            this.context.allowIn = previousAllowIn;
                        }
                        else {
                            body = this.isolateCoverGrammar(this.parseAssignmentExpression);
                        }
                        var expression = body.type !== syntax_1.Syntax.BlockStatement;
                        if (this.context.strict && list.firstRestricted) {
                            this.throwUnexpectedToken(list.firstRestricted, list.message);
                        }
                        if (this.context.strict && list.stricted) {
                            this.tolerateUnexpectedToken(list.stricted, list.message);
                        }
                        expr = isAsync ? this.finalize(node, new Node.AsyncArrowFunctionExpression(list.params, body, expression)) :
                            this.finalize(node, new Node.ArrowFunctionExpression(list.params, body, expression));
                        this.context.strict = previousStrict;
                        this.context.allowStrictDirective = previousAllowStrictDirective;
                        this.context.allowYield = previousAllowYield;
                        this.context.await = previousAwait;
                    }
                }
                else {
                    if (this.matchAssign()) {
                        if (!this.context.isAssignmentTarget) {
                            this.tolerateError(messages_1.Messages.InvalidLHSInAssignment);
                        }
                        if (this.context.strict && expr.type === syntax_1.Syntax.Identifier) {
                            var id = expr;
                            if (this.scanner.isRestrictedWord(id.name)) {
                                this.tolerateUnexpectedToken(token, messages_1.Messages.StrictLHSAssignment);
                            }
                            if (this.scanner.isStrictModeReservedWord(id.name)) {
                                this.tolerateUnexpectedToken(token, messages_1.Messages.StrictReservedWord);
                            }
                        }
                        if (!this.match('=')) {
                            this.context.isAssignmentTarget = false;
                            this.context.isBindingElement = false;
                        }
                        else {
                            this.reinterpretExpressionAsPattern(expr);
                        }
                        token = this.nextToken();
                        var operator = token.value;
                        var right = this.isolateCoverGrammar(this.parseAssignmentExpression);
                        expr = this.finalize(this.startNode(startToken), new Node.AssignmentExpression(operator, expr, right));
                        this.context.firstCoverInitializedNameError = null;
                    }
                }
            }
            return expr;
        };
        // https://tc39.github.io/ecma262/#sec-comma-operator
        Parser.prototype.parseExpression = function () {
            var startToken = this.lookahead;
            var expr = this.isolateCoverGrammar(this.parseAssignmentExpression);
            if (this.match(',')) {
                var expressions = [];
                expressions.push(expr);
                while (this.lookahead.type !== 2 /* EOF */) {
                    if (!this.match(',')) {
                        break;
                    }
                    this.nextToken();
                    expressions.push(this.isolateCoverGrammar(this.parseAssignmentExpression));
                }
                expr = this.finalize(this.startNode(startToken), new Node.SequenceExpression(expressions));
            }
            return expr;
        };
        // https://tc39.github.io/ecma262/#sec-block
        Parser.prototype.parseStatementListItem = function () {
            var statement;
            this.context.isAssignmentTarget = true;
            this.context.isBindingElement = true;
            if (this.lookahead.type === 4 /* Keyword */) {
                switch (this.lookahead.value) {
                    case 'export':
                        if (!this.context.isModule) {
                            this.tolerateUnexpectedToken(this.lookahead, messages_1.Messages.IllegalExportDeclaration);
                        }
                        statement = this.parseExportDeclaration();
                        break;
                    case 'import':
                        if (!this.context.isModule) {
                            this.tolerateUnexpectedToken(this.lookahead, messages_1.Messages.IllegalImportDeclaration);
                        }
                        statement = this.parseImportDeclaration();
                        break;
                    case 'const':
                        statement = this.parseLexicalDeclaration({ inFor: false });
                        break;
                    case 'function':
                        statement = this.parseFunctionDeclaration();
                        break;
                    case 'class':
                        statement = this.parseClassDeclaration();
                        break;
                    case 'let':
                        statement = this.isLexicalDeclaration() ? this.parseLexicalDeclaration({ inFor: false }) : this.parseStatement();
                        break;
                    default:
                        statement = this.parseStatement();
                        break;
                }
            }
            else {
                statement = this.parseStatement();
            }
            return statement;
        };
        Parser.prototype.parseBlock = function () {
            var node = this.createNode();
            this.expect('{');
            var block = [];
            while (true) {
                if (this.match('}')) {
                    break;
                }
                block.push(this.parseStatementListItem());
            }
            this.expect('}');
            return this.finalize(node, new Node.BlockStatement(block));
        };
        // https://tc39.github.io/ecma262/#sec-let-and-const-declarations
        Parser.prototype.parseLexicalBinding = function (kind, options) {
            var node = this.createNode();
            var params = [];
            var id = this.parsePattern(params, kind);
            if (this.context.strict && id.type === syntax_1.Syntax.Identifier) {
                if (this.scanner.isRestrictedWord(id.name)) {
                    this.tolerateError(messages_1.Messages.StrictVarName);
                }
            }
            var init = null;
            if (kind === 'const') {
                if (!this.matchKeyword('in') && !this.matchContextualKeyword('of')) {
                    if (this.match('=')) {
                        this.nextToken();
                        init = this.isolateCoverGrammar(this.parseAssignmentExpression);
                    }
                    else {
                        this.throwError(messages_1.Messages.DeclarationMissingInitializer, 'const');
                    }
                }
            }
            else if ((!options.inFor && id.type !== syntax_1.Syntax.Identifier) || this.match('=')) {
                this.expect('=');
                init = this.isolateCoverGrammar(this.parseAssignmentExpression);
            }
            return this.finalize(node, new Node.VariableDeclarator(id, init));
        };
        Parser.prototype.parseBindingList = function (kind, options) {
            var list = [this.parseLexicalBinding(kind, options)];
            while (this.match(',')) {
                this.nextToken();
                list.push(this.parseLexicalBinding(kind, options));
            }
            return list;
        };
        Parser.prototype.isLexicalDeclaration = function () {
            var state = this.scanner.saveState();
            this.scanner.scanComments();
            var next = this.scanner.lex();
            this.scanner.restoreState(state);
            return (next.type === 3 /* Identifier */) ||
                (next.type === 7 /* Punctuator */ && next.value === '[') ||
                (next.type === 7 /* Punctuator */ && next.value === '{') ||
                (next.type === 4 /* Keyword */ && next.value === 'let') ||
                (next.type === 4 /* Keyword */ && next.value === 'yield');
        };
        Parser.prototype.parseLexicalDeclaration = function (options) {
            var node = this.createNode();
            var kind = this.nextToken().value;
            assert_1.assert(kind === 'let' || kind === 'const', 'Lexical declaration must be either let or const');
            var declarations = this.parseBindingList(kind, options);
            this.consumeSemicolon();
            return this.finalize(node, new Node.VariableDeclaration(declarations, kind));
        };
        // https://tc39.github.io/ecma262/#sec-destructuring-binding-patterns
        Parser.prototype.parseBindingRestElement = function (params, kind) {
            var node = this.createNode();
            this.expect('...');
            var arg = this.parsePattern(params, kind);
            return this.finalize(node, new Node.RestElement(arg));
        };
        Parser.prototype.parseArrayPattern = function (params, kind) {
            var node = this.createNode();
            this.expect('[');
            var elements = [];
            while (!this.match(']')) {
                if (this.match(',')) {
                    this.nextToken();
                    elements.push(null);
                }
                else {
                    if (this.match('...')) {
                        elements.push(this.parseBindingRestElement(params, kind));
                        break;
                    }
                    else {
                        elements.push(this.parsePatternWithDefault(params, kind));
                    }
                    if (!this.match(']')) {
                        this.expect(',');
                    }
                }
            }
            this.expect(']');
            return this.finalize(node, new Node.ArrayPattern(elements));
        };
        Parser.prototype.parsePropertyPattern = function (params, kind) {
            var node = this.createNode();
            var computed = false;
            var shorthand = false;
            var method = false;
            var key;
            var value;
            if (this.lookahead.type === 3 /* Identifier */) {
                var keyToken = this.lookahead;
                key = this.parseVariableIdentifier();
                var init = this.finalize(node, new Node.Identifier(keyToken.value));
                if (this.match('=')) {
                    params.push(keyToken);
                    shorthand = true;
                    this.nextToken();
                    var expr = this.parseAssignmentExpression();
                    value = this.finalize(this.startNode(keyToken), new Node.AssignmentPattern(init, expr));
                }
                else if (!this.match(':')) {
                    params.push(keyToken);
                    shorthand = true;
                    value = init;
                }
                else {
                    this.expect(':');
                    value = this.parsePatternWithDefault(params, kind);
                }
            }
            else {
                computed = this.match('[');
                key = this.parseObjectPropertyKey();
                this.expect(':');
                value = this.parsePatternWithDefault(params, kind);
            }
            return this.finalize(node, new Node.Property('init', key, computed, value, method, shorthand));
        };
        Parser.prototype.parseObjectPattern = function (params, kind) {
            var node = this.createNode();
            var properties = [];
            this.expect('{');
            while (!this.match('}')) {
                properties.push(this.parsePropertyPattern(params, kind));
                if (!this.match('}')) {
                    this.expect(',');
                }
            }
            this.expect('}');
            return this.finalize(node, new Node.ObjectPattern(properties));
        };
        Parser.prototype.parsePattern = function (params, kind) {
            var pattern;
            if (this.match('[')) {
                pattern = this.parseArrayPattern(params, kind);
            }
            else if (this.match('{')) {
                pattern = this.parseObjectPattern(params, kind);
            }
            else {
                if (this.matchKeyword('let') && (kind === 'const' || kind === 'let')) {
                    this.tolerateUnexpectedToken(this.lookahead, messages_1.Messages.LetInLexicalBinding);
                }
                params.push(this.lookahead);
                pattern = this.parseVariableIdentifier(kind);
            }
            return pattern;
        };
        Parser.prototype.parsePatternWithDefault = function (params, kind) {
            var startToken = this.lookahead;
            var pattern = this.parsePattern(params, kind);
            if (this.match('=')) {
                this.nextToken();
                var previousAllowYield = this.context.allowYield;
                this.context.allowYield = true;
                var right = this.isolateCoverGrammar(this.parseAssignmentExpression);
                this.context.allowYield = previousAllowYield;
                pattern = this.finalize(this.startNode(startToken), new Node.AssignmentPattern(pattern, right));
            }
            return pattern;
        };
        // https://tc39.github.io/ecma262/#sec-variable-statement
        Parser.prototype.parseVariableIdentifier = function (kind) {
            var node = this.createNode();
            var token = this.nextToken();
            if (token.type === 4 /* Keyword */ && token.value === 'yield') {
                if (this.context.strict) {
                    this.tolerateUnexpectedToken(token, messages_1.Messages.StrictReservedWord);
                }
                else if (!this.context.allowYield) {
                    this.throwUnexpectedToken(token);
                }
            }
            else if (token.type !== 3 /* Identifier */) {
                if (this.context.strict && token.type === 4 /* Keyword */ && this.scanner.isStrictModeReservedWord(token.value)) {
                    this.tolerateUnexpectedToken(token, messages_1.Messages.StrictReservedWord);
                }
                else {
                    if (this.context.strict || token.value !== 'let' || kind !== 'var') {
                        this.throwUnexpectedToken(token);
                    }
                }
            }
            else if ((this.context.isModule || this.context.await) && token.type === 3 /* Identifier */ && token.value === 'await') {
                this.tolerateUnexpectedToken(token);
            }
            return this.finalize(node, new Node.Identifier(token.value));
        };
        Parser.prototype.parseVariableDeclaration = function (options) {
            var node = this.createNode();
            var params = [];
            var id = this.parsePattern(params, 'var');
            if (this.context.strict && id.type === syntax_1.Syntax.Identifier) {
                if (this.scanner.isRestrictedWord(id.name)) {
                    this.tolerateError(messages_1.Messages.StrictVarName);
                }
            }
            var init = null;
            if (this.match('=')) {
                this.nextToken();
                init = this.isolateCoverGrammar(this.parseAssignmentExpression);
            }
            else if (id.type !== syntax_1.Syntax.Identifier && !options.inFor) {
                this.expect('=');
            }
            return this.finalize(node, new Node.VariableDeclarator(id, init));
        };
        Parser.prototype.parseVariableDeclarationList = function (options) {
            var opt = { inFor: options.inFor };
            var list = [];
            list.push(this.parseVariableDeclaration(opt));
            while (this.match(',')) {
                this.nextToken();
                list.push(this.parseVariableDeclaration(opt));
            }
            return list;
        };
        Parser.prototype.parseVariableStatement = function () {
            var node = this.createNode();
            this.expectKeyword('var');
            var declarations = this.parseVariableDeclarationList({ inFor: false });
            this.consumeSemicolon();
            return this.finalize(node, new Node.VariableDeclaration(declarations, 'var'));
        };
        // https://tc39.github.io/ecma262/#sec-empty-statement
        Parser.prototype.parseEmptyStatement = function () {
            var node = this.createNode();
            this.expect(';');
            return this.finalize(node, new Node.EmptyStatement());
        };
        // https://tc39.github.io/ecma262/#sec-expression-statement
        Parser.prototype.parseExpressionStatement = function () {
            var node = this.createNode();
            var expr = this.parseExpression();
            this.consumeSemicolon();
            return this.finalize(node, new Node.ExpressionStatement(expr));
        };
        // https://tc39.github.io/ecma262/#sec-if-statement
        Parser.prototype.parseIfClause = function () {
            if (this.context.strict && this.matchKeyword('function')) {
                this.tolerateError(messages_1.Messages.StrictFunction);
            }
            return this.parseStatement();
        };
        Parser.prototype.parseIfStatement = function () {
            var node = this.createNode();
            var consequent;
            var alternate = null;
            this.expectKeyword('if');
            this.expect('(');
            var test = this.parseExpression();
            if (!this.match(')') && this.config.tolerant) {
                this.tolerateUnexpectedToken(this.nextToken());
                consequent = this.finalize(this.createNode(), new Node.EmptyStatement());
            }
            else {
                this.expect(')');
                consequent = this.parseIfClause();
                if (this.matchKeyword('else')) {
                    this.nextToken();
                    alternate = this.parseIfClause();
                }
            }
            return this.finalize(node, new Node.IfStatement(test, consequent, alternate));
        };
        // https://tc39.github.io/ecma262/#sec-do-while-statement
        Parser.prototype.parseDoWhileStatement = function () {
            var node = this.createNode();
            this.expectKeyword('do');
            var previousInIteration = this.context.inIteration;
            this.context.inIteration = true;
            var body = this.parseStatement();
            this.context.inIteration = previousInIteration;
            this.expectKeyword('while');
            this.expect('(');
            var test = this.parseExpression();
            if (!this.match(')') && this.config.tolerant) {
                this.tolerateUnexpectedToken(this.nextToken());
            }
            else {
                this.expect(')');
                if (this.match(';')) {
                    this.nextToken();
                }
            }
            return this.finalize(node, new Node.DoWhileStatement(body, test));
        };
        // https://tc39.github.io/ecma262/#sec-while-statement
        Parser.prototype.parseWhileStatement = function () {
            var node = this.createNode();
            var body;
            this.expectKeyword('while');
            this.expect('(');
            var test = this.parseExpression();
            if (!this.match(')') && this.config.tolerant) {
                this.tolerateUnexpectedToken(this.nextToken());
                body = this.finalize(this.createNode(), new Node.EmptyStatement());
            }
            else {
                this.expect(')');
                var previousInIteration = this.context.inIteration;
                this.context.inIteration = true;
                body = this.parseStatement();
                this.context.inIteration = previousInIteration;
            }
            return this.finalize(node, new Node.WhileStatement(test, body));
        };
        // https://tc39.github.io/ecma262/#sec-for-statement
        // https://tc39.github.io/ecma262/#sec-for-in-and-for-of-statements
        Parser.prototype.parseForStatement = function () {
            var init = null;
            var test = null;
            var update = null;
            var forIn = true;
            var left, right;
            var node = this.createNode();
            this.expectKeyword('for');
            this.expect('(');
            if (this.match(';')) {
                this.nextToken();
            }
            else {
                if (this.matchKeyword('var')) {
                    init = this.createNode();
                    this.nextToken();
                    var previousAllowIn = this.context.allowIn;
                    this.context.allowIn = false;
                    var declarations = this.parseVariableDeclarationList({ inFor: true });
                    this.context.allowIn = previousAllowIn;
                    if (declarations.length === 1 && this.matchKeyword('in')) {
                        var decl = declarations[0];
                        if (decl.init && (decl.id.type === syntax_1.Syntax.ArrayPattern || decl.id.type === syntax_1.Syntax.ObjectPattern || this.context.strict)) {
                            this.tolerateError(messages_1.Messages.ForInOfLoopInitializer, 'for-in');
                        }
                        init = this.finalize(init, new Node.VariableDeclaration(declarations, 'var'));
                        this.nextToken();
                        left = init;
                        right = this.parseExpression();
                        init = null;
                    }
                    else if (declarations.length === 1 && declarations[0].init === null && this.matchContextualKeyword('of')) {
                        init = this.finalize(init, new Node.VariableDeclaration(declarations, 'var'));
                        this.nextToken();
                        left = init;
                        right = this.parseAssignmentExpression();
                        init = null;
                        forIn = false;
                    }
                    else {
                        init = this.finalize(init, new Node.VariableDeclaration(declarations, 'var'));
                        this.expect(';');
                    }
                }
                else if (this.matchKeyword('const') || this.matchKeyword('let')) {
                    init = this.createNode();
                    var kind = this.nextToken().value;
                    if (!this.context.strict && this.lookahead.value === 'in') {
                        init = this.finalize(init, new Node.Identifier(kind));
                        this.nextToken();
                        left = init;
                        right = this.parseExpression();
                        init = null;
                    }
                    else {
                        var previousAllowIn = this.context.allowIn;
                        this.context.allowIn = false;
                        var declarations = this.parseBindingList(kind, { inFor: true });
                        this.context.allowIn = previousAllowIn;
                        if (declarations.length === 1 && declarations[0].init === null && this.matchKeyword('in')) {
                            init = this.finalize(init, new Node.VariableDeclaration(declarations, kind));
                            this.nextToken();
                            left = init;
                            right = this.parseExpression();
                            init = null;
                        }
                        else if (declarations.length === 1 && declarations[0].init === null && this.matchContextualKeyword('of')) {
                            init = this.finalize(init, new Node.VariableDeclaration(declarations, kind));
                            this.nextToken();
                            left = init;
                            right = this.parseAssignmentExpression();
                            init = null;
                            forIn = false;
                        }
                        else {
                            this.consumeSemicolon();
                            init = this.finalize(init, new Node.VariableDeclaration(declarations, kind));
                        }
                    }
                }
                else {
                    var initStartToken = this.lookahead;
                    var previousAllowIn = this.context.allowIn;
                    this.context.allowIn = false;
                    init = this.inheritCoverGrammar(this.parseAssignmentExpression);
                    this.context.allowIn = previousAllowIn;
                    if (this.matchKeyword('in')) {
                        if (!this.context.isAssignmentTarget || init.type === syntax_1.Syntax.AssignmentExpression) {
                            this.tolerateError(messages_1.Messages.InvalidLHSInForIn);
                        }
                        this.nextToken();
                        this.reinterpretExpressionAsPattern(init);
                        left = init;
                        right = this.parseExpression();
                        init = null;
                    }
                    else if (this.matchContextualKeyword('of')) {
                        if (!this.context.isAssignmentTarget || init.type === syntax_1.Syntax.AssignmentExpression) {
                            this.tolerateError(messages_1.Messages.InvalidLHSInForLoop);
                        }
                        this.nextToken();
                        this.reinterpretExpressionAsPattern(init);
                        left = init;
                        right = this.parseAssignmentExpression();
                        init = null;
                        forIn = false;
                    }
                    else {
                        if (this.match(',')) {
                            var initSeq = [init];
                            while (this.match(',')) {
                                this.nextToken();
                                initSeq.push(this.isolateCoverGrammar(this.parseAssignmentExpression));
                            }
                            init = this.finalize(this.startNode(initStartToken), new Node.SequenceExpression(initSeq));
                        }
                        this.expect(';');
                    }
                }
            }
            if (typeof left === 'undefined') {
                if (!this.match(';')) {
                    test = this.parseExpression();
                }
                this.expect(';');
                if (!this.match(')')) {
                    update = this.parseExpression();
                }
            }
            var body;
            if (!this.match(')') && this.config.tolerant) {
                this.tolerateUnexpectedToken(this.nextToken());
                body = this.finalize(this.createNode(), new Node.EmptyStatement());
            }
            else {
                this.expect(')');
                var previousInIteration = this.context.inIteration;
                this.context.inIteration = true;
                body = this.isolateCoverGrammar(this.parseStatement);
                this.context.inIteration = previousInIteration;
            }
            return (typeof left === 'undefined') ?
                this.finalize(node, new Node.ForStatement(init, test, update, body)) :
                forIn ? this.finalize(node, new Node.ForInStatement(left, right, body)) :
                    this.finalize(node, new Node.ForOfStatement(left, right, body));
        };
        // https://tc39.github.io/ecma262/#sec-continue-statement
        Parser.prototype.parseContinueStatement = function () {
            var node = this.createNode();
            this.expectKeyword('continue');
            var label = null;
            if (this.lookahead.type === 3 /* Identifier */ && !this.hasLineTerminator) {
                var id = this.parseVariableIdentifier();
                label = id;
                var key = '$' + id.name;
                if (!Object.prototype.hasOwnProperty.call(this.context.labelSet, key)) {
                    this.throwError(messages_1.Messages.UnknownLabel, id.name);
                }
            }
            this.consumeSemicolon();
            if (label === null && !this.context.inIteration) {
                this.throwError(messages_1.Messages.IllegalContinue);
            }
            return this.finalize(node, new Node.ContinueStatement(label));
        };
        // https://tc39.github.io/ecma262/#sec-break-statement
        Parser.prototype.parseBreakStatement = function () {
            var node = this.createNode();
            this.expectKeyword('break');
            var label = null;
            if (this.lookahead.type === 3 /* Identifier */ && !this.hasLineTerminator) {
                var id = this.parseVariableIdentifier();
                var key = '$' + id.name;
                if (!Object.prototype.hasOwnProperty.call(this.context.labelSet, key)) {
                    this.throwError(messages_1.Messages.UnknownLabel, id.name);
                }
                label = id;
            }
            this.consumeSemicolon();
            if (label === null && !this.context.inIteration && !this.context.inSwitch) {
                this.throwError(messages_1.Messages.IllegalBreak);
            }
            return this.finalize(node, new Node.BreakStatement(label));
        };
        // https://tc39.github.io/ecma262/#sec-return-statement
        Parser.prototype.parseReturnStatement = function () {
            if (!this.context.inFunctionBody) {
                this.tolerateError(messages_1.Messages.IllegalReturn);
            }
            var node = this.createNode();
            this.expectKeyword('return');
            var hasArgument = (!this.match(';') && !this.match('}') &&
                !this.hasLineTerminator && this.lookahead.type !== 2 /* EOF */) ||
                this.lookahead.type === 8 /* StringLiteral */ ||
                this.lookahead.type === 10 /* Template */;
            var argument = hasArgument ? this.parseExpression() : null;
            this.consumeSemicolon();
            return this.finalize(node, new Node.ReturnStatement(argument));
        };
        // https://tc39.github.io/ecma262/#sec-with-statement
        Parser.prototype.parseWithStatement = function () {
            if (this.context.strict) {
                this.tolerateError(messages_1.Messages.StrictModeWith);
            }
            var node = this.createNode();
            var body;
            this.expectKeyword('with');
            this.expect('(');
            var object = this.parseExpression();
            if (!this.match(')') && this.config.tolerant) {
                this.tolerateUnexpectedToken(this.nextToken());
                body = this.finalize(this.createNode(), new Node.EmptyStatement());
            }
            else {
                this.expect(')');
                body = this.parseStatement();
            }
            return this.finalize(node, new Node.WithStatement(object, body));
        };
        // https://tc39.github.io/ecma262/#sec-switch-statement
        Parser.prototype.parseSwitchCase = function () {
            var node = this.createNode();
            var test;
            if (this.matchKeyword('default')) {
                this.nextToken();
                test = null;
            }
            else {
                this.expectKeyword('case');
                test = this.parseExpression();
            }
            this.expect(':');
            var consequent = [];
            while (true) {
                if (this.match('}') || this.matchKeyword('default') || this.matchKeyword('case')) {
                    break;
                }
                consequent.push(this.parseStatementListItem());
            }
            return this.finalize(node, new Node.SwitchCase(test, consequent));
        };
        Parser.prototype.parseSwitchStatement = function () {
            var node = this.createNode();
            this.expectKeyword('switch');
            this.expect('(');
            var discriminant = this.parseExpression();
            this.expect(')');
            var previousInSwitch = this.context.inSwitch;
            this.context.inSwitch = true;
            var cases = [];
            var defaultFound = false;
            this.expect('{');
            while (true) {
                if (this.match('}')) {
                    break;
                }
                var clause = this.parseSwitchCase();
                if (clause.test === null) {
                    if (defaultFound) {
                        this.throwError(messages_1.Messages.MultipleDefaultsInSwitch);
                    }
                    defaultFound = true;
                }
                cases.push(clause);
            }
            this.expect('}');
            this.context.inSwitch = previousInSwitch;
            return this.finalize(node, new Node.SwitchStatement(discriminant, cases));
        };
        // https://tc39.github.io/ecma262/#sec-labelled-statements
        Parser.prototype.parseLabelledStatement = function () {
            var node = this.createNode();
            var expr = this.parseExpression();
            var statement;
            if ((expr.type === syntax_1.Syntax.Identifier) && this.match(':')) {
                this.nextToken();
                var id = expr;
                var key = '$' + id.name;
                if (Object.prototype.hasOwnProperty.call(this.context.labelSet, key)) {
                    this.throwError(messages_1.Messages.Redeclaration, 'Label', id.name);
                }
                this.context.labelSet[key] = true;
                var body = void 0;
                if (this.matchKeyword('class')) {
                    this.tolerateUnexpectedToken(this.lookahead);
                    body = this.parseClassDeclaration();
                }
                else if (this.matchKeyword('function')) {
                    var token = this.lookahead;
                    var declaration = this.parseFunctionDeclaration();
                    if (this.context.strict) {
                        this.tolerateUnexpectedToken(token, messages_1.Messages.StrictFunction);
                    }
                    else if (declaration.generator) {
                        this.tolerateUnexpectedToken(token, messages_1.Messages.GeneratorInLegacyContext);
                    }
                    body = declaration;
                }
                else {
                    body = this.parseStatement();
                }
                delete this.context.labelSet[key];
                statement = new Node.LabeledStatement(id, body);
            }
            else {
                this.consumeSemicolon();
                statement = new Node.ExpressionStatement(expr);
            }
            return this.finalize(node, statement);
        };
        // https://tc39.github.io/ecma262/#sec-throw-statement
        Parser.prototype.parseThrowStatement = function () {
            var node = this.createNode();
            this.expectKeyword('throw');
            if (this.hasLineTerminator) {
                this.throwError(messages_1.Messages.NewlineAfterThrow);
            }
            var argument = this.parseExpression();
            this.consumeSemicolon();
            return this.finalize(node, new Node.ThrowStatement(argument));
        };
        // https://tc39.github.io/ecma262/#sec-try-statement
        Parser.prototype.parseCatchClause = function () {
            var node = this.createNode();
            this.expectKeyword('catch');
            this.expect('(');
            if (this.match(')')) {
                this.throwUnexpectedToken(this.lookahead);
            }
            var params = [];
            var param = this.parsePattern(params);
            var paramMap = {};
            for (var i = 0; i < params.length; i++) {
                var key = '$' + params[i].value;
                if (Object.prototype.hasOwnProperty.call(paramMap, key)) {
                    this.tolerateError(messages_1.Messages.DuplicateBinding, params[i].value);
                }
                paramMap[key] = true;
            }
            if (this.context.strict && param.type === syntax_1.Syntax.Identifier) {
                if (this.scanner.isRestrictedWord(param.name)) {
                    this.tolerateError(messages_1.Messages.StrictCatchVariable);
                }
            }
            this.expect(')');
            var body = this.parseBlock();
            return this.finalize(node, new Node.CatchClause(param, body));
        };
        Parser.prototype.parseFinallyClause = function () {
            this.expectKeyword('finally');
            return this.parseBlock();
        };
        Parser.prototype.parseTryStatement = function () {
            var node = this.createNode();
            this.expectKeyword('try');
            var block = this.parseBlock();
            var handler = this.matchKeyword('catch') ? this.parseCatchClause() : null;
            var finalizer = this.matchKeyword('finally') ? this.parseFinallyClause() : null;
            if (!handler && !finalizer) {
                this.throwError(messages_1.Messages.NoCatchOrFinally);
            }
            return this.finalize(node, new Node.TryStatement(block, handler, finalizer));
        };
        // https://tc39.github.io/ecma262/#sec-debugger-statement
        Parser.prototype.parseDebuggerStatement = function () {
            var node = this.createNode();
            this.expectKeyword('debugger');
            this.consumeSemicolon();
            return this.finalize(node, new Node.DebuggerStatement());
        };
        // https://tc39.github.io/ecma262/#sec-ecmascript-language-statements-and-declarations
        Parser.prototype.parseStatement = function () {
            var statement;
            switch (this.lookahead.type) {
                case 1 /* BooleanLiteral */:
                case 5 /* NullLiteral */:
                case 6 /* NumericLiteral */:
                case 8 /* StringLiteral */:
                case 10 /* Template */:
                case 9 /* RegularExpression */:
                    statement = this.parseExpressionStatement();
                    break;
                case 7 /* Punctuator */:
                    var value = this.lookahead.value;
                    if (value === '{') {
                        statement = this.parseBlock();
                    }
                    else if (value === '(') {
                        statement = this.parseExpressionStatement();
                    }
                    else if (value === ';') {
                        statement = this.parseEmptyStatement();
                    }
                    else {
                        statement = this.parseExpressionStatement();
                    }
                    break;
                case 3 /* Identifier */:
                    statement = this.matchAsyncFunction() ? this.parseFunctionDeclaration() : this.parseLabelledStatement();
                    break;
                case 4 /* Keyword */:
                    switch (this.lookahead.value) {
                        case 'break':
                            statement = this.parseBreakStatement();
                            break;
                        case 'continue':
                            statement = this.parseContinueStatement();
                            break;
                        case 'debugger':
                            statement = this.parseDebuggerStatement();
                            break;
                        case 'do':
                            statement = this.parseDoWhileStatement();
                            break;
                        case 'for':
                            statement = this.parseForStatement();
                            break;
                        case 'function':
                            statement = this.parseFunctionDeclaration();
                            break;
                        case 'if':
                            statement = this.parseIfStatement();
                            break;
                        case 'return':
                            statement = this.parseReturnStatement();
                            break;
                        case 'switch':
                            statement = this.parseSwitchStatement();
                            break;
                        case 'throw':
                            statement = this.parseThrowStatement();
                            break;
                        case 'try':
                            statement = this.parseTryStatement();
                            break;
                        case 'var':
                            statement = this.parseVariableStatement();
                            break;
                        case 'while':
                            statement = this.parseWhileStatement();
                            break;
                        case 'with':
                            statement = this.parseWithStatement();
                            break;
                        default:
                            statement = this.parseExpressionStatement();
                            break;
                    }
                    break;
                default:
                    statement = this.throwUnexpectedToken(this.lookahead);
            }
            return statement;
        };
        // https://tc39.github.io/ecma262/#sec-function-definitions
        Parser.prototype.parseFunctionSourceElements = function () {
            var node = this.createNode();
            this.expect('{');
            var body = this.parseDirectivePrologues();
            var previousLabelSet = this.context.labelSet;
            var previousInIteration = this.context.inIteration;
            var previousInSwitch = this.context.inSwitch;
            var previousInFunctionBody = this.context.inFunctionBody;
            this.context.labelSet = {};
            this.context.inIteration = false;
            this.context.inSwitch = false;
            this.context.inFunctionBody = true;
            while (this.lookahead.type !== 2 /* EOF */) {
                if (this.match('}')) {
                    break;
                }
                body.push(this.parseStatementListItem());
            }
            this.expect('}');
            this.context.labelSet = previousLabelSet;
            this.context.inIteration = previousInIteration;
            this.context.inSwitch = previousInSwitch;
            this.context.inFunctionBody = previousInFunctionBody;
            return this.finalize(node, new Node.BlockStatement(body));
        };
        Parser.prototype.validateParam = function (options, param, name) {
            var key = '$' + name;
            if (this.context.strict) {
                if (this.scanner.isRestrictedWord(name)) {
                    options.stricted = param;
                    options.message = messages_1.Messages.StrictParamName;
                }
                if (Object.prototype.hasOwnProperty.call(options.paramSet, key)) {
                    options.stricted = param;
                    options.message = messages_1.Messages.StrictParamDupe;
                }
            }
            else if (!options.firstRestricted) {
                if (this.scanner.isRestrictedWord(name)) {
                    options.firstRestricted = param;
                    options.message = messages_1.Messages.StrictParamName;
                }
                else if (this.scanner.isStrictModeReservedWord(name)) {
                    options.firstRestricted = param;
                    options.message = messages_1.Messages.StrictReservedWord;
                }
                else if (Object.prototype.hasOwnProperty.call(options.paramSet, key)) {
                    options.stricted = param;
                    options.message = messages_1.Messages.StrictParamDupe;
                }
            }
            /* istanbul ignore next */
            if (typeof Object.defineProperty === 'function') {
                Object.defineProperty(options.paramSet, key, { value: true, enumerable: true, writable: true, configurable: true });
            }
            else {
                options.paramSet[key] = true;
            }
        };
        Parser.prototype.parseRestElement = function (params) {
            var node = this.createNode();
            this.expect('...');
            var arg = this.parsePattern(params);
            if (this.match('=')) {
                this.throwError(messages_1.Messages.DefaultRestParameter);
            }
            if (!this.match(')')) {
                this.throwError(messages_1.Messages.ParameterAfterRestParameter);
            }
            return this.finalize(node, new Node.RestElement(arg));
        };
        Parser.prototype.parseFormalParameter = function (options) {
            var params = [];
            var param = this.match('...') ? this.parseRestElement(params) : this.parsePatternWithDefault(params);
            for (var i = 0; i < params.length; i++) {
                this.validateParam(options, params[i], params[i].value);
            }
            options.simple = options.simple && (param instanceof Node.Identifier);
            options.params.push(param);
        };
        Parser.prototype.parseFormalParameters = function (firstRestricted) {
            var options;
            options = {
                simple: true,
                params: [],
                firstRestricted: firstRestricted
            };
            this.expect('(');
            if (!this.match(')')) {
                options.paramSet = {};
                while (this.lookahead.type !== 2 /* EOF */) {
                    this.parseFormalParameter(options);
                    if (this.match(')')) {
                        break;
                    }
                    this.expect(',');
                    if (this.match(')')) {
                        break;
                    }
                }
            }
            this.expect(')');
            return {
                simple: options.simple,
                params: options.params,
                stricted: options.stricted,
                firstRestricted: options.firstRestricted,
                message: options.message
            };
        };
        Parser.prototype.matchAsyncFunction = function () {
            var match = this.matchContextualKeyword('async');
            if (match) {
                var state = this.scanner.saveState();
                this.scanner.scanComments();
                var next = this.scanner.lex();
                this.scanner.restoreState(state);
                match = (state.lineNumber === next.lineNumber) && (next.type === 4 /* Keyword */) && (next.value === 'function');
            }
            return match;
        };
        Parser.prototype.parseFunctionDeclaration = function (identifierIsOptional) {
            var node = this.createNode();
            var isAsync = this.matchContextualKeyword('async');
            if (isAsync) {
                this.nextToken();
            }
            this.expectKeyword('function');
            var isGenerator = isAsync ? false : this.match('*');
            if (isGenerator) {
                this.nextToken();
            }
            var message;
            var id = null;
            var firstRestricted = null;
            if (!identifierIsOptional || !this.match('(')) {
                var token = this.lookahead;
                id = this.parseVariableIdentifier();
                if (this.context.strict) {
                    if (this.scanner.isRestrictedWord(token.value)) {
                        this.tolerateUnexpectedToken(token, messages_1.Messages.StrictFunctionName);
                    }
                }
                else {
                    if (this.scanner.isRestrictedWord(token.value)) {
                        firstRestricted = token;
                        message = messages_1.Messages.StrictFunctionName;
                    }
                    else if (this.scanner.isStrictModeReservedWord(token.value)) {
                        firstRestricted = token;
                        message = messages_1.Messages.StrictReservedWord;
                    }
                }
            }
            var previousAllowAwait = this.context.await;
            var previousAllowYield = this.context.allowYield;
            this.context.await = isAsync;
            this.context.allowYield = !isGenerator;
            var formalParameters = this.parseFormalParameters(firstRestricted);
            var params = formalParameters.params;
            var stricted = formalParameters.stricted;
            firstRestricted = formalParameters.firstRestricted;
            if (formalParameters.message) {
                message = formalParameters.message;
            }
            var previousStrict = this.context.strict;
            var previousAllowStrictDirective = this.context.allowStrictDirective;
            this.context.allowStrictDirective = formalParameters.simple;
            var body = this.parseFunctionSourceElements();
            if (this.context.strict && firstRestricted) {
                this.throwUnexpectedToken(firstRestricted, message);
            }
            if (this.context.strict && stricted) {
                this.tolerateUnexpectedToken(stricted, message);
            }
            this.context.strict = previousStrict;
            this.context.allowStrictDirective = previousAllowStrictDirective;
            this.context.await = previousAllowAwait;
            this.context.allowYield = previousAllowYield;
            return isAsync ? this.finalize(node, new Node.AsyncFunctionDeclaration(id, params, body)) :
                this.finalize(node, new Node.FunctionDeclaration(id, params, body, isGenerator));
        };
        Parser.prototype.parseFunctionExpression = function () {
            var node = this.createNode();
            var isAsync = this.matchContextualKeyword('async');
            if (isAsync) {
                this.nextToken();
            }
            this.expectKeyword('function');
            var isGenerator = isAsync ? false : this.match('*');
            if (isGenerator) {
                this.nextToken();
            }
            var message;
            var id = null;
            var firstRestricted;
            var previousAllowAwait = this.context.await;
            var previousAllowYield = this.context.allowYield;
            this.context.await = isAsync;
            this.context.allowYield = !isGenerator;
            if (!this.match('(')) {
                var token = this.lookahead;
                id = (!this.context.strict && !isGenerator && this.matchKeyword('yield')) ? this.parseIdentifierName() : this.parseVariableIdentifier();
                if (this.context.strict) {
                    if (this.scanner.isRestrictedWord(token.value)) {
                        this.tolerateUnexpectedToken(token, messages_1.Messages.StrictFunctionName);
                    }
                }
                else {
                    if (this.scanner.isRestrictedWord(token.value)) {
                        firstRestricted = token;
                        message = messages_1.Messages.StrictFunctionName;
                    }
                    else if (this.scanner.isStrictModeReservedWord(token.value)) {
                        firstRestricted = token;
                        message = messages_1.Messages.StrictReservedWord;
                    }
                }
            }
            var formalParameters = this.parseFormalParameters(firstRestricted);
            var params = formalParameters.params;
            var stricted = formalParameters.stricted;
            firstRestricted = formalParameters.firstRestricted;
            if (formalParameters.message) {
                message = formalParameters.message;
            }
            var previousStrict = this.context.strict;
            var previousAllowStrictDirective = this.context.allowStrictDirective;
            this.context.allowStrictDirective = formalParameters.simple;
            var body = this.parseFunctionSourceElements();
            if (this.context.strict && firstRestricted) {
                this.throwUnexpectedToken(firstRestricted, message);
            }
            if (this.context.strict && stricted) {
                this.tolerateUnexpectedToken(stricted, message);
            }
            this.context.strict = previousStrict;
            this.context.allowStrictDirective = previousAllowStrictDirective;
            this.context.await = previousAllowAwait;
            this.context.allowYield = previousAllowYield;
            return isAsync ? this.finalize(node, new Node.AsyncFunctionExpression(id, params, body)) :
                this.finalize(node, new Node.FunctionExpression(id, params, body, isGenerator));
        };
        // https://tc39.github.io/ecma262/#sec-directive-prologues-and-the-use-strict-directive
        Parser.prototype.parseDirective = function () {
            var token = this.lookahead;
            var node = this.createNode();
            var expr = this.parseExpression();
            var directive = (expr.type === syntax_1.Syntax.Literal) ? this.getTokenRaw(token).slice(1, -1) : null;
            this.consumeSemicolon();
            return this.finalize(node, directive ? new Node.Directive(expr, directive) : new Node.ExpressionStatement(expr));
        };
        Parser.prototype.parseDirectivePrologues = function () {
            var firstRestricted = null;
            var body = [];
            while (true) {
                var token = this.lookahead;
                if (token.type !== 8 /* StringLiteral */) {
                    break;
                }
                var statement = this.parseDirective();
                body.push(statement);
                var directive = statement.directive;
                if (typeof directive !== 'string') {
                    break;
                }
                if (directive === 'use strict') {
                    this.context.strict = true;
                    if (firstRestricted) {
                        this.tolerateUnexpectedToken(firstRestricted, messages_1.Messages.StrictOctalLiteral);
                    }
                    if (!this.context.allowStrictDirective) {
                        this.tolerateUnexpectedToken(token, messages_1.Messages.IllegalLanguageModeDirective);
                    }
                }
                else {
                    if (!firstRestricted && token.octal) {
                        firstRestricted = token;
                    }
                }
            }
            return body;
        };
        // https://tc39.github.io/ecma262/#sec-method-definitions
        Parser.prototype.qualifiedPropertyName = function (token) {
            switch (token.type) {
                case 3 /* Identifier */:
                case 8 /* StringLiteral */:
                case 1 /* BooleanLiteral */:
                case 5 /* NullLiteral */:
                case 6 /* NumericLiteral */:
                case 4 /* Keyword */:
                    return true;
                case 7 /* Punctuator */:
                    return token.value === '[';
                default:
                    break;
            }
            return false;
        };
        Parser.prototype.parseGetterMethod = function () {
            var node = this.createNode();
            var isGenerator = false;
            var previousAllowYield = this.context.allowYield;
            this.context.allowYield = !isGenerator;
            var formalParameters = this.parseFormalParameters();
            if (formalParameters.params.length > 0) {
                this.tolerateError(messages_1.Messages.BadGetterArity);
            }
            var method = this.parsePropertyMethod(formalParameters);
            this.context.allowYield = previousAllowYield;
            return this.finalize(node, new Node.FunctionExpression(null, formalParameters.params, method, isGenerator));
        };
        Parser.prototype.parseSetterMethod = function () {
            var node = this.createNode();
            var isGenerator = false;
            var previousAllowYield = this.context.allowYield;
            this.context.allowYield = !isGenerator;
            var formalParameters = this.parseFormalParameters();
            if (formalParameters.params.length !== 1) {
                this.tolerateError(messages_1.Messages.BadSetterArity);
            }
            else if (formalParameters.params[0] instanceof Node.RestElement) {
                this.tolerateError(messages_1.Messages.BadSetterRestParameter);
            }
            var method = this.parsePropertyMethod(formalParameters);
            this.context.allowYield = previousAllowYield;
            return this.finalize(node, new Node.FunctionExpression(null, formalParameters.params, method, isGenerator));
        };
        Parser.prototype.parseGeneratorMethod = function () {
            var node = this.createNode();
            var isGenerator = true;
            var previousAllowYield = this.context.allowYield;
            this.context.allowYield = true;
            var params = this.parseFormalParameters();
            this.context.allowYield = false;
            var method = this.parsePropertyMethod(params);
            this.context.allowYield = previousAllowYield;
            return this.finalize(node, new Node.FunctionExpression(null, params.params, method, isGenerator));
        };
        // https://tc39.github.io/ecma262/#sec-generator-function-definitions
        Parser.prototype.isStartOfExpression = function () {
            var start = true;
            var value = this.lookahead.value;
            switch (this.lookahead.type) {
                case 7 /* Punctuator */:
                    start = (value === '[') || (value === '(') || (value === '{') ||
                        (value === '+') || (value === '-') ||
                        (value === '!') || (value === '~') ||
                        (value === '++') || (value === '--') ||
                        (value === '/') || (value === '/='); // regular expression literal
                    break;
                case 4 /* Keyword */:
                    start = (value === 'class') || (value === 'delete') ||
                        (value === 'function') || (value === 'let') || (value === 'new') ||
                        (value === 'super') || (value === 'this') || (value === 'typeof') ||
                        (value === 'void') || (value === 'yield');
                    break;
                default:
                    break;
            }
            return start;
        };
        Parser.prototype.parseYieldExpression = function () {
            var node = this.createNode();
            this.expectKeyword('yield');
            var argument = null;
            var delegate = false;
            if (!this.hasLineTerminator) {
                var previousAllowYield = this.context.allowYield;
                this.context.allowYield = false;
                delegate = this.match('*');
                if (delegate) {
                    this.nextToken();
                    argument = this.parseAssignmentExpression();
                }
                else if (this.isStartOfExpression()) {
                    argument = this.parseAssignmentExpression();
                }
                this.context.allowYield = previousAllowYield;
            }
            return this.finalize(node, new Node.YieldExpression(argument, delegate));
        };
        // https://tc39.github.io/ecma262/#sec-class-definitions
        Parser.prototype.parseClassElement = function (hasConstructor) {
            var token = this.lookahead;
            var node = this.createNode();
            var kind = '';
            var key = null;
            var value = null;
            var computed = false;
            var method = false;
            var isStatic = false;
            var isAsync = false;
            if (this.match('*')) {
                this.nextToken();
            }
            else {
                computed = this.match('[');
                key = this.parseObjectPropertyKey();
                var id = key;
                if (id.name === 'static' && (this.qualifiedPropertyName(this.lookahead) || this.match('*'))) {
                    token = this.lookahead;
                    isStatic = true;
                    computed = this.match('[');
                    if (this.match('*')) {
                        this.nextToken();
                    }
                    else {
                        key = this.parseObjectPropertyKey();
                    }
                }
                if ((token.type === 3 /* Identifier */) && !this.hasLineTerminator && (token.value === 'async')) {
                    var punctuator = this.lookahead.value;
                    if (punctuator !== ':' && punctuator !== '(' && punctuator !== '*') {
                        isAsync = true;
                        token = this.lookahead;
                        key = this.parseObjectPropertyKey();
                        if (token.type === 3 /* Identifier */ && token.value === 'constructor') {
                            this.tolerateUnexpectedToken(token, messages_1.Messages.ConstructorIsAsync);
                        }
                    }
                }
            }
            var lookaheadPropertyKey = this.qualifiedPropertyName(this.lookahead);
            if (token.type === 3 /* Identifier */) {
                if (token.value === 'get' && lookaheadPropertyKey) {
                    kind = 'get';
                    computed = this.match('[');
                    key = this.parseObjectPropertyKey();
                    this.context.allowYield = false;
                    value = this.parseGetterMethod();
                }
                else if (token.value === 'set' && lookaheadPropertyKey) {
                    kind = 'set';
                    computed = this.match('[');
                    key = this.parseObjectPropertyKey();
                    value = this.parseSetterMethod();
                }
            }
            else if (token.type === 7 /* Punctuator */ && token.value === '*' && lookaheadPropertyKey) {
                kind = 'init';
                computed = this.match('[');
                key = this.parseObjectPropertyKey();
                value = this.parseGeneratorMethod();
                method = true;
            }
            if (!kind && key && this.match('(')) {
                kind = 'init';
                value = isAsync ? this.parsePropertyMethodAsyncFunction() : this.parsePropertyMethodFunction();
                method = true;
            }
            if (!kind) {
                this.throwUnexpectedToken(this.lookahead);
            }
            if (kind === 'init') {
                kind = 'method';
            }
            if (!computed) {
                if (isStatic && this.isPropertyKey(key, 'prototype')) {
                    this.throwUnexpectedToken(token, messages_1.Messages.StaticPrototype);
                }
                if (!isStatic && this.isPropertyKey(key, 'constructor')) {
                    if (kind !== 'method' || !method || (value && value.generator)) {
                        this.throwUnexpectedToken(token, messages_1.Messages.ConstructorSpecialMethod);
                    }
                    if (hasConstructor.value) {
                        this.throwUnexpectedToken(token, messages_1.Messages.DuplicateConstructor);
                    }
                    else {
                        hasConstructor.value = true;
                    }
                    kind = 'constructor';
                }
            }
            return this.finalize(node, new Node.MethodDefinition(key, computed, value, kind, isStatic));
        };
        Parser.prototype.parseClassElementList = function () {
            var body = [];
            var hasConstructor = { value: false };
            this.expect('{');
            while (!this.match('}')) {
                if (this.match(';')) {
                    this.nextToken();
                }
                else {
                    body.push(this.parseClassElement(hasConstructor));
                }
            }
            this.expect('}');
            return body;
        };
        Parser.prototype.parseClassBody = function () {
            var node = this.createNode();
            var elementList = this.parseClassElementList();
            return this.finalize(node, new Node.ClassBody(elementList));
        };
        Parser.prototype.parseClassDeclaration = function (identifierIsOptional) {
            var node = this.createNode();
            var previousStrict = this.context.strict;
            this.context.strict = true;
            this.expectKeyword('class');
            var id = (identifierIsOptional && (this.lookahead.type !== 3 /* Identifier */)) ? null : this.parseVariableIdentifier();
            var superClass = null;
            if (this.matchKeyword('extends')) {
                this.nextToken();
                superClass = this.isolateCoverGrammar(this.parseLeftHandSideExpressionAllowCall);
            }
            var classBody = this.parseClassBody();
            this.context.strict = previousStrict;
            return this.finalize(node, new Node.ClassDeclaration(id, superClass, classBody));
        };
        Parser.prototype.parseClassExpression = function () {
            var node = this.createNode();
            var previousStrict = this.context.strict;
            this.context.strict = true;
            this.expectKeyword('class');
            var id = (this.lookahead.type === 3 /* Identifier */) ? this.parseVariableIdentifier() : null;
            var superClass = null;
            if (this.matchKeyword('extends')) {
                this.nextToken();
                superClass = this.isolateCoverGrammar(this.parseLeftHandSideExpressionAllowCall);
            }
            var classBody = this.parseClassBody();
            this.context.strict = previousStrict;
            return this.finalize(node, new Node.ClassExpression(id, superClass, classBody));
        };
        // https://tc39.github.io/ecma262/#sec-scripts
        // https://tc39.github.io/ecma262/#sec-modules
        Parser.prototype.parseModule = function () {
            this.context.strict = true;
            this.context.isModule = true;
            this.scanner.isModule = true;
            var node = this.createNode();
            var body = this.parseDirectivePrologues();
            while (this.lookahead.type !== 2 /* EOF */) {
                body.push(this.parseStatementListItem());
            }
            return this.finalize(node, new Node.Module(body));
        };
        Parser.prototype.parseScript = function () {
            var node = this.createNode();
            var body = this.parseDirectivePrologues();
            while (this.lookahead.type !== 2 /* EOF */) {
                body.push(this.parseStatementListItem());
            }
            return this.finalize(node, new Node.Script(body));
        };
        // https://tc39.github.io/ecma262/#sec-imports
        Parser.prototype.parseModuleSpecifier = function () {
            var node = this.createNode();
            if (this.lookahead.type !== 8 /* StringLiteral */) {
                this.throwError(messages_1.Messages.InvalidModuleSpecifier);
            }
            var token = this.nextToken();
            var raw = this.getTokenRaw(token);
            return this.finalize(node, new Node.Literal(token.value, raw));
        };
        // import {<foo as bar>} ...;
        Parser.prototype.parseImportSpecifier = function () {
            var node = this.createNode();
            var imported;
            var local;
            if (this.lookahead.type === 3 /* Identifier */) {
                imported = this.parseVariableIdentifier();
                local = imported;
                if (this.matchContextualKeyword('as')) {
                    this.nextToken();
                    local = this.parseVariableIdentifier();
                }
            }
            else {
                imported = this.parseIdentifierName();
                local = imported;
                if (this.matchContextualKeyword('as')) {
                    this.nextToken();
                    local = this.parseVariableIdentifier();
                }
                else {
                    this.throwUnexpectedToken(this.nextToken());
                }
            }
            return this.finalize(node, new Node.ImportSpecifier(local, imported));
        };
        // {foo, bar as bas}
        Parser.prototype.parseNamedImports = function () {
            this.expect('{');
            var specifiers = [];
            while (!this.match('}')) {
                specifiers.push(this.parseImportSpecifier());
                if (!this.match('}')) {
                    this.expect(',');
                }
            }
            this.expect('}');
            return specifiers;
        };
        // import <foo> ...;
        Parser.prototype.parseImportDefaultSpecifier = function () {
            var node = this.createNode();
            var local = this.parseIdentifierName();
            return this.finalize(node, new Node.ImportDefaultSpecifier(local));
        };
        // import <* as foo> ...;
        Parser.prototype.parseImportNamespaceSpecifier = function () {
            var node = this.createNode();
            this.expect('*');
            if (!this.matchContextualKeyword('as')) {
                this.throwError(messages_1.Messages.NoAsAfterImportNamespace);
            }
            this.nextToken();
            var local = this.parseIdentifierName();
            return this.finalize(node, new Node.ImportNamespaceSpecifier(local));
        };
        Parser.prototype.parseImportDeclaration = function () {
            if (this.context.inFunctionBody) {
                this.throwError(messages_1.Messages.IllegalImportDeclaration);
            }
            var node = this.createNode();
            this.expectKeyword('import');
            var src;
            var specifiers = [];
            if (this.lookahead.type === 8 /* StringLiteral */) {
                // import 'foo';
                src = this.parseModuleSpecifier();
            }
            else {
                if (this.match('{')) {
                    // import {bar}
                    specifiers = specifiers.concat(this.parseNamedImports());
                }
                else if (this.match('*')) {
                    // import * as foo
                    specifiers.push(this.parseImportNamespaceSpecifier());
                }
                else if (this.isIdentifierName(this.lookahead) && !this.matchKeyword('default')) {
                    // import foo
                    specifiers.push(this.parseImportDefaultSpecifier());
                    if (this.match(',')) {
                        this.nextToken();
                        if (this.match('*')) {
                            // import foo, * as foo
                            specifiers.push(this.parseImportNamespaceSpecifier());
                        }
                        else if (this.match('{')) {
                            // import foo, {bar}
                            specifiers = specifiers.concat(this.parseNamedImports());
                        }
                        else {
                            this.throwUnexpectedToken(this.lookahead);
                        }
                    }
                }
                else {
                    this.throwUnexpectedToken(this.nextToken());
                }
                if (!this.matchContextualKeyword('from')) {
                    var message = this.lookahead.value ? messages_1.Messages.UnexpectedToken : messages_1.Messages.MissingFromClause;
                    this.throwError(message, this.lookahead.value);
                }
                this.nextToken();
                src = this.parseModuleSpecifier();
            }
            this.consumeSemicolon();
            return this.finalize(node, new Node.ImportDeclaration(specifiers, src));
        };
        // https://tc39.github.io/ecma262/#sec-exports
        Parser.prototype.parseExportSpecifier = function () {
            var node = this.createNode();
            var local = this.parseIdentifierName();
            var exported = local;
            if (this.matchContextualKeyword('as')) {
                this.nextToken();
                exported = this.parseIdentifierName();
            }
            return this.finalize(node, new Node.ExportSpecifier(local, exported));
        };
        Parser.prototype.parseExportDeclaration = function () {
            if (this.context.inFunctionBody) {
                this.throwError(messages_1.Messages.IllegalExportDeclaration);
            }
            var node = this.createNode();
            this.expectKeyword('export');
            var exportDeclaration;
            if (this.matchKeyword('default')) {
                // export default ...
                this.nextToken();
                if (this.matchKeyword('function')) {
                    // export default function foo () {}
                    // export default function () {}
                    var declaration = this.parseFunctionDeclaration(true);
                    exportDeclaration = this.finalize(node, new Node.ExportDefaultDeclaration(declaration));
                }
                else if (this.matchKeyword('class')) {
                    // export default class foo {}
                    var declaration = this.parseClassDeclaration(true);
                    exportDeclaration = this.finalize(node, new Node.ExportDefaultDeclaration(declaration));
                }
                else if (this.matchContextualKeyword('async')) {
                    // export default async function f () {}
                    // export default async function () {}
                    // export default async x => x
                    var declaration = this.matchAsyncFunction() ? this.parseFunctionDeclaration(true) : this.parseAssignmentExpression();
                    exportDeclaration = this.finalize(node, new Node.ExportDefaultDeclaration(declaration));
                }
                else {
                    if (this.matchContextualKeyword('from')) {
                        this.throwError(messages_1.Messages.UnexpectedToken, this.lookahead.value);
                    }
                    // export default {};
                    // export default [];
                    // export default (1 + 2);
                    var declaration = this.match('{') ? this.parseObjectInitializer() :
                        this.match('[') ? this.parseArrayInitializer() : this.parseAssignmentExpression();
                    this.consumeSemicolon();
                    exportDeclaration = this.finalize(node, new Node.ExportDefaultDeclaration(declaration));
                }
            }
            else if (this.match('*')) {
                // export * from 'foo';
                this.nextToken();
                if (!this.matchContextualKeyword('from')) {
                    var message = this.lookahead.value ? messages_1.Messages.UnexpectedToken : messages_1.Messages.MissingFromClause;
                    this.throwError(message, this.lookahead.value);
                }
                this.nextToken();
                var src = this.parseModuleSpecifier();
                this.consumeSemicolon();
                exportDeclaration = this.finalize(node, new Node.ExportAllDeclaration(src));
            }
            else if (this.lookahead.type === 4 /* Keyword */) {
                // export var f = 1;
                var declaration = void 0;
                switch (this.lookahead.value) {
                    case 'let':
                    case 'const':
                        declaration = this.parseLexicalDeclaration({ inFor: false });
                        break;
                    case 'var':
                    case 'class':
                    case 'function':
                        declaration = this.parseStatementListItem();
                        break;
                    default:
                        this.throwUnexpectedToken(this.lookahead);
                }
                exportDeclaration = this.finalize(node, new Node.ExportNamedDeclaration(declaration, [], null));
            }
            else if (this.matchAsyncFunction()) {
                var declaration = this.parseFunctionDeclaration();
                exportDeclaration = this.finalize(node, new Node.ExportNamedDeclaration(declaration, [], null));
            }
            else {
                var specifiers = [];
                var source = null;
                var isExportFromIdentifier = false;
                this.expect('{');
                while (!this.match('}')) {
                    isExportFromIdentifier = isExportFromIdentifier || this.matchKeyword('default');
                    specifiers.push(this.parseExportSpecifier());
                    if (!this.match('}')) {
                        this.expect(',');
                    }
                }
                this.expect('}');
                if (this.matchContextualKeyword('from')) {
                    // export {default} from 'foo';
                    // export {foo} from 'foo';
                    this.nextToken();
                    source = this.parseModuleSpecifier();
                    this.consumeSemicolon();
                }
                else if (isExportFromIdentifier) {
                    // export {default}; // missing fromClause
                    var message = this.lookahead.value ? messages_1.Messages.UnexpectedToken : messages_1.Messages.MissingFromClause;
                    this.throwError(message, this.lookahead.value);
                }
                else {
                    // export {foo};
                    this.consumeSemicolon();
                }
                exportDeclaration = this.finalize(node, new Node.ExportNamedDeclaration(null, specifiers, source));
            }
            return exportDeclaration;
        };
        return Parser;
    }());
    exports.Parser = Parser;
  
  
  /***/ },
  /* 9 */
  /***/ function(module, exports) {
  
    "use strict";
    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.
    Object.defineProperty(exports, "__esModule", { value: true });
    function assert(condition, message) {
        /* istanbul ignore if */
        if (!condition) {
            throw new Error('ASSERT: ' + message);
        }
    }
    exports.assert = assert;
  
  
  /***/ },
  /* 10 */
  /***/ function(module, exports) {
  
    "use strict";
    /* tslint:disable:max-classes-per-file */
    Object.defineProperty(exports, "__esModule", { value: true });
    var ErrorHandler = (function () {
        function ErrorHandler() {
            this.errors = [];
            this.tolerant = false;
        }
        ErrorHandler.prototype.recordError = function (error) {
            this.errors.push(error);
        };
        ErrorHandler.prototype.tolerate = function (error) {
            if (this.tolerant) {
                this.recordError(error);
            }
            else {
                throw error;
            }
        };
        ErrorHandler.prototype.constructError = function (msg, column) {
            var error = new Error(msg);
            try {
                throw error;
            }
            catch (base) {
                /* istanbul ignore else */
                if (Object.create && Object.defineProperty) {
                    error = Object.create(base);
                    Object.defineProperty(error, 'column', { value: column });
                }
            }
            /* istanbul ignore next */
            return error;
        };
        ErrorHandler.prototype.createError = function (index, line, col, description) {
            var msg = 'Line ' + line + ': ' + description;
            var error = this.constructError(msg, col);
            error.index = index;
            error.lineNumber = line;
            error.description = description;
            return error;
        };
        ErrorHandler.prototype.throwError = function (index, line, col, description) {
            throw this.createError(index, line, col, description);
        };
        ErrorHandler.prototype.tolerateError = function (index, line, col, description) {
            var error = this.createError(index, line, col, description);
            if (this.tolerant) {
                this.recordError(error);
            }
            else {
                throw error;
            }
        };
        return ErrorHandler;
    }());
    exports.ErrorHandler = ErrorHandler;
  
  
  /***/ },
  /* 11 */
  /***/ function(module, exports) {
  
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Error messages should be identical to V8.
    exports.Messages = {
        BadGetterArity: 'Getter must not have any formal parameters',
        BadSetterArity: 'Setter must have exactly one formal parameter',
        BadSetterRestParameter: 'Setter function argument must not be a rest parameter',
        ConstructorIsAsync: 'Class constructor may not be an async method',
        ConstructorSpecialMethod: 'Class constructor may not be an accessor',
        DeclarationMissingInitializer: 'Missing initializer in %0 declaration',
        DefaultRestParameter: 'Unexpected token =',
        DuplicateBinding: 'Duplicate binding %0',
        DuplicateConstructor: 'A class may only have one constructor',
        DuplicateProtoProperty: 'Duplicate __proto__ fields are not allowed in object literals',
        ForInOfLoopInitializer: '%0 loop variable declaration may not have an initializer',
        GeneratorInLegacyContext: 'Generator declarations are not allowed in legacy contexts',
        IllegalBreak: 'Illegal break statement',
        IllegalContinue: 'Illegal continue statement',
        IllegalExportDeclaration: 'Unexpected token',
        IllegalImportDeclaration: 'Unexpected token',
        IllegalLanguageModeDirective: 'Illegal \'use strict\' directive in function with non-simple parameter list',
        IllegalReturn: 'Illegal return statement',
        InvalidEscapedReservedWord: 'Keyword must not contain escaped characters',
        InvalidHexEscapeSequence: 'Invalid hexadecimal escape sequence',
        InvalidLHSInAssignment: 'Invalid left-hand side in assignment',
        InvalidLHSInForIn: 'Invalid left-hand side in for-in',
        InvalidLHSInForLoop: 'Invalid left-hand side in for-loop',
        InvalidModuleSpecifier: 'Unexpected token',
        InvalidRegExp: 'Invalid regular expression',
        LetInLexicalBinding: 'let is disallowed as a lexically bound name',
        MissingFromClause: 'Unexpected token',
        MultipleDefaultsInSwitch: 'More than one default clause in switch statement',
        NewlineAfterThrow: 'Illegal newline after throw',
        NoAsAfterImportNamespace: 'Unexpected token',
        NoCatchOrFinally: 'Missing catch or finally after try',
        ParameterAfterRestParameter: 'Rest parameter must be last formal parameter',
        Redeclaration: '%0 \'%1\' has already been declared',
        StaticPrototype: 'Classes may not have static property named prototype',
        StrictCatchVariable: 'Catch variable may not be eval or arguments in strict mode',
        StrictDelete: 'Delete of an unqualified identifier in strict mode.',
        StrictFunction: 'In strict mode code, functions can only be declared at top level or inside a block',
        StrictFunctionName: 'Function name may not be eval or arguments in strict mode',
        StrictLHSAssignment: 'Assignment to eval or arguments is not allowed in strict mode',
        StrictLHSPostfix: 'Postfix increment/decrement may not have eval or arguments operand in strict mode',
        StrictLHSPrefix: 'Prefix increment/decrement may not have eval or arguments operand in strict mode',
        StrictModeWith: 'Strict mode code may not include a with statement',
        StrictOctalLiteral: 'Octal literals are not allowed in strict mode.',
        StrictParamDupe: 'Strict mode function may not have duplicate parameter names',
        StrictParamName: 'Parameter name eval or arguments is not allowed in strict mode',
        StrictReservedWord: 'Use of future reserved word in strict mode',
        StrictVarName: 'Variable name may not be eval or arguments in strict mode',
        TemplateOctalLiteral: 'Octal literals are not allowed in template strings.',
        UnexpectedEOS: 'Unexpected end of input',
        UnexpectedIdentifier: 'Unexpected identifier',
        UnexpectedNumber: 'Unexpected number',
        UnexpectedReserved: 'Unexpected reserved word',
        UnexpectedString: 'Unexpected string',
        UnexpectedTemplate: 'Unexpected quasi %0',
        UnexpectedToken: 'Unexpected token %0',
        UnexpectedTokenIllegal: 'Unexpected token ILLEGAL',
        UnknownLabel: 'Undefined label \'%0\'',
        UnterminatedRegExp: 'Invalid regular expression: missing /'
    };
  
  
  /***/ },
  /* 12 */
  /***/ function(module, exports, __webpack_require__) {
  
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var assert_1 = __webpack_require__(9);
    var character_1 = __webpack_require__(4);
    var messages_1 = __webpack_require__(11);
    function hexValue(ch) {
        return '0123456789abcdef'.indexOf(ch.toLowerCase());
    }
    function octalValue(ch) {
        return '01234567'.indexOf(ch);
    }
    var Scanner = (function () {
        function Scanner(code, handler) {
            this.source = code;
            this.errorHandler = handler;
            this.trackComment = false;
            this.isModule = false;
            this.length = code.length;
            this.index = 0;
            this.lineNumber = (code.length > 0) ? 1 : 0;
            this.lineStart = 0;
            this.curlyStack = [];
        }
        Scanner.prototype.saveState = function () {
            return {
                index: this.index,
                lineNumber: this.lineNumber,
                lineStart: this.lineStart
            };
        };
        Scanner.prototype.restoreState = function (state) {
            this.index = state.index;
            this.lineNumber = state.lineNumber;
            this.lineStart = state.lineStart;
        };
        Scanner.prototype.eof = function () {
            return this.index >= this.length;
        };
        Scanner.prototype.throwUnexpectedToken = function (message) {
            if (message === void 0) { message = messages_1.Messages.UnexpectedTokenIllegal; }
            return this.errorHandler.throwError(this.index, this.lineNumber, this.index - this.lineStart + 1, message);
        };
        Scanner.prototype.tolerateUnexpectedToken = function (message) {
            if (message === void 0) { message = messages_1.Messages.UnexpectedTokenIllegal; }
            this.errorHandler.tolerateError(this.index, this.lineNumber, this.index - this.lineStart + 1, message);
        };
        // https://tc39.github.io/ecma262/#sec-comments
        Scanner.prototype.skipSingleLineComment = function (offset) {
            var comments = [];
            var start, loc;
            if (this.trackComment) {
                comments = [];
                start = this.index - offset;
                loc = {
                    start: {
                        line: this.lineNumber,
                        column: this.index - this.lineStart - offset
                    },
                    end: {}
                };
            }
            while (!this.eof()) {
                var ch = this.source.charCodeAt(this.index);
                ++this.index;
                if (character_1.Character.isLineTerminator(ch)) {
                    if (this.trackComment) {
                        loc.end = {
                            line: this.lineNumber,
                            column: this.index - this.lineStart - 1
                        };
                        var entry = {
                            multiLine: false,
                            slice: [start + offset, this.index - 1],
                            range: [start, this.index - 1],
                            loc: loc
                        };
                        comments.push(entry);
                    }
                    if (ch === 13 && this.source.charCodeAt(this.index) === 10) {
                        ++this.index;
                    }
                    ++this.lineNumber;
                    this.lineStart = this.index;
                    return comments;
                }
            }
            if (this.trackComment) {
                loc.end = {
                    line: this.lineNumber,
                    column: this.index - this.lineStart
                };
                var entry = {
                    multiLine: false,
                    slice: [start + offset, this.index],
                    range: [start, this.index],
                    loc: loc
                };
                comments.push(entry);
            }
            return comments;
        };
        Scanner.prototype.skipMultiLineComment = function () {
            var comments = [];
            var start, loc;
            if (this.trackComment) {
                comments = [];
                start = this.index - 2;
                loc = {
                    start: {
                        line: this.lineNumber,
                        column: this.index - this.lineStart - 2
                    },
                    end: {}
                };
            }
            while (!this.eof()) {
                var ch = this.source.charCodeAt(this.index);
                if (character_1.Character.isLineTerminator(ch)) {
                    if (ch === 0x0D && this.source.charCodeAt(this.index + 1) === 0x0A) {
                        ++this.index;
                    }
                    ++this.lineNumber;
                    ++this.index;
                    this.lineStart = this.index;
                }
                else if (ch === 0x2A) {
                    // Block comment ends with '*/'.
                    if (this.source.charCodeAt(this.index + 1) === 0x2F) {
                        this.index += 2;
                        if (this.trackComment) {
                            loc.end = {
                                line: this.lineNumber,
                                column: this.index - this.lineStart
                            };
                            var entry = {
                                multiLine: true,
                                slice: [start + 2, this.index - 2],
                                range: [start, this.index],
                                loc: loc
                            };
                            comments.push(entry);
                        }
                        return comments;
                    }
                    ++this.index;
                }
                else {
                    ++this.index;
                }
            }
            // Ran off the end of the file - the whole thing is a comment
            if (this.trackComment) {
                loc.end = {
                    line: this.lineNumber,
                    column: this.index - this.lineStart
                };
                var entry = {
                    multiLine: true,
                    slice: [start + 2, this.index],
                    range: [start, this.index],
                    loc: loc
                };
                comments.push(entry);
            }
            this.tolerateUnexpectedToken();
            return comments;
        };
        Scanner.prototype.scanComments = function () {
            var comments;
            if (this.trackComment) {
                comments = [];
            }
            var start = (this.index === 0);
            while (!this.eof()) {
                var ch = this.source.charCodeAt(this.index);
                if (character_1.Character.isWhiteSpace(ch)) {
                    ++this.index;
                }
                else if (character_1.Character.isLineTerminator(ch)) {
                    ++this.index;
                    if (ch === 0x0D && this.source.charCodeAt(this.index) === 0x0A) {
                        ++this.index;
                    }
                    ++this.lineNumber;
                    this.lineStart = this.index;
                    start = true;
                }
                else if (ch === 0x2F) {
                    ch = this.source.charCodeAt(this.index + 1);
                    if (ch === 0x2F) {
                        this.index += 2;
                        var comment = this.skipSingleLineComment(2);
                        if (this.trackComment) {
                            comments = comments.concat(comment);
                        }
                        start = true;
                    }
                    else if (ch === 0x2A) {
                        this.index += 2;
                        var comment = this.skipMultiLineComment();
                        if (this.trackComment) {
                            comments = comments.concat(comment);
                        }
                    }
                    else {
                        break;
                    }
                }
                else if (start && ch === 0x2D) {
                    // U+003E is '>'
                    if ((this.source.charCodeAt(this.index + 1) === 0x2D) && (this.source.charCodeAt(this.index + 2) === 0x3E)) {
                        // '-->' is a single-line comment
                        this.index += 3;
                        var comment = this.skipSingleLineComment(3);
                        if (this.trackComment) {
                            comments = comments.concat(comment);
                        }
                    }
                    else {
                        break;
                    }
                }
                else if (ch === 0x3C && !this.isModule) {
                    if (this.source.slice(this.index + 1, this.index + 4) === '!--') {
                        this.index += 4; // `<!--`
                        var comment = this.skipSingleLineComment(4);
                        if (this.trackComment) {
                            comments = comments.concat(comment);
                        }
                    }
                    else {
                        break;
                    }
                }
                else {
                    break;
                }
            }
            return comments;
        };
        // https://tc39.github.io/ecma262/#sec-future-reserved-words
        Scanner.prototype.isFutureReservedWord = function (id) {
            switch (id) {
                case 'enum':
                case 'export':
                case 'import':
                case 'super':
                    return true;
                default:
                    return false;
            }
        };
        Scanner.prototype.isStrictModeReservedWord = function (id) {
            switch (id) {
                case 'implements':
                case 'interface':
                case 'package':
                case 'private':
                case 'protected':
                case 'public':
                case 'static':
                case 'yield':
                case 'let':
                    return true;
                default:
                    return false;
            }
        };
        Scanner.prototype.isRestrictedWord = function (id) {
            return id === 'eval' || id === 'arguments';
        };
        // https://tc39.github.io/ecma262/#sec-keywords
        Scanner.prototype.isKeyword = function (id) {
            switch (id.length) {
                case 2:
                    return (id === 'if') || (id === 'in') || (id === 'do');
                case 3:
                    return (id === 'var') || (id === 'for') || (id === 'new') ||
                        (id === 'try') || (id === 'let');
                case 4:
                    return (id === 'this') || (id === 'else') || (id === 'case') ||
                        (id === 'void') || (id === 'with') || (id === 'enum');
                case 5:
                    return (id === 'while') || (id === 'break') || (id === 'catch') ||
                        (id === 'throw') || (id === 'const') || (id === 'yield') ||
                        (id === 'class') || (id === 'super');
                case 6:
                    return (id === 'return') || (id === 'typeof') || (id === 'delete') ||
                        (id === 'switch') || (id === 'export') || (id === 'import');
                case 7:
                    return (id === 'default') || (id === 'finally') || (id === 'extends');
                case 8:
                    return (id === 'function') || (id === 'continue') || (id === 'debugger');
                case 10:
                    return (id === 'instanceof');
                default:
                    return false;
            }
        };
        Scanner.prototype.codePointAt = function (i) {
            var cp = this.source.charCodeAt(i);
            if (cp >= 0xD800 && cp <= 0xDBFF) {
                var second = this.source.charCodeAt(i + 1);
                if (second >= 0xDC00 && second <= 0xDFFF) {
                    var first = cp;
                    cp = (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
                }
            }
            return cp;
        };
        Scanner.prototype.scanHexEscape = function (prefix) {
            var len = (prefix === 'u') ? 4 : 2;
            var code = 0;
            for (var i = 0; i < len; ++i) {
                if (!this.eof() && character_1.Character.isHexDigit(this.source.charCodeAt(this.index))) {
                    code = code * 16 + hexValue(this.source[this.index++]);
                }
                else {
                    return null;
                }
            }
            return String.fromCharCode(code);
        };
        Scanner.prototype.scanUnicodeCodePointEscape = function () {
            var ch = this.source[this.index];
            var code = 0;
            // At least, one hex digit is required.
            if (ch === '}') {
                this.throwUnexpectedToken();
            }
            while (!this.eof()) {
                ch = this.source[this.index++];
                if (!character_1.Character.isHexDigit(ch.charCodeAt(0))) {
                    break;
                }
                code = code * 16 + hexValue(ch);
            }
            if (code > 0x10FFFF || ch !== '}') {
                this.throwUnexpectedToken();
            }
            return character_1.Character.fromCodePoint(code);
        };
        Scanner.prototype.getIdentifier = function () {
            var start = this.index++;
            while (!this.eof()) {
                var ch = this.source.charCodeAt(this.index);
                if (ch === 0x5C) {
                    // Blackslash (U+005C) marks Unicode escape sequence.
                    this.index = start;
                    return this.getComplexIdentifier();
                }
                else if (ch >= 0xD800 && ch < 0xDFFF) {
                    // Need to handle surrogate pairs.
                    this.index = start;
                    return this.getComplexIdentifier();
                }
                if (character_1.Character.isIdentifierPart(ch)) {
                    ++this.index;
                }
                else {
                    break;
                }
            }
            return this.source.slice(start, this.index);
        };
        Scanner.prototype.getComplexIdentifier = function () {
            var cp = this.codePointAt(this.index);
            var id = character_1.Character.fromCodePoint(cp);
            this.index += id.length;
            // '\u' (U+005C, U+0075) denotes an escaped character.
            var ch;
            if (cp === 0x5C) {
                if (this.source.charCodeAt(this.index) !== 0x75) {
                    this.throwUnexpectedToken();
                }
                ++this.index;
                if (this.source[this.index] === '{') {
                    ++this.index;
                    ch = this.scanUnicodeCodePointEscape();
                }
                else {
                    ch = this.scanHexEscape('u');
                    if (ch === null || ch === '\\' || !character_1.Character.isIdentifierStart(ch.charCodeAt(0))) {
                        this.throwUnexpectedToken();
                    }
                }
                id = ch;
            }
            while (!this.eof()) {
                cp = this.codePointAt(this.index);
                if (!character_1.Character.isIdentifierPart(cp)) {
                    break;
                }
                ch = character_1.Character.fromCodePoint(cp);
                id += ch;
                this.index += ch.length;
                // '\u' (U+005C, U+0075) denotes an escaped character.
                if (cp === 0x5C) {
                    id = id.substr(0, id.length - 1);
                    if (this.source.charCodeAt(this.index) !== 0x75) {
                        this.throwUnexpectedToken();
                    }
                    ++this.index;
                    if (this.source[this.index] === '{') {
                        ++this.index;
                        ch = this.scanUnicodeCodePointEscape();
                    }
                    else {
                        ch = this.scanHexEscape('u');
                        if (ch === null || ch === '\\' || !character_1.Character.isIdentifierPart(ch.charCodeAt(0))) {
                            this.throwUnexpectedToken();
                        }
                    }
                    id += ch;
                }
            }
            return id;
        };
        Scanner.prototype.octalToDecimal = function (ch) {
            // \0 is not octal escape sequence
            var octal = (ch !== '0');
            var code = octalValue(ch);
            if (!this.eof() && character_1.Character.isOctalDigit(this.source.charCodeAt(this.index))) {
                octal = true;
                code = code * 8 + octalValue(this.source[this.index++]);
                // 3 digits are only allowed when string starts
                // with 0, 1, 2, 3
                if ('0123'.indexOf(ch) >= 0 && !this.eof() && character_1.Character.isOctalDigit(this.source.charCodeAt(this.index))) {
                    code = code * 8 + octalValue(this.source[this.index++]);
                }
            }
            return {
                code: code,
                octal: octal
            };
        };
        // https://tc39.github.io/ecma262/#sec-names-and-keywords
        Scanner.prototype.scanIdentifier = function () {
            var type;
            var start = this.index;
            // Backslash (U+005C) starts an escaped character.
            var id = (this.source.charCodeAt(start) === 0x5C) ? this.getComplexIdentifier() : this.getIdentifier();
            // There is no keyword or literal with only one character.
            // Thus, it must be an identifier.
            if (id.length === 1) {
                type = 3 /* Identifier */;
            }
            else if (this.isKeyword(id)) {
                type = 4 /* Keyword */;
            }
            else if (id === 'null') {
                type = 5 /* NullLiteral */;
            }
            else if (id === 'true' || id === 'false') {
                type = 1 /* BooleanLiteral */;
            }
            else {
                type = 3 /* Identifier */;
            }
            if (type !== 3 /* Identifier */ && (start + id.length !== this.index)) {
                var restore = this.index;
                this.index = start;
                this.tolerateUnexpectedToken(messages_1.Messages.InvalidEscapedReservedWord);
                this.index = restore;
            }
            return {
                type: type,
                value: id,
                lineNumber: this.lineNumber,
                lineStart: this.lineStart,
                start: start,
                end: this.index
            };
        };
        // https://tc39.github.io/ecma262/#sec-punctuators
        Scanner.prototype.scanPunctuator = function () {
            var start = this.index;
            // Check for most common single-character punctuators.
            var str = this.source[this.index];
            switch (str) {
                case '(':
                case '{':
                    if (str === '{') {
                        this.curlyStack.push('{');
                    }
                    ++this.index;
                    break;
                case '.':
                    ++this.index;
                    if (this.source[this.index] === '.' && this.source[this.index + 1] === '.') {
                        // Spread operator: ...
                        this.index += 2;
                        str = '...';
                    }
                    break;
                case '}':
                    ++this.index;
                    this.curlyStack.pop();
                    break;
                case ')':
                case ';':
                case ',':
                case '[':
                case ']':
                case ':':
                case '?':
                case '~':
                    ++this.index;
                    break;
                default:
                    // 4-character punctuator.
                    str = this.source.substr(this.index, 4);
                    if (str === '>>>=') {
                        this.index += 4;
                    }
                    else {
                        // 3-character punctuators.
                        str = str.substr(0, 3);
                        if (str === '===' || str === '!==' || str === '>>>' ||
                            str === '<<=' || str === '>>=' || str === '**=') {
                            this.index += 3;
                        }
                        else {
                            // 2-character punctuators.
                            str = str.substr(0, 2);
                            if (str === '&&' || str === '||' || str === '==' || str === '!=' ||
                                str === '+=' || str === '-=' || str === '*=' || str === '/=' ||
                                str === '++' || str === '--' || str === '<<' || str === '>>' ||
                                str === '&=' || str === '|=' || str === '^=' || str === '%=' ||
                                str === '<=' || str === '>=' || str === '=>' || str === '**') {
                                this.index += 2;
                            }
                            else {
                                // 1-character punctuators.
                                str = this.source[this.index];
                                if ('<>=!+-*%&|^/'.indexOf(str) >= 0) {
                                    ++this.index;
                                }
                            }
                        }
                    }
            }
            if (this.index === start) {
                this.throwUnexpectedToken();
            }
            return {
                type: 7 /* Punctuator */,
                value: str,
                lineNumber: this.lineNumber,
                lineStart: this.lineStart,
                start: start,
                end: this.index
            };
        };
        // https://tc39.github.io/ecma262/#sec-literals-numeric-literals
        Scanner.prototype.scanHexLiteral = function (start) {
            var num = '';
            while (!this.eof()) {
                if (!character_1.Character.isHexDigit(this.source.charCodeAt(this.index))) {
                    break;
                }
                num += this.source[this.index++];
            }
            if (num.length === 0) {
                this.throwUnexpectedToken();
            }
            if (character_1.Character.isIdentifierStart(this.source.charCodeAt(this.index))) {
                this.throwUnexpectedToken();
            }
            return {
                type: 6 /* NumericLiteral */,
                value: parseInt('0x' + num, 16),
                lineNumber: this.lineNumber,
                lineStart: this.lineStart,
                start: start,
                end: this.index
            };
        };
        Scanner.prototype.scanBinaryLiteral = function (start) {
            var num = '';
            var ch;
            while (!this.eof()) {
                ch = this.source[this.index];
                if (ch !== '0' && ch !== '1') {
                    break;
                }
                num += this.source[this.index++];
            }
            if (num.length === 0) {
                // only 0b or 0B
                this.throwUnexpectedToken();
            }
            if (!this.eof()) {
                ch = this.source.charCodeAt(this.index);
                /* istanbul ignore else */
                if (character_1.Character.isIdentifierStart(ch) || character_1.Character.isDecimalDigit(ch)) {
                    this.throwUnexpectedToken();
                }
            }
            return {
                type: 6 /* NumericLiteral */,
                value: parseInt(num, 2),
                lineNumber: this.lineNumber,
                lineStart: this.lineStart,
                start: start,
                end: this.index
            };
        };
        Scanner.prototype.scanOctalLiteral = function (prefix, start) {
            var num = '';
            var octal = false;
            if (character_1.Character.isOctalDigit(prefix.charCodeAt(0))) {
                octal = true;
                num = '0' + this.source[this.index++];
            }
            else {
                ++this.index;
            }
            while (!this.eof()) {
                if (!character_1.Character.isOctalDigit(this.source.charCodeAt(this.index))) {
                    break;
                }
                num += this.source[this.index++];
            }
            if (!octal && num.length === 0) {
                // only 0o or 0O
                this.throwUnexpectedToken();
            }
            if (character_1.Character.isIdentifierStart(this.source.charCodeAt(this.index)) || character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index))) {
                this.throwUnexpectedToken();
            }
            return {
                type: 6 /* NumericLiteral */,
                value: parseInt(num, 8),
                octal: octal,
                lineNumber: this.lineNumber,
                lineStart: this.lineStart,
                start: start,
                end: this.index
            };
        };
        Scanner.prototype.isImplicitOctalLiteral = function () {
            // Implicit octal, unless there is a non-octal digit.
            // (Annex B.1.1 on Numeric Literals)
            for (var i = this.index + 1; i < this.length; ++i) {
                var ch = this.source[i];
                if (ch === '8' || ch === '9') {
                    return false;
                }
                if (!character_1.Character.isOctalDigit(ch.charCodeAt(0))) {
                    return true;
                }
            }
            return true;
        };
        Scanner.prototype.scanNumericLiteral = function () {
            var start = this.index;
            var ch = this.source[start];
            assert_1.assert(character_1.Character.isDecimalDigit(ch.charCodeAt(0)) || (ch === '.'), 'Numeric literal must start with a decimal digit or a decimal point');
            var num = '';
            if (ch !== '.') {
                num = this.source[this.index++];
                ch = this.source[this.index];
                // Hex number starts with '0x'.
                // Octal number starts with '0'.
                // Octal number in ES6 starts with '0o'.
                // Binary number in ES6 starts with '0b'.
                if (num === '0') {
                    if (ch === 'x' || ch === 'X') {
                        ++this.index;
                        return this.scanHexLiteral(start);
                    }
                    if (ch === 'b' || ch === 'B') {
                        ++this.index;
                        return this.scanBinaryLiteral(start);
                    }
                    if (ch === 'o' || ch === 'O') {
                        return this.scanOctalLiteral(ch, start);
                    }
                    if (ch && character_1.Character.isOctalDigit(ch.charCodeAt(0))) {
                        if (this.isImplicitOctalLiteral()) {
                            return this.scanOctalLiteral(ch, start);
                        }
                    }
                }
                while (character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index))) {
                    num += this.source[this.index++];
                }
                ch = this.source[this.index];
            }
            if (ch === '.') {
                num += this.source[this.index++];
                while (character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index))) {
                    num += this.source[this.index++];
                }
                ch = this.source[this.index];
            }
            if (ch === 'e' || ch === 'E') {
                num += this.source[this.index++];
                ch = this.source[this.index];
                if (ch === '+' || ch === '-') {
                    num += this.source[this.index++];
                }
                if (character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index))) {
                    while (character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index))) {
                        num += this.source[this.index++];
                    }
                }
                else {
                    this.throwUnexpectedToken();
                }
            }
            if (character_1.Character.isIdentifierStart(this.source.charCodeAt(this.index))) {
                this.throwUnexpectedToken();
            }
            return {
                type: 6 /* NumericLiteral */,
                value: parseFloat(num),
                lineNumber: this.lineNumber,
                lineStart: this.lineStart,
                start: start,
                end: this.index
            };
        };
        // https://tc39.github.io/ecma262/#sec-literals-string-literals
        Scanner.prototype.scanStringLiteral = function () {
            var start = this.index;
            var quote = this.source[start];
            assert_1.assert((quote === '\'' || quote === '"'), 'String literal must starts with a quote');
            ++this.index;
            var octal = false;
            var str = '';
            while (!this.eof()) {
                var ch = this.source[this.index++];
                if (ch === quote) {
                    quote = '';
                    break;
                }
                else if (ch === '\\') {
                    ch = this.source[this.index++];
                    if (!ch || !character_1.Character.isLineTerminator(ch.charCodeAt(0))) {
                        switch (ch) {
                            case 'u':
                                if (this.source[this.index] === '{') {
                                    ++this.index;
                                    str += this.scanUnicodeCodePointEscape();
                                }
                                else {
                                    var unescaped_1 = this.scanHexEscape(ch);
                                    if (unescaped_1 === null) {
                                        this.throwUnexpectedToken();
                                    }
                                    str += unescaped_1;
                                }
                                break;
                            case 'x':
                                var unescaped = this.scanHexEscape(ch);
                                if (unescaped === null) {
                                    this.throwUnexpectedToken(messages_1.Messages.InvalidHexEscapeSequence);
                                }
                                str += unescaped;
                                break;
                            case 'n':
                                str += '\n';
                                break;
                            case 'r':
                                str += '\r';
                                break;
                            case 't':
                                str += '\t';
                                break;
                            case 'b':
                                str += '\b';
                                break;
                            case 'f':
                                str += '\f';
                                break;
                            case 'v':
                                str += '\x0B';
                                break;
                            case '8':
                            case '9':
                                str += ch;
                                this.tolerateUnexpectedToken();
                                break;
                            default:
                                if (ch && character_1.Character.isOctalDigit(ch.charCodeAt(0))) {
                                    var octToDec = this.octalToDecimal(ch);
                                    octal = octToDec.octal || octal;
                                    str += String.fromCharCode(octToDec.code);
                                }
                                else {
                                    str += ch;
                                }
                                break;
                        }
                    }
                    else {
                        ++this.lineNumber;
                        if (ch === '\r' && this.source[this.index] === '\n') {
                            ++this.index;
                        }
                        this.lineStart = this.index;
                    }
                }
                else if (character_1.Character.isLineTerminator(ch.charCodeAt(0))) {
                    break;
                }
                else {
                    str += ch;
                }
            }
            if (quote !== '') {
                this.index = start;
                this.throwUnexpectedToken();
            }
            return {
                type: 8 /* StringLiteral */,
                value: str,
                octal: octal,
                lineNumber: this.lineNumber,
                lineStart: this.lineStart,
                start: start,
                end: this.index
            };
        };
        // https://tc39.github.io/ecma262/#sec-template-literal-lexical-components
        Scanner.prototype.scanTemplate = function () {
            var cooked = '';
            var terminated = false;
            var start = this.index;
            var head = (this.source[start] === '`');
            var tail = false;
            var rawOffset = 2;
            ++this.index;
            while (!this.eof()) {
                var ch = this.source[this.index++];
                if (ch === '`') {
                    rawOffset = 1;
                    tail = true;
                    terminated = true;
                    break;
                }
                else if (ch === '$') {
                    if (this.source[this.index] === '{') {
                        this.curlyStack.push('${');
                        ++this.index;
                        terminated = true;
                        break;
                    }
                    cooked += ch;
                }
                else if (ch === '\\') {
                    ch = this.source[this.index++];
                    if (!character_1.Character.isLineTerminator(ch.charCodeAt(0))) {
                        switch (ch) {
                            case 'n':
                                cooked += '\n';
                                break;
                            case 'r':
                                cooked += '\r';
                                break;
                            case 't':
                                cooked += '\t';
                                break;
                            case 'u':
                                if (this.source[this.index] === '{') {
                                    ++this.index;
                                    cooked += this.scanUnicodeCodePointEscape();
                                }
                                else {
                                    var restore = this.index;
                                    var unescaped_2 = this.scanHexEscape(ch);
                                    if (unescaped_2 !== null) {
                                        cooked += unescaped_2;
                                    }
                                    else {
                                        this.index = restore;
                                        cooked += ch;
                                    }
                                }
                                break;
                            case 'x':
                                var unescaped = this.scanHexEscape(ch);
                                if (unescaped === null) {
                                    this.throwUnexpectedToken(messages_1.Messages.InvalidHexEscapeSequence);
                                }
                                cooked += unescaped;
                                break;
                            case 'b':
                                cooked += '\b';
                                break;
                            case 'f':
                                cooked += '\f';
                                break;
                            case 'v':
                                cooked += '\v';
                                break;
                            default:
                                if (ch === '0') {
                                    if (character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index))) {
                                        // Illegal: \01 \02 and so on
                                        this.throwUnexpectedToken(messages_1.Messages.TemplateOctalLiteral);
                                    }
                                    cooked += '\0';
                                }
                                else if (character_1.Character.isOctalDigit(ch.charCodeAt(0))) {
                                    // Illegal: \1 \2
                                    this.throwUnexpectedToken(messages_1.Messages.TemplateOctalLiteral);
                                }
                                else {
                                    cooked += ch;
                                }
                                break;
                        }
                    }
                    else {
                        ++this.lineNumber;
                        if (ch === '\r' && this.source[this.index] === '\n') {
                            ++this.index;
                        }
                        this.lineStart = this.index;
                    }
                }
                else if (character_1.Character.isLineTerminator(ch.charCodeAt(0))) {
                    ++this.lineNumber;
                    if (ch === '\r' && this.source[this.index] === '\n') {
                        ++this.index;
                    }
                    this.lineStart = this.index;
                    cooked += '\n';
                }
                else {
                    cooked += ch;
                }
            }
            if (!terminated) {
                this.throwUnexpectedToken();
            }
            if (!head) {
                this.curlyStack.pop();
            }
            return {
                type: 10 /* Template */,
                value: this.source.slice(start + 1, this.index - rawOffset),
                cooked: cooked,
                head: head,
                tail: tail,
                lineNumber: this.lineNumber,
                lineStart: this.lineStart,
                start: start,
                end: this.index
            };
        };
        // https://tc39.github.io/ecma262/#sec-literals-regular-expression-literals
        Scanner.prototype.testRegExp = function (pattern, flags) {
            // The BMP character to use as a replacement for astral symbols when
            // translating an ES6 "u"-flagged pattern to an ES5-compatible
            // approximation.
            // Note: replacing with '\uFFFF' enables false positives in unlikely
            // scenarios. For example, `[\u{1044f}-\u{10440}]` is an invalid
            // pattern that would not be detected by this substitution.
            var astralSubstitute = '\uFFFF';
            var tmp = pattern;
            var self = this;
            if (flags.indexOf('u') >= 0) {
                tmp = tmp
                    .replace(/\\u\{([0-9a-fA-F]+)\}|\\u([a-fA-F0-9]{4})/g, function ($0, $1, $2) {
                    var codePoint = parseInt($1 || $2, 16);
                    if (codePoint > 0x10FFFF) {
                        self.throwUnexpectedToken(messages_1.Messages.InvalidRegExp);
                    }
                    if (codePoint <= 0xFFFF) {
                        return String.fromCharCode(codePoint);
                    }
                    return astralSubstitute;
                })
                    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, astralSubstitute);
            }
            // First, detect invalid regular expressions.
            try {
                RegExp(tmp);
            }
            catch (e) {
                this.throwUnexpectedToken(messages_1.Messages.InvalidRegExp);
            }
            // Return a regular expression object for this pattern-flag pair, or
            // `null` in case the current environment doesn't support the flags it
            // uses.
            try {
                return new RegExp(pattern, flags);
            }
            catch (exception) {
                /* istanbul ignore next */
                return null;
            }
        };
        Scanner.prototype.scanRegExpBody = function () {
            var ch = this.source[this.index];
            assert_1.assert(ch === '/', 'Regular expression literal must start with a slash');
            var str = this.source[this.index++];
            var classMarker = false;
            var terminated = false;
            while (!this.eof()) {
                ch = this.source[this.index++];
                str += ch;
                if (ch === '\\') {
                    ch = this.source[this.index++];
                    // https://tc39.github.io/ecma262/#sec-literals-regular-expression-literals
                    if (character_1.Character.isLineTerminator(ch.charCodeAt(0))) {
                        this.throwUnexpectedToken(messages_1.Messages.UnterminatedRegExp);
                    }
                    str += ch;
                }
                else if (character_1.Character.isLineTerminator(ch.charCodeAt(0))) {
                    this.throwUnexpectedToken(messages_1.Messages.UnterminatedRegExp);
                }
                else if (classMarker) {
                    if (ch === ']') {
                        classMarker = false;
                    }
                }
                else {
                    if (ch === '/') {
                        terminated = true;
                        break;
                    }
                    else if (ch === '[') {
                        classMarker = true;
                    }
                }
            }
            if (!terminated) {
                this.throwUnexpectedToken(messages_1.Messages.UnterminatedRegExp);
            }
            // Exclude leading and trailing slash.
            return str.substr(1, str.length - 2);
        };
        Scanner.prototype.scanRegExpFlags = function () {
            var str = '';
            var flags = '';
            while (!this.eof()) {
                var ch = this.source[this.index];
                if (!character_1.Character.isIdentifierPart(ch.charCodeAt(0))) {
                    break;
                }
                ++this.index;
                if (ch === '\\' && !this.eof()) {
                    ch = this.source[this.index];
                    if (ch === 'u') {
                        ++this.index;
                        var restore = this.index;
                        var char = this.scanHexEscape('u');
                        if (char !== null) {
                            flags += char;
                            for (str += '\\u'; restore < this.index; ++restore) {
                                str += this.source[restore];
                            }
                        }
                        else {
                            this.index = restore;
                            flags += 'u';
                            str += '\\u';
                        }
                        this.tolerateUnexpectedToken();
                    }
                    else {
                        str += '\\';
                        this.tolerateUnexpectedToken();
                    }
                }
                else {
                    flags += ch;
                    str += ch;
                }
            }
            return flags;
        };
        Scanner.prototype.scanRegExp = function () {
            var start = this.index;
            var pattern = this.scanRegExpBody();
            var flags = this.scanRegExpFlags();
            var value = this.testRegExp(pattern, flags);
            return {
                type: 9 /* RegularExpression */,
                value: '',
                pattern: pattern,
                flags: flags,
                regex: value,
                lineNumber: this.lineNumber,
                lineStart: this.lineStart,
                start: start,
                end: this.index
            };
        };
        Scanner.prototype.lex = function () {
            if (this.eof()) {
                return {
                    type: 2 /* EOF */,
                    value: '',
                    lineNumber: this.lineNumber,
                    lineStart: this.lineStart,
                    start: this.index,
                    end: this.index
                };
            }
            var cp = this.source.charCodeAt(this.index);
            if (character_1.Character.isIdentifierStart(cp)) {
                return this.scanIdentifier();
            }
            // Very common: ( and ) and ;
            if (cp === 0x28 || cp === 0x29 || cp === 0x3B) {
                return this.scanPunctuator();
            }
            // String literal starts with single quote (U+0027) or double quote (U+0022).
            if (cp === 0x27 || cp === 0x22) {
                return this.scanStringLiteral();
            }
            // Dot (.) U+002E can also start a floating-point number, hence the need
            // to check the next character.
            if (cp === 0x2E) {
                if (character_1.Character.isDecimalDigit(this.source.charCodeAt(this.index + 1))) {
                    return this.scanNumericLiteral();
                }
                return this.scanPunctuator();
            }
            if (character_1.Character.isDecimalDigit(cp)) {
                return this.scanNumericLiteral();
            }
            // Template literals start with ` (U+0060) for template head
            // or } (U+007D) for template middle or template tail.
            if (cp === 0x60 || (cp === 0x7D && this.curlyStack[this.curlyStack.length - 1] === '${')) {
                return this.scanTemplate();
            }
            // Possible identifier start in a surrogate pair.
            if (cp >= 0xD800 && cp < 0xDFFF) {
                if (character_1.Character.isIdentifierStart(this.codePointAt(this.index))) {
                    return this.scanIdentifier();
                }
            }
            return this.scanPunctuator();
        };
        return Scanner;
    }());
    exports.Scanner = Scanner;
  
  
  /***/ },
  /* 13 */
  /***/ function(module, exports) {
  
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TokenName = {};
    exports.TokenName[1 /* BooleanLiteral */] = 'Boolean';
    exports.TokenName[2 /* EOF */] = '<end>';
    exports.TokenName[3 /* Identifier */] = 'Identifier';
    exports.TokenName[4 /* Keyword */] = 'Keyword';
    exports.TokenName[5 /* NullLiteral */] = 'Null';
    exports.TokenName[6 /* NumericLiteral */] = 'Numeric';
    exports.TokenName[7 /* Punctuator */] = 'Punctuator';
    exports.TokenName[8 /* StringLiteral */] = 'String';
    exports.TokenName[9 /* RegularExpression */] = 'RegularExpression';
    exports.TokenName[10 /* Template */] = 'Template';
  
  
  /***/ },
  /* 14 */
  /***/ function(module, exports) {
  
    "use strict";
    // Generated by generate-xhtml-entities.js. DO NOT MODIFY!
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.XHTMLEntities = {
        quot: '\u0022',
        amp: '\u0026',
        apos: '\u0027',
        gt: '\u003E',
        nbsp: '\u00A0',
        iexcl: '\u00A1',
        cent: '\u00A2',
        pound: '\u00A3',
        curren: '\u00A4',
        yen: '\u00A5',
        brvbar: '\u00A6',
        sect: '\u00A7',
        uml: '\u00A8',
        copy: '\u00A9',
        ordf: '\u00AA',
        laquo: '\u00AB',
        not: '\u00AC',
        shy: '\u00AD',
        reg: '\u00AE',
        macr: '\u00AF',
        deg: '\u00B0',
        plusmn: '\u00B1',
        sup2: '\u00B2',
        sup3: '\u00B3',
        acute: '\u00B4',
        micro: '\u00B5',
        para: '\u00B6',
        middot: '\u00B7',
        cedil: '\u00B8',
        sup1: '\u00B9',
        ordm: '\u00BA',
        raquo: '\u00BB',
        frac14: '\u00BC',
        frac12: '\u00BD',
        frac34: '\u00BE',
        iquest: '\u00BF',
        Agrave: '\u00C0',
        Aacute: '\u00C1',
        Acirc: '\u00C2',
        Atilde: '\u00C3',
        Auml: '\u00C4',
        Aring: '\u00C5',
        AElig: '\u00C6',
        Ccedil: '\u00C7',
        Egrave: '\u00C8',
        Eacute: '\u00C9',
        Ecirc: '\u00CA',
        Euml: '\u00CB',
        Igrave: '\u00CC',
        Iacute: '\u00CD',
        Icirc: '\u00CE',
        Iuml: '\u00CF',
        ETH: '\u00D0',
        Ntilde: '\u00D1',
        Ograve: '\u00D2',
        Oacute: '\u00D3',
        Ocirc: '\u00D4',
        Otilde: '\u00D5',
        Ouml: '\u00D6',
        times: '\u00D7',
        Oslash: '\u00D8',
        Ugrave: '\u00D9',
        Uacute: '\u00DA',
        Ucirc: '\u00DB',
        Uuml: '\u00DC',
        Yacute: '\u00DD',
        THORN: '\u00DE',
        szlig: '\u00DF',
        agrave: '\u00E0',
        aacute: '\u00E1',
        acirc: '\u00E2',
        atilde: '\u00E3',
        auml: '\u00E4',
        aring: '\u00E5',
        aelig: '\u00E6',
        ccedil: '\u00E7',
        egrave: '\u00E8',
        eacute: '\u00E9',
        ecirc: '\u00EA',
        euml: '\u00EB',
        igrave: '\u00EC',
        iacute: '\u00ED',
        icirc: '\u00EE',
        iuml: '\u00EF',
        eth: '\u00F0',
        ntilde: '\u00F1',
        ograve: '\u00F2',
        oacute: '\u00F3',
        ocirc: '\u00F4',
        otilde: '\u00F5',
        ouml: '\u00F6',
        divide: '\u00F7',
        oslash: '\u00F8',
        ugrave: '\u00F9',
        uacute: '\u00FA',
        ucirc: '\u00FB',
        uuml: '\u00FC',
        yacute: '\u00FD',
        thorn: '\u00FE',
        yuml: '\u00FF',
        OElig: '\u0152',
        oelig: '\u0153',
        Scaron: '\u0160',
        scaron: '\u0161',
        Yuml: '\u0178',
        fnof: '\u0192',
        circ: '\u02C6',
        tilde: '\u02DC',
        Alpha: '\u0391',
        Beta: '\u0392',
        Gamma: '\u0393',
        Delta: '\u0394',
        Epsilon: '\u0395',
        Zeta: '\u0396',
        Eta: '\u0397',
        Theta: '\u0398',
        Iota: '\u0399',
        Kappa: '\u039A',
        Lambda: '\u039B',
        Mu: '\u039C',
        Nu: '\u039D',
        Xi: '\u039E',
        Omicron: '\u039F',
        Pi: '\u03A0',
        Rho: '\u03A1',
        Sigma: '\u03A3',
        Tau: '\u03A4',
        Upsilon: '\u03A5',
        Phi: '\u03A6',
        Chi: '\u03A7',
        Psi: '\u03A8',
        Omega: '\u03A9',
        alpha: '\u03B1',
        beta: '\u03B2',
        gamma: '\u03B3',
        delta: '\u03B4',
        epsilon: '\u03B5',
        zeta: '\u03B6',
        eta: '\u03B7',
        theta: '\u03B8',
        iota: '\u03B9',
        kappa: '\u03BA',
        lambda: '\u03BB',
        mu: '\u03BC',
        nu: '\u03BD',
        xi: '\u03BE',
        omicron: '\u03BF',
        pi: '\u03C0',
        rho: '\u03C1',
        sigmaf: '\u03C2',
        sigma: '\u03C3',
        tau: '\u03C4',
        upsilon: '\u03C5',
        phi: '\u03C6',
        chi: '\u03C7',
        psi: '\u03C8',
        omega: '\u03C9',
        thetasym: '\u03D1',
        upsih: '\u03D2',
        piv: '\u03D6',
        ensp: '\u2002',
        emsp: '\u2003',
        thinsp: '\u2009',
        zwnj: '\u200C',
        zwj: '\u200D',
        lrm: '\u200E',
        rlm: '\u200F',
        ndash: '\u2013',
        mdash: '\u2014',
        lsquo: '\u2018',
        rsquo: '\u2019',
        sbquo: '\u201A',
        ldquo: '\u201C',
        rdquo: '\u201D',
        bdquo: '\u201E',
        dagger: '\u2020',
        Dagger: '\u2021',
        bull: '\u2022',
        hellip: '\u2026',
        permil: '\u2030',
        prime: '\u2032',
        Prime: '\u2033',
        lsaquo: '\u2039',
        rsaquo: '\u203A',
        oline: '\u203E',
        frasl: '\u2044',
        euro: '\u20AC',
        image: '\u2111',
        weierp: '\u2118',
        real: '\u211C',
        trade: '\u2122',
        alefsym: '\u2135',
        larr: '\u2190',
        uarr: '\u2191',
        rarr: '\u2192',
        darr: '\u2193',
        harr: '\u2194',
        crarr: '\u21B5',
        lArr: '\u21D0',
        uArr: '\u21D1',
        rArr: '\u21D2',
        dArr: '\u21D3',
        hArr: '\u21D4',
        forall: '\u2200',
        part: '\u2202',
        exist: '\u2203',
        empty: '\u2205',
        nabla: '\u2207',
        isin: '\u2208',
        notin: '\u2209',
        ni: '\u220B',
        prod: '\u220F',
        sum: '\u2211',
        minus: '\u2212',
        lowast: '\u2217',
        radic: '\u221A',
        prop: '\u221D',
        infin: '\u221E',
        ang: '\u2220',
        and: '\u2227',
        or: '\u2228',
        cap: '\u2229',
        cup: '\u222A',
        int: '\u222B',
        there4: '\u2234',
        sim: '\u223C',
        cong: '\u2245',
        asymp: '\u2248',
        ne: '\u2260',
        equiv: '\u2261',
        le: '\u2264',
        ge: '\u2265',
        sub: '\u2282',
        sup: '\u2283',
        nsub: '\u2284',
        sube: '\u2286',
        supe: '\u2287',
        oplus: '\u2295',
        otimes: '\u2297',
        perp: '\u22A5',
        sdot: '\u22C5',
        lceil: '\u2308',
        rceil: '\u2309',
        lfloor: '\u230A',
        rfloor: '\u230B',
        loz: '\u25CA',
        spades: '\u2660',
        clubs: '\u2663',
        hearts: '\u2665',
        diams: '\u2666',
        lang: '\u27E8',
        rang: '\u27E9'
    };
  
  
  /***/ },
  /* 15 */
  /***/ function(module, exports, __webpack_require__) {
  
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var error_handler_1 = __webpack_require__(10);
    var scanner_1 = __webpack_require__(12);
    var token_1 = __webpack_require__(13);
    var Reader = (function () {
        function Reader() {
            this.values = [];
            this.curly = this.paren = -1;
        }
        // A function following one of those tokens is an expression.
        Reader.prototype.beforeFunctionExpression = function (t) {
            return ['(', '{', '[', 'in', 'typeof', 'instanceof', 'new',
                'return', 'case', 'delete', 'throw', 'void',
                // assignment operators
                '=', '+=', '-=', '*=', '**=', '/=', '%=', '<<=', '>>=', '>>>=',
                '&=', '|=', '^=', ',',
                // binary/unary operators
                '+', '-', '*', '**', '/', '%', '++', '--', '<<', '>>', '>>>', '&',
                '|', '^', '!', '~', '&&', '||', '?', ':', '===', '==', '>=',
                '<=', '<', '>', '!=', '!=='].indexOf(t) >= 0;
        };
        // Determine if forward slash (/) is an operator or part of a regular expression
        // https://github.com/mozilla/sweet.js/wiki/design
        Reader.prototype.isRegexStart = function () {
            var previous = this.values[this.values.length - 1];
            var regex = (previous !== null);
            switch (previous) {
                case 'this':
                case ']':
                    regex = false;
                    break;
                case ')':
                    var keyword = this.values[this.paren - 1];
                    regex = (keyword === 'if' || keyword === 'while' || keyword === 'for' || keyword === 'with');
                    break;
                case '}':
                    // Dividing a function by anything makes little sense,
                    // but we have to check for that.
                    regex = false;
                    if (this.values[this.curly - 3] === 'function') {
                        // Anonymous function, e.g. function(){} /42
                        var check = this.values[this.curly - 4];
                        regex = check ? !this.beforeFunctionExpression(check) : false;
                    }
                    else if (this.values[this.curly - 4] === 'function') {
                        // Named function, e.g. function f(){} /42/
                        var check = this.values[this.curly - 5];
                        regex = check ? !this.beforeFunctionExpression(check) : true;
                    }
                    break;
                default:
                    break;
            }
            return regex;
        };
        Reader.prototype.push = function (token) {
            if (token.type === 7 /* Punctuator */ || token.type === 4 /* Keyword */) {
                if (token.value === '{') {
                    this.curly = this.values.length;
                }
                else if (token.value === '(') {
                    this.paren = this.values.length;
                }
                this.values.push(token.value);
            }
            else {
                this.values.push(null);
            }
        };
        return Reader;
    }());
    var Tokenizer = (function () {
        function Tokenizer(code, config) {
            this.errorHandler = new error_handler_1.ErrorHandler();
            this.errorHandler.tolerant = config ? (typeof config.tolerant === 'boolean' && config.tolerant) : false;
            this.scanner = new scanner_1.Scanner(code, this.errorHandler);
            this.scanner.trackComment = config ? (typeof config.comment === 'boolean' && config.comment) : false;
            this.trackRange = config ? (typeof config.range === 'boolean' && config.range) : false;
            this.trackLoc = config ? (typeof config.loc === 'boolean' && config.loc) : false;
            this.buffer = [];
            this.reader = new Reader();
        }
        Tokenizer.prototype.errors = function () {
            return this.errorHandler.errors;
        };
        Tokenizer.prototype.getNextToken = function () {
            if (this.buffer.length === 0) {
                var comments = this.scanner.scanComments();
                if (this.scanner.trackComment) {
                    for (var i = 0; i < comments.length; ++i) {
                        var e = comments[i];
                        var value = this.scanner.source.slice(e.slice[0], e.slice[1]);
                        var comment = {
                            type: e.multiLine ? 'BlockComment' : 'LineComment',
                            value: value
                        };
                        if (this.trackRange) {
                            comment.range = e.range;
                        }
                        if (this.trackLoc) {
                            comment.loc = e.loc;
                        }
                        this.buffer.push(comment);
                    }
                }
                if (!this.scanner.eof()) {
                    var loc = void 0;
                    if (this.trackLoc) {
                        loc = {
                            start: {
                                line: this.scanner.lineNumber,
                                column: this.scanner.index - this.scanner.lineStart
                            },
                            end: {}
                        };
                    }
                    var startRegex = (this.scanner.source[this.scanner.index] === '/') && this.reader.isRegexStart();
                    var token = startRegex ? this.scanner.scanRegExp() : this.scanner.lex();
                    this.reader.push(token);
                    var entry = {
                        type: token_1.TokenName[token.type],
                        value: this.scanner.source.slice(token.start, token.end)
                    };
                    if (this.trackRange) {
                        entry.range = [token.start, token.end];
                    }
                    if (this.trackLoc) {
                        loc.end = {
                            line: this.scanner.lineNumber,
                            column: this.scanner.index - this.scanner.lineStart
                        };
                        entry.loc = loc;
                    }
                    if (token.type === 9 /* RegularExpression */) {
                        var pattern = token.pattern;
                        var flags = token.flags;
                        entry.regex = { pattern: pattern, flags: flags };
                    }
                    this.buffer.push(entry);
                }
            }
            return this.buffer.shift();
        };
        return Tokenizer;
    }());
    exports.Tokenizer = Tokenizer;
  
  
  /***/ }
  /******/ ])
  });
  ;
  },{}],89:[function(require,module,exports){
  /*
    Copyright (C) 2014 Yusuke Suzuki <utatane.tea@gmail.com>
  
    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:
  
      * Redistributions of source code must retain the above copyright
        notice, this list of conditions and the following disclaimer.
      * Redistributions in binary form must reproduce the above copyright
        notice, this list of conditions and the following disclaimer in the
        documentation and/or other materials provided with the distribution.
  
    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
    AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
    ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
    DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
    (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
    ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
    THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  */
  (function () {
      'use strict';
  
      var estraverse = require('estraverse');
  
      function isNode(node) {
          if (node == null) {
              return false;
          }
          return typeof node === 'object' && typeof node.type === 'string';
      }
  
      function isProperty(nodeType, key) {
          return (nodeType === estraverse.Syntax.ObjectExpression || nodeType === estraverse.Syntax.ObjectPattern) && key === 'properties';
      }
  
      function Visitor(visitor, options) {
          options = options || {};
  
          this.__visitor = visitor ||  this;
          this.__childVisitorKeys = options.childVisitorKeys
              ? Object.assign({}, estraverse.VisitorKeys, options.childVisitorKeys)
              : estraverse.VisitorKeys;
          if (options.fallback === 'iteration') {
              this.__fallback = Object.keys;
          } else if (typeof options.fallback === 'function') {
              this.__fallback = options.fallback;
          }
      }
  
      /* Default method for visiting children.
       * When you need to call default visiting operation inside custom visiting
       * operation, you can use it with `this.visitChildren(node)`.
       */
      Visitor.prototype.visitChildren = function (node) {
          var type, children, i, iz, j, jz, child;
  
          if (node == null) {
              return;
          }
  
          type = node.type || estraverse.Syntax.Property;
  
          children = this.__childVisitorKeys[type];
          if (!children) {
              if (this.__fallback) {
                  children = this.__fallback(node);
              } else {
                  throw new Error('Unknown node type ' + type + '.');
              }
          }
  
          for (i = 0, iz = children.length; i < iz; ++i) {
              child = node[children[i]];
              if (child) {
                  if (Array.isArray(child)) {
                      for (j = 0, jz = child.length; j < jz; ++j) {
                          if (child[j]) {
                              if (isNode(child[j]) || isProperty(type, children[i])) {
                                  this.visit(child[j]);
                              }
                          }
                      }
                  } else if (isNode(child)) {
                      this.visit(child);
                  }
              }
          }
      };
  
      /* Dispatching node. */
      Visitor.prototype.visit = function (node) {
          var type;
  
          if (node == null) {
              return;
          }
  
          type = node.type || estraverse.Syntax.Property;
          if (this.__visitor[type]) {
              this.__visitor[type].call(this, node);
              return;
          }
          this.visitChildren(node);
      };
  
      exports.version = require('./package.json').version;
      exports.Visitor = Visitor;
      exports.visit = function (node, visitor, options) {
          var v = new Visitor(visitor, options);
          v.visit(node);
      };
  }());
  /* vim: set sw=4 ts=4 et tw=80 : */
  
  },{"./package.json":92,"estraverse":90}],90:[function(require,module,exports){
  arguments[4][85][0].apply(exports,arguments)
  },{"./package.json":91,"dup":85}],91:[function(require,module,exports){
  module.exports={
    "_from": "estraverse@^4.1.0",
    "_id": "estraverse@4.3.0",
    "_inBundle": false,
    "_integrity": "sha512-39nnKffWz8xN1BU/2c79n9nB9HDzo0niYUqx6xyqUnyoAnQyyWpOTdZEeiCch8BBu515t4wp9ZmgVfVhn9EBpw==",
    "_location": "/esrecurse/estraverse",
    "_phantomChildren": {},
    "_requested": {
      "type": "range",
      "registry": true,
      "raw": "estraverse@^4.1.0",
      "name": "estraverse",
      "escapedName": "estraverse",
      "rawSpec": "^4.1.0",
      "saveSpec": null,
      "fetchSpec": "^4.1.0"
    },
    "_requiredBy": [
      "/esrecurse"
    ],
    "_resolved": "https://registry.npmjs.org/estraverse/-/estraverse-4.3.0.tgz",
    "_shasum": "398ad3f3c5a24948be7725e83d11a7de28cdbd1d",
    "_spec": "estraverse@^4.1.0",
    "_where": "C:\\Users\\MarcPC\\node_modules\\esrecurse",
    "bugs": {
      "url": "https://github.com/estools/estraverse/issues"
    },
    "bundleDependencies": false,
    "deprecated": false,
    "description": "ECMAScript JS AST traversal functions",
    "devDependencies": {
      "babel-preset-env": "^1.6.1",
      "babel-register": "^6.3.13",
      "chai": "^2.1.1",
      "espree": "^1.11.0",
      "gulp": "^3.8.10",
      "gulp-bump": "^0.2.2",
      "gulp-filter": "^2.0.0",
      "gulp-git": "^1.0.1",
      "gulp-tag-version": "^1.3.0",
      "jshint": "^2.5.6",
      "mocha": "^2.1.0"
    },
    "engines": {
      "node": ">=4.0"
    },
    "homepage": "https://github.com/estools/estraverse",
    "license": "BSD-2-Clause",
    "main": "estraverse.js",
    "maintainers": [
      {
        "name": "Yusuke Suzuki",
        "email": "utatane.tea@gmail.com",
        "url": "http://github.com/Constellation"
      }
    ],
    "name": "estraverse",
    "repository": {
      "type": "git",
      "url": "git+ssh://git@github.com/estools/estraverse.git"
    },
    "scripts": {
      "lint": "jshint estraverse.js",
      "test": "npm run-script lint && npm run-script unit-test",
      "unit-test": "mocha --compilers js:babel-register"
    },
    "version": "4.3.0"
  }
  
  },{}],92:[function(require,module,exports){
  module.exports={
    "_from": "esrecurse@^4.1.0",
    "_id": "esrecurse@4.2.1",
    "_inBundle": false,
    "_integrity": "sha512-64RBB++fIOAXPw3P9cy89qfMlvZEXZkqqJkjqqXIvzP5ezRZjW+lPWjw35UX/3EhUPFYbg5ER4JYgDw4007/DQ==",
    "_location": "/esrecurse",
    "_phantomChildren": {},
    "_requested": {
      "type": "range",
      "registry": true,
      "raw": "esrecurse@^4.1.0",
      "name": "esrecurse",
      "escapedName": "esrecurse",
      "rawSpec": "^4.1.0",
      "saveSpec": null,
      "fetchSpec": "^4.1.0"
    },
    "_requiredBy": [
      "/eslint-scope"
    ],
    "_resolved": "https://registry.npmjs.org/esrecurse/-/esrecurse-4.2.1.tgz",
    "_shasum": "007a3b9fdbc2b3bb87e4879ea19c92fdbd3942cf",
    "_spec": "esrecurse@^4.1.0",
    "_where": "C:\\Users\\MarcPC\\node_modules\\eslint-scope",
    "babel": {
      "presets": [
        "es2015"
      ]
    },
    "bugs": {
      "url": "https://github.com/estools/esrecurse/issues"
    },
    "bundleDependencies": false,
    "dependencies": {
      "estraverse": "^4.1.0"
    },
    "deprecated": false,
    "description": "ECMAScript AST recursive visitor",
    "devDependencies": {
      "babel-cli": "^6.24.1",
      "babel-eslint": "^7.2.3",
      "babel-preset-es2015": "^6.24.1",
      "babel-register": "^6.24.1",
      "chai": "^4.0.2",
      "esprima": "^4.0.0",
      "gulp": "^3.9.0",
      "gulp-bump": "^2.7.0",
      "gulp-eslint": "^4.0.0",
      "gulp-filter": "^5.0.0",
      "gulp-git": "^2.4.1",
      "gulp-mocha": "^4.3.1",
      "gulp-tag-version": "^1.2.1",
      "jsdoc": "^3.3.0-alpha10",
      "minimist": "^1.1.0"
    },
    "engines": {
      "node": ">=4.0"
    },
    "homepage": "https://github.com/estools/esrecurse",
    "license": "BSD-2-Clause",
    "main": "esrecurse.js",
    "maintainers": [
      {
        "name": "Yusuke Suzuki",
        "email": "utatane.tea@gmail.com",
        "url": "https://github.com/Constellation"
      }
    ],
    "name": "esrecurse",
    "repository": {
      "type": "git",
      "url": "git+https://github.com/estools/esrecurse.git"
    },
    "scripts": {
      "lint": "gulp lint",
      "test": "gulp travis",
      "unit-test": "gulp test"
    },
    "version": "4.2.1"
  }
  
  },{}],93:[function(require,module,exports){
  'use strict';
  
  var d        = require('d')
    , callable = require('es5-ext/object/valid-callable')
  
    , apply = Function.prototype.apply, call = Function.prototype.call
    , create = Object.create, defineProperty = Object.defineProperty
    , defineProperties = Object.defineProperties
    , hasOwnProperty = Object.prototype.hasOwnProperty
    , descriptor = { configurable: true, enumerable: false, writable: true }
  
    , on, once, off, emit, methods, descriptors, base;
  
  on = function (type, listener) {
    var data;
  
    callable(listener);
  
    if (!hasOwnProperty.call(this, '__ee__')) {
      data = descriptor.value = create(null);
      defineProperty(this, '__ee__', descriptor);
      descriptor.value = null;
    } else {
      data = this.__ee__;
    }
    if (!data[type]) data[type] = listener;
    else if (typeof data[type] === 'object') data[type].push(listener);
    else data[type] = [data[type], listener];
  
    return this;
  };
  
  once = function (type, listener) {
    var once, self;
  
    callable(listener);
    self = this;
    on.call(this, type, once = function () {
      off.call(self, type, once);
      apply.call(listener, this, arguments);
    });
  
    once.__eeOnceListener__ = listener;
    return this;
  };
  
  off = function (type, listener) {
    var data, listeners, candidate, i;
  
    callable(listener);
  
    if (!hasOwnProperty.call(this, '__ee__')) return this;
    data = this.__ee__;
    if (!data[type]) return this;
    listeners = data[type];
  
    if (typeof listeners === 'object') {
      for (i = 0; (candidate = listeners[i]); ++i) {
        if ((candidate === listener) ||
            (candidate.__eeOnceListener__ === listener)) {
          if (listeners.length === 2) data[type] = listeners[i ? 0 : 1];
          else listeners.splice(i, 1);
        }
      }
    } else {
      if ((listeners === listener) ||
          (listeners.__eeOnceListener__ === listener)) {
        delete data[type];
      }
    }
  
    return this;
  };
  
  emit = function (type) {
    var i, l, listener, listeners, args;
  
    if (!hasOwnProperty.call(this, '__ee__')) return;
    listeners = this.__ee__[type];
    if (!listeners) return;
  
    if (typeof listeners === 'object') {
      l = arguments.length;
      args = new Array(l - 1);
      for (i = 1; i < l; ++i) args[i - 1] = arguments[i];
  
      listeners = listeners.slice();
      for (i = 0; (listener = listeners[i]); ++i) {
        apply.call(listener, this, args);
      }
    } else {
      switch (arguments.length) {
      case 1:
        call.call(listeners, this);
        break;
      case 2:
        call.call(listeners, this, arguments[1]);
        break;
      case 3:
        call.call(listeners, this, arguments[1], arguments[2]);
        break;
      default:
        l = arguments.length;
        args = new Array(l - 1);
        for (i = 1; i < l; ++i) {
          args[i - 1] = arguments[i];
        }
        apply.call(listeners, this, args);
      }
    }
  };
  
  methods = {
    on: on,
    once: once,
    off: off,
    emit: emit
  };
  
  descriptors = {
    on: d(on),
    once: d(once),
    off: d(off),
    emit: d(emit)
  };
  
  base = defineProperties({}, descriptors);
  
  module.exports = exports = function (o) {
    return (o == null) ? create(base) : defineProperties(Object(o), descriptors);
  };
  exports.methods = methods;
  
  },{"d":9,"es5-ext/object/valid-callable":44}],94:[function(require,module,exports){
  var naiveFallback = function () {
    if (typeof self === "object" && self) return self;
    if (typeof window === "object" && window) return window;
    throw new Error("Unable to resolve global `this`");
  };
  
  module.exports = (function () {
    if (this) return this;
  
    // Unexpected strict mode (may happen if e.g. bundled into ESM module)
  
    // Thanks @mathiasbynens -> https://mathiasbynens.be/notes/globalthis
    // In all ES5+ engines global object inherits from Object.prototype
    // (if you approached one that doesn't please report)
    try {
      Object.defineProperty(Object.prototype, "__global__", {
        get: function () { return this; },
        configurable: true
      });
    } catch (error) {
      // Unfortunate case of Object.prototype being sealed (via preventExtensions, seal or freeze)
      return naiveFallback();
    }
    try {
      // Safari case (window.__global__ is resolved with global context, but __global__ does not)
      if (!__global__) return naiveFallback();
      return __global__;
    } finally {
      delete Object.prototype.__global__;
    }
  })();
  
  },{}],95:[function(require,module,exports){
  "use strict";
  
  module.exports = require("./is-implemented")() ? globalThis : require("./implementation");
  
  },{"./implementation":94,"./is-implemented":96}],96:[function(require,module,exports){
  "use strict";
  
  module.exports = function () {
    if (typeof globalThis !== "object") return false;
    if (!globalThis) return false;
    return globalThis.Array === Array;
  };
  
  },{}],97:[function(require,module,exports){
  "use strict";
  
  var isPrototype = require("../prototype/is");
  
  module.exports = function (value) {
    if (typeof value !== "function") return false;
  
    if (!hasOwnProperty.call(value, "length")) return false;
  
    try {
      if (typeof value.length !== "number") return false;
      if (typeof value.call !== "function") return false;
      if (typeof value.apply !== "function") return false;
    } catch (error) {
      return false;
    }
  
    return !isPrototype(value);
  };
  
  },{"../prototype/is":104}],98:[function(require,module,exports){
  "use strict";
  
  var isValue       = require("../value/is")
    , isObject      = require("../object/is")
    , stringCoerce  = require("../string/coerce")
    , toShortString = require("./to-short-string");
  
  var resolveMessage = function (message, value) {
    return message.replace("%v", toShortString(value));
  };
  
  module.exports = function (value, defaultMessage, inputOptions) {
    if (!isObject(inputOptions)) throw new TypeError(resolveMessage(defaultMessage, value));
    if (!isValue(value)) {
      if ("default" in inputOptions) return inputOptions["default"];
      if (inputOptions.isOptional) return null;
    }
    var errorMessage = stringCoerce(inputOptions.errorMessage);
    if (!isValue(errorMessage)) errorMessage = defaultMessage;
    throw new TypeError(resolveMessage(errorMessage, value));
  };
  
  },{"../object/is":101,"../string/coerce":105,"../value/is":107,"./to-short-string":100}],99:[function(require,module,exports){
  "use strict";
  
  module.exports = function (value) {
    try {
      return value.toString();
    } catch (error) {
      try { return String(value); }
      catch (error2) { return null; }
    }
  };
  
  },{}],100:[function(require,module,exports){
  "use strict";
  
  var safeToString = require("./safe-to-string");
  
  var reNewLine = /[\n\r\u2028\u2029]/g;
  
  module.exports = function (value) {
    var string = safeToString(value);
    if (string === null) return "<Non-coercible to string value>";
    // Trim if too long
    if (string.length > 100) string = string.slice(0, 99) + "…";
    // Replace eventual new lines
    string = string.replace(reNewLine, function (char) {
      switch (char) {
        case "\n":
          return "\\n";
        case "\r":
          return "\\r";
        case "\u2028":
          return "\\u2028";
        case "\u2029":
          return "\\u2029";
        /* istanbul ignore next */
        default:
          throw new Error("Unexpected character");
      }
    });
    return string;
  };
  
  },{"./safe-to-string":99}],101:[function(require,module,exports){
  "use strict";
  
  var isValue = require("../value/is");
  
  // prettier-ignore
  var possibleTypes = { "object": true, "function": true, "undefined": true /* document.all */ };
  
  module.exports = function (value) {
    if (!isValue(value)) return false;
    return hasOwnProperty.call(possibleTypes, typeof value);
  };
  
  },{"../value/is":107}],102:[function(require,module,exports){
  "use strict";
  
  var resolveException = require("../lib/resolve-exception")
    , is               = require("./is");
  
  module.exports = function (value/*, options*/) {
    if (is(value)) return value;
    return resolveException(value, "%v is not a plain function", arguments[1]);
  };
  
  },{"../lib/resolve-exception":98,"./is":103}],103:[function(require,module,exports){
  "use strict";
  
  var isFunction = require("../function/is");
  
  var classRe = /^\s*class[\s{/}]/, functionToString = Function.prototype.toString;
  
  module.exports = function (value) {
    if (!isFunction(value)) return false;
    if (classRe.test(functionToString.call(value))) return false;
    return true;
  };
  
  },{"../function/is":97}],104:[function(require,module,exports){
  "use strict";
  
  var isObject = require("../object/is");
  
  module.exports = function (value) {
    if (!isObject(value)) return false;
    try {
      if (!value.constructor) return false;
      return value.constructor.prototype === value;
    } catch (error) {
      return false;
    }
  };
  
  },{"../object/is":101}],105:[function(require,module,exports){
  "use strict";
  
  var isValue  = require("../value/is")
    , isObject = require("../object/is");
  
  var objectToString = Object.prototype.toString;
  
  module.exports = function (value) {
    if (!isValue(value)) return null;
    if (isObject(value)) {
      // Reject Object.prototype.toString coercion
      var valueToString = value.toString;
      if (typeof valueToString !== "function") return null;
      if (valueToString === objectToString) return null;
      // Note: It can be object coming from other realm, still as there's no ES3 and CSP compliant
      // way to resolve its realm's Object.prototype.toString it's left as not addressed edge case
    }
    try {
      return "" + value; // Ensure implicit coercion
    } catch (error) {
      return null;
    }
  };
  
  },{"../object/is":101,"../value/is":107}],106:[function(require,module,exports){
  "use strict";
  
  var resolveException = require("../lib/resolve-exception")
    , is               = require("./is");
  
  module.exports = function (value/*, options*/) {
    if (is(value)) return value;
    return resolveException(value, "Cannot use %v", arguments[1]);
  };
  
  },{"../lib/resolve-exception":98,"./is":107}],107:[function(require,module,exports){
  "use strict";
  
  // ES3 safe
  var _undefined = void 0;
  
  module.exports = function (value) { return value !== _undefined && value !== null; };
  
  },{}]},{},[7]);
  
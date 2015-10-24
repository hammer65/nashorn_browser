
var ObjectArray = Java.type("java.lang.Object[]");
var NetscapeJSObject = Java.type("netscape.javascript.JSObject");
var EventHandler = Java.type("javafx.event.EventHandler");

// Lambda functions for 0, 1, or 2 arguments (no need for external java code.)

var Supplier = Java.type("java.util.function.Supplier");
var UniFunction = Java.type("java.util.function.Function");
var BiFunction = Java.type("java.util.function.BiFunction");

function wrap(jsobject) {
// If not a JSObject type (primitives) then don't wrap.
  if (!(jsobject instanceof NetscapeJSObject)) {
    return jsobject;
  }

// Construct a SAM to call back into Nashorn (event handling)
  function callback(func) {
    if (typeof func == 'function') {
      switch (func.length) {
      case 0:
        return new (Java.extend(Supplier, { get: function() { return func(); } }))();
      case 1:
        return new (Java.extend(UniFunction, { apply: function(arg) { return func(wrap(arg)); } }))();
      case 2:
        return new (Java.extend(BiFunction, { apply: function(arg1, arg2) { return func(wrap(arg1), wrap(arg2)); }}))();
      }
    }
    throw "Callbacks can only have zero, one or two arguments";
  }

  // Potentially wrap arguments for a call.
  function wrapArgs(args) {
    for (var i = 0; i < args.length; i++) {
      var arg = args[i];
      if (arg) {
        if (arg.unwrap) {
          args[i] = arg.unwrap();
        } else if (typeof arg == "function") {
          args[i] = callback(arg);
        }
      }
    }
  }

  return new JSAdapter({
    __get__ : function (key) {
      // special case unwrap to return the jsobject
      if (key == "unwrap") {
        return function() { return jsobject };
      }
      // Handle number indexing
      var value = typeof key == "number" ? jsobject.getSlot(key) : jsobject.getMember(key);

      // Wrap the result
      return wrap(value);
    },
    __has__ : function (key) {
      return jsobject.call("hasOwnProperty", key);
    },
    __put__ : function (key, value) {
      // Wrap functions as callback SAMs
      if (typeof value == "function") {
        value = callback(value);
      }

      // Handle number indexing
      return typeof key == "number" ? jsobject.setSlot(key, value) : jsobject.setMember(key, value);
    },
    __call__ : function (name) {
      // Special case unwrap to return the jsobject
      if (name == "unwrap") {
        return jsobject;
      }

      var args = Array.prototype.slice.call(arguments);
      args.shift();
      args = Java.to(args, ObjectArray);
      wrapArgs(args);

      return jsobject.call(name, args);
    },
    __new__ : function () {
      return wrap(jsobject.eval("new this()"));
    },
    __delete__ : function (key) {
      jsobject.removeMember(key);
      return true;
    },
    __getIds__ : function () {
      // Convert the Node collection to a JS array
      var keys = jsobject.eval("Object.keys(this)");
      var length = keys.getMember("length");
      var ids = [];
      for (var i = 0; i < length; i++) {
        ids.push(keys.getSlot(i));
      }
      return ids;
    }
  });
}

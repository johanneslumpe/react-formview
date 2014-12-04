'use strict';

/**
* Replaces enumerated tokens in a message string with passed in arguments.
* Takes the message as first parameter an will replace tokens in the
* form of `$num` with provided arguments
* @return {String}
*/
var replaceMessage = function () {
  var msg = arguments[0];
  for (var i = 1, j = arguments.length; i < j; i++) {
    msg = msg.replace('$' + (i-1), encodeURIComponent(arguments[i]));
  }

  return msg;
};

module.exports = replaceMessage;

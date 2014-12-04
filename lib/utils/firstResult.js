'use strict';

/**
* Calls the callback for each element in the array and return the first
* returned result
* @param {Array}   arr      The array to process
* @param {Function} callback The callback
* @return {Mixed}
*/
var firstResult = function (arr, callback) {
  var result;
  for (var i = 0, j = arr.length; i < j; i++) {
    result = callback(arr[i]);
    if (result) {
      return result;
    }
  }
};

module.exports = firstResult;

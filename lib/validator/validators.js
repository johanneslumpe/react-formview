'use strict';

var moment = require('moment');

module.exports = {

  /**
  * Validates that a date comes after another date field's value
  * @param  {String} value     The date string to verify
  * @param  {String} fieldName The field to compare to
  * @return {Boolean}
  */
  after: function (value, fieldName) {
    var otherValue = this[fieldName];

    // without a source date there is nothing to check for
    if (!otherValue) {
      return true;
    }
    return moment(new Date(value)) > moment(new Date(otherValue));
  },

  /**
  * Validates that the value is between two values (exclusive)
  * @param  {Mixed} value   The value
  * @param  {Array} between The between array
  * @return {Boolean}
  */
  between: function(value, between) {
    return value && value > between[0] && value < between[1];
  },

  /**
  * Validates that two values are equal
  * @param  {Mixed} value      The value
  * @param  {Mixed} otherValue The other value
  * @return {Boolean}
  */
  equals: function(value, otherValue) {
    return value && value === otherValue;
  },

  /**
  * Validates that the value's file type is allowed
  * @param {File} value The file object
  * @param {String|Array} types The allowed types
  * @return {Boolean}
  */
  fileType: function (value, types) {
    types = Array.isArray(types) ? types : [types];
    return value && types.indexOf(value.type) !== -1;
  },

  /**
  * Tests the value against a regex
  * @param {Mixed} value  The value to test
  * @param {Regex} format The regex to test with
  */
  format: function (value, format) {
    return format.test(value);
  },

  /**
  * Verifies that the value is greater than the minimum
  * @param {Mixed} value The value to check
  * @param {Boolean} min The value to compare to
  */
  greaterThan: function(value, min) {
    return value && value > min;
  },

  /**
  * Verifies that the value is greater than or equal to the minimum
  * @param {Mixed} value The value to check
  * @param {Boolean} min The value to compare to
  */
  greaterThanEqual: function(value, min) {
    return value && value >= min;
  },

  /**
  * Checks a string for its length
  * @param  {String} value     The value to check
  * @param  {Number} predicate The length
  * @return {Boolean}
  */
  length: function (value, length) {
    return value && value.length === length;
  },

  /**
  * Verifies that the value is less than the maximum
  * @param {Mixed} value The value to check
  * @param {Boolean} max The value to compare to
  */
  lessThan: function(value, max) {
    return value && value < max;
  },

  /**
  * Verifies that the value is less than or equal to the maximum
  * @param {Mixed} value The value to check
  * @param {Boolean} max The value to compare to
  */
  lessThanEqual: function(value, max) {
    return value && value <= max;
  },

  /**
  * Checks whether the value matches the value of another field
  * @param  {Mixed} value      The value to check
  * @param  {String} fieldName The name of the other field
  * @return {Boolean}
  */
  matches: function (value, fieldName) {
    return value === this[fieldName];
  },

  /**
  * Validates a file's max size
  * @param {Number} value The filesize
  * @param {Number} max   The maximum size
  */
  maxSize: function (value, max) {
    return value && value.size / 1024 <= max;
  },

  /**
  * Validates that the value is between two values (inclusive)
  * @param  {Mixed} value The value
  * @param  {Array} range The range array
  * @return {Boolean}
  */
  range: function (value, range) {
    return value && value >= range[0] && value <= range[1];
  },

  /**
  * Checks whether a value is empty
  * @param  {Mixed} value The value to check
  * @return {Boolean}
  */
  required: function(value) {
    return !!value;
  },

  /**
  * Conditional validator, which only marks a field as required, if
  * anotherfield contains no value
  * @param {Mixed} value         The value to check
  * @param {String} fieldToCheck The field whose value is used as a constraint
  * @return {Boolean}
  */
  requiredIfEmpty: function (value, fieldToCheck) {
    return !!this[fieldToCheck] || !!value;
  },

  /**
  * Conditional validator, which only marks a field as required, if
  * anotherfield contains a value
  * @param {Mixed} value         The value to check
  * @param {String} fieldToCheck The field whose value is used as a constraint
  * @return {Boolean}
  */
  requiredIfNotEmpty: function (value, fieldToCheck) {
    return !this[fieldToCheck] || !!value;
  },

  /**
  * Validates that a string is a valid date representation
  * @param {String} value The date string to validate
  * @return {Boolean}
  */
  validDate: function(value) {
    return moment(new Date(value)).toISOString() !== 'Invalid date';
  }

};

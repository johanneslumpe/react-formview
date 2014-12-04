'use strict';

var isNull      = require('lodash-node/modern/objects/isNull');
var isUndefined = require('lodash-node/modern/objects/isUndefined');
var moment      = require('moment');

/**
* A wrapper around a field's attributes/options like value,
* label, editable etc.
* This gets called by the form instance and usually does not
* have to be instantiated directly by the user.
* @param {String} name         The field's name
* @param {Object} opts         Options
* @param {Function} onChange   The onChange handler of the parent form
* @param {Mixed} initialValue  The field's initial value
*/
var Field = function (name, opts, onChange, initialValue) {
  this._value = !isUndefined(initialValue) && !isNull(initialValue) ?
                 initialValue :
                 void 0;

  this._name = name;
  this._label = opts.label;
  this._editable = opts.editable;
  this._onChange = onChange;
  this._dirty = false;
  this._serialize = opts.serialize;
};

/**
* Formats a string as a default date string
* @param {String} dateString The date string to format
*/
var castDate = function (dateString) {
  // without a value we cannot create a date
  if (!dateString) {
    return;
  }
  // moment deprecated this, so we have to manually use new Date and pass
  // the parsed instance to moment
  return moment(new Date(dateString)).format('YYYY-MM-DD hh:mm');
};

/**
* Value transform functions called during serialization
* @type {Object}
*/
Field.Serialize = {

  /**
  * Return the iso date string representation of the passed in value
  * @param {String} value The date string to convert
  * @return {String}      The iso date string representation
  */
  ISODate: function (value) {
    return moment(value).toISOString();
  }

};

/**
* Field types used to describe the desired value of a field.
* Values will be cast to their target type using thse functions
* @type {Object}
*/
Field.Types = {

  // TODO figure out how to make casting better and more useful

  /**
  * String
  * @type {Function}
  */
  String: String,

  /**
  * Number, used for decimals
  * @type {Function}
  */
  Number: Number,

  /**
  * Boolean
  * @type {Function}
  */
  Boolean: Boolean,

  /**
  * Date
  * Casts a string into a generic date format (YYYY-MM-HH hh:mm),
  * but does not return a real date object, so technically it's not
  * real casting
  * @type {Function}
  */
  Date: castDate,

  /**
  * File
  * @type {Function}
  */
  File: File,

  /**
  * Integer
  * @param {Mixed} value The value to cast
  */
  Integer: function (value) {
    var val = Math.round(Number(value));
    return isNaN(val) ? 0 : val;
  },

  /**
  * Determines whether a type is castable
  * @param {Function} Type The type
  * @return {Boolean}
  */
  _isCastable: function(Type) {
    return Type !== Field.Types.File;
  }

};

/**
* Updates the field's value, valid status and errors.
* Gets called by the owning form instance.
* @param {Object} newValue The new value object
*/
Field.prototype.updateValue = function (newValue) {
  this._value = newValue.value;
  this._valid = newValue.valid;
  this._errors = newValue.errors;
  this._dirty = true;
};

/**
* Returns whether a field has a label
* @return {Boolean}
*/
Field.prototype.hasLabel = function () {
  return !!this._label;
};

/**
* Return the label
* @return {String}
*/
Field.prototype.getLabel = function () {
  return this._label;
};

/**
* Whether the field is valid
* @return {Boolean}
*/
Field.prototype.isValid = function () {
  return this._valid;
};

/**
* Returns the errors for this field
* @return {Object}
*/
Field.prototype.getErrors = function () {
  return this._errors;
};

/**
* Returns the field's value
* @return {Mixed} The value
*/
Field.prototype.value = function () {
  return this._value;
};

/**
* Serializes the field's value. Optionally passes the value
* through a serialize function if provided in the schema
* @return {Mixed} The serialized value
*/
Field.prototype.serialize = function () {
  return this._serialize && this._value ?
         this._serialize(this._value) :
         this._value;
};

/**
* Mark the field as dirty
* @return {void}
*/
Field.prototype.markDirty = function () {
  this._dirty = true;
};

/**
* Returns whether the field is dirty
* @return {Boolean}
*/
Field.prototype.isDirty = function () {
  return this._dirty;
};

/**
* Notify the parent form that this field changed
* @param  {Mixed} newValue The new value
* @return {void}
*/
Field.prototype.change = function (newValue) {
  this._onChange(this._name, newValue, this._value);
};

/**
* Returns whether the field is editable
* @return {Boolean}
*/
Field.prototype.isEditable = function () {
  return this._editable;
};

/**
* Returns the field's name
* @return {String}
*/
Field.prototype.getName = function () {
  return this._name;
};

module.exports = Field;

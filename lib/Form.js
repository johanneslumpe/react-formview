'use strict';

var keys        = require('lodash-node/modern/objects/keys');
var clone       = require('lodash-node/modern/objects/clone');
var without     = require('lodash-node/modern/arrays/without');
var map         = require('lodash-node/modern/collections/map');
var forEach     = require('lodash-node/modern/collections/forEach');
var filter      = require('lodash-node/modern/collections/filter');
var every       = require('lodash-node/modern/collections/every');
var reduce      = require('lodash-node/modern/collections/reduce');
var Field       = require('./Field');
var Validator   = require('./Validator');

/**
* Constructor for a form
* @param {Object} schema The schema to use
*/
var Form = function (schema, onChangeHandler, initialValues) {
  initialValues = initialValues ? clone(initialValues) : {};
  var fieldNames = keys(schema);
  var self = this;

  var onChange = function () {
    self.onFieldChange.apply(self, arguments);
  };

  this._onChange = onChangeHandler;
  this._validator = Validator.create(schema, this);

  this._fields = reduce(fieldNames, function (carry, fieldName) {
    carry[fieldName] = new Field(
      fieldName, schema[fieldName], onChange, initialValues[fieldName]
    );
    return carry;
  }, {});
};

/**
* Convenience method to createa a form instance
* @param  {Object} schema        The schema
* @param  {Function} onChange    The onChange handler
* @param  {Object} initialValues initial values for the fields
* @return {Object}               The form instance
*/
Form.create = function (schema, onChange, initialValues) {
  return new Form(schema, onChange, initialValues);
};

/**
* Returns a field by name
* @param {String} fieldName The field to return
*/
Form.prototype._getField = function (fieldName) {
  return this._fields[fieldName];
};

/**
* Validates a field and then updates the field's state with
* value, valid and errors
* @param {String} fieldName The fieldname
* @param {Mixed} newValue   The value to validate
*/
Form.prototype._validateAndUpdateField = function (fieldName, newValue) {
  var validationResult = this._validator.validate(
    fieldName, newValue, this._getStateSnapshot()
  );
  this._getField(fieldName).updateValue({
    value: validationResult.value,
    valid: validationResult.valid,
    errors: validationResult.errors
  });
};

/**
* Returns an object with the current state for all fields
* @return {Object}
*/
Form.prototype._getStateSnapshot = function () {
  var fields = this._fields;
  return reduce(keys(fields), function (carry, fieldName) {
    carry[fieldName] = fields[fieldName].value();
    return carry;
  }, {});
};

/**
* Handler which gets called by a field, when
* its value has changed
* @param {String} fieldName The fieldname that changed
* @param {Mixed} newValue  The new value
* @param {Mixed} oldValue  The old value
*/
Form.prototype.onFieldChange = function (fieldName, newValue, oldValue) {
if (newValue !== oldValue) {
  this._validateAndUpdateField(fieldName, newValue);

  forEach(
    map(this._validator.getRemoteConstraints(fieldName), function (field) {
      return this._getField(field);
    }, this), function (field) {
      if (!field.isEditable()) {
        return;
      }
      this._validateAndUpdateField(field.getName(), field.value());
    }, this);

    this._onChange && this._onChange(this);
  }
};

/**
* Validates all editable fields of the form
* @param  {String} fieldToSkip A field to skip
* @return {void}
*/
Form.prototype.validateFields = function (fieldToSkip, force) {
  var fields = this._fields;
  forEach(without(keys(fields), fieldToSkip), function (fieldName) {
    var field = fields[fieldName];
    if (!field.isEditable() || (!field.isDirty() && !force)) {
      return;
    }
    this._validateAndUpdateField(fieldName, field.value());
  }, this);
};

/**
* Returns all editable fields
* @return {Array}
*/
Form.prototype.getEditableFields = function () {
  return filter(this._fields, function (field) {
    return field.isEditable();
  });
};

/**
* Returns an object with fieldName:value pairs for all editable fields
* @return {Object}
*/
Form.prototype.serialize = function () {
  return reduce(this.getEditableFields(), function (carry, field) {
    carry[field.getName()] = field.serialize();
    return carry;
  }, {});
};

/**
* Updates the values of the form fields
* @param  {Object} valueMap An object with fieldName:value pairs
* @return {void}
*/
Form.prototype.deserialize = function (valueMap) {
  forEach(valueMap, function (value, key) {
    this._validateAndUpdateField(key, value);
  }, this);
};

/**
* Checks whether the form is valid
* @return {Boolean}
*/
Form.prototype.isValid = function () {
  this.validateFields(null, true);
  return every(this.getEditableFields(), function (field) {
    return field.isValid();
  });
};

/**
* Returns all invalid fields
* @return {Array}
*/
Form.prototype.getInvalidFields = function () {
  return filter(this.getEditableFields(), function (field) {
    return !field.isValid();
  });
};

module.exports = Form;

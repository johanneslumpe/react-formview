'use strict';

var cloneDeep     = require('lodash-node/modern/objects/cloneDeep');
var keys          = require('lodash-node/modern/objects/keys');
var isEmpty       = require('lodash-node/modern/objects/isEmpty');
var intersection  = require('lodash-node/modern/arrays/intersection');
var forEach       = require('lodash-node/modern/collections/forEach');
var reduce        = require('lodash-node/modern/collections/reduce');
var map           = require('lodash-node/modern/collections/map');
var filter        = require('lodash-node/modern/collections/filter');

var replaceMessage = require('./utils/replaceMessage');
var firstResult    = require('./utils/firstResult');

var Field = require('./Field');

/**
* Constructor for a Validator
* @param {Object} schema The form schema
* @param {Object} form   The form instance
*/
var Validator =  function (schema, form) {
  this._schema = cloneDeep(schema);
  // this._localCrossConstraints = this._makeCrossConstraintsMap(this._schema);
  this._remoteCrossConstraints = this._makeCrossConstraintsMap(this._schema, true);
  this._requiredValidations = this._getValidations(this._schema, true);
  this._validations = this._getValidations(this._schema);
  this._formInstance = form;
};

/**
* Convenience wrapper for creating a form validator
* @param  {Object} schema The form schema
* @param  {Object} form   The form instance
* @return {Object}        The form validator instance
*/
Validator.create = function (schema, form) {
  return new Validator(schema, form);
};

/**
 * These are constraints which are validated using another field.
 * This map is used to detect whether another field should be re-validted
 * if a field changes
 * @type {Array}
 */
Validator._crossConstraints = [
  'matches',
  'after',
  'requiredIfEmpty',
  'requiredIfNotEmpty'
];

/**
 * RegExp to extract required validations
 * @type {RegExp}
 */
Validator._requiredRegexp = /^required/;

/**
* Validation messages for the validators
* @type {Object}
*/
Validator.Messages = require('./validator/messages');

/**
* The validators are called with this bound to the latest form state,
* in order to make cross-field constraints and lookups easy
* @type {Object}
*/
Validator.Validators = require('./validator/validators');

/**
* Returns the fields affected by cross constraints for this field
* @param {String} fieldName The field
* @return {Array}
*/
Validator.prototype.getLocalConstraints = function (fieldName) {
  return this._localCrossConstraints[fieldName] || [];
};

/**
* Returns the fields which have a constrained on `fieldName`
* @param {String} fieldName The feld
* @return {Array}
*/
Validator.prototype.getRemoteConstraints = function (fieldName) {
  return this._remoteCrossConstraints[fieldName] || [];
};

/**
* Generates a map of cross constraints for a given schema
* @param {Object} schema The schema
* @return {Object}
*/
Validator.prototype._makeCrossConstraintsMap = function (schema, remote) {
  var crossConstraints = Validator._crossConstraints;
  var fieldNames = keys(schema);

  return reduce(fieldNames, function (carry, field) {
    var validation = schema[field].validation;
    if (validation) {
      var cross = intersection(crossConstraints, keys(validation));
      if (cross.length) {
        // if there are any cross field constraints, get the constraints
        // and add them to the target field, so that whenver the target
        // field changed, the constrained source field is also checked
        forEach(map(cross, function (constraint) {
          return validation[constraint];
        }), function (fieldName) {
          var name = remote ? fieldName : field;
          var value = remote ? field : fieldName;
          var arr = carry[name];

          if (!arr) {
            carry[name] = [value];
          } else if (arr.indexOf(value) === -1) {
            arr.push(value);
          }
        });
      }
    }
    return carry;
  }, {});
};

/**
* Returns an object of require validations per field
* @param {Object} schema The schema
* @return {Object}
*/
Validator.prototype._getValidations = function (schema, getRequired) {
  var requiredRegexp = Validator._requiredRegexp;
  var fieldNames = keys(schema);

  return reduce(fieldNames, function (carry, field) {
    var validation = schema[field].validation;
    if (validation) {
      var result = filter(keys(validation), function (field) {
        var res = requiredRegexp.test(field);
        return getRequired ? res : !res;
      });

      if (result.length) {
        carry[field] = result;
      }
    }
    return carry;
  }, {});
};

/**
* Runner for validations
* @param {String} fieldName The field to validate
* @param {Array} validatorKeys  The validations to perform
* @param {Mixed} value      The value to validate
* @param {Object} conf      The field configuration
* @param {Object} formState The form state
* @return {Object}          An object containing all the errors
*/
Validator.prototype._performValidation = function (fieldName, validatorKeys, value, conf, formState) {
  var validators  = Validator.Validators;
  var validator   = this;
  var validations = conf.validation;

  return reduce(validatorKeys, function (carry, validation) {
    if (!validation || validation === 'required') {
      return carry;
    }

    var validationParams = validations[validation];
    var valid = validators[validation].call(
      formState, value, validationParams
    );

    if (!valid) {
      validator._addValidationMessage(carry, {
        validation: validation,
        conf: conf,
        field: fieldName,
        params: validationParams
      });
    }

    return carry;
  }, {});
};

/**
 * Adds a message to the passed in object
 * @param {Object} obj   The object to which the message should be added
 * @param {Object} args  Params
 */
Validator.prototype._addValidationMessage = function (obj, args) {
    var conf = args.conf;
    var msg  = (conf.messages && conf.messages[args.validation]) ||
               Validator.Messages[args.validation];

    msg = replaceMessage.apply(null, [msg, args.field].concat(args.params));
    obj[args.validation] = msg;
};

Validator.prototype._validateRequired = function (fieldName, value, conf, formState) {
  var validators  = Validator.Validators;
  var validator   = this;
  var validations = conf.validation;

  return firstResult(this._requiredValidations[fieldName], function (validation) {
    var validationParams = validations[validation];
    var valid = validators[validation].call(
      formState, value, validationParams
    );

    if (!valid) {
      var result = {};
      validator._addValidationMessage(result, {
        validation: validation,
        conf: conf,
        field: fieldName,
        params: validationParams
      });
      return result;
    }
  });
};

/**
* Validates a field
* @param  {String} fieldName The name of the field to validate
* @param  {Mixed} value      The value to validate
* @param  {Object} formState The current state of the form
* @return {Object}           A result with valid, errors and value props
*/
Validator.prototype.validate = function (fieldName, value, formState) {
  var conf  = this._schema[fieldName];
  // checking before casting ensures that we
  // are dealing with booleans or strings
  var empty = value === false || isEmpty(value);
  var type  = conf.type;
  var castable    = Field.Types._isCastable(type);
  var hasValidations = this._requiredValidations[fieldName] ||
                       this._validations[fieldName];
  var result;

  // first we convert the field to the desired type
  // TODO add a proper conversion here, dealing with issues like the fact
  // that a field which has a Integer/Number type set should not become
  // an empty string if there is no value, but rather undefined or null

  // Just using the value when its empty only works for strings and booleans,
  // but not for number castings
  var castValue = empty || !castable ? value : type(value);

  // no validations? ok whatever, valid.
  if (!hasValidations) {
    return {
      value: castValue,
      valid: true
    };
  }

  // first check all the valiations related to required fields
  if (castValue === false || castValue === '' || castValue == null) {

    // might be required
    if (this._requiredValidations[fieldName]) {
      result = this._validateRequired(fieldName, castValue, conf, formState);
      if (result) {
        return {
          value: castValue,
          valid: false,
          errors: result
        };
      }
    }

    return {
      value: castValue,
      valid: true
    };
  }

  // check other validations
  result = this._performValidation(
    fieldName, this._validations[fieldName], castValue, conf, formState
  );

  return {
    value: castValue,
    valid: !keys(result).length,
    errors: result
  };
};

module.exports = Validator;

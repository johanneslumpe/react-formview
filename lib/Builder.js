'use strict';
var React = require('react/addons');
var Field = require('./Field');
var Input = React.createFactory(require('./components/form/Input'));

var Builder = {

  /**
   * Renders all editable fields of a form
   * @param {Object} form     The form instance
   * @param {Object} schema   The schema
   * @param {Function} onSubmit The onSubmit handler
   */
  renderForm: function (form, schema, onSubmit) {
    var fields = form._getEditableFields();
    var Types = Field.Types;
    var children = fields.map(function (field) {
      var name = field.getName();
      var type = schema[name].type;
      var fieldType;

      if (schema[name].component) {
        return schema[name].component({
          field: field,
          name: name,
          key: name
        });
      }

      switch (type) {
        case Types.String:
        case Types.Integer:
        case Types.Date:
          fieldType = 'text';
        break;
        case Types.Boolean:
          fieldType = 'checkbox';
        break;
        case Types.File:
          fieldType = 'file';
        break;
      }

      return Input({
        type: fieldType,
        field: field,
        name: name,
        key: name
      });
    });

    // TODO allow custom button text and custom button component
    children.push(React.DOM.button({
      type: 'submit',
      key: 'submit',
    }, 'Submit'));

    return React.DOM.form({onSubmit:onSubmit}, children);
  }

};



module.exports = Builder;

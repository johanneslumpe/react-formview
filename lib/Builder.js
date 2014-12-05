'use strict';
var React = require('react/addons');
var Field = require('./Field');
var Input = React.createFactory(require('./components/form/Input'));
var TextView = React.createFactory(require('./components/view/Text'));
var map = require('lodash-node/modern/collections/map');

var Builder = {

  /**
  * Renders a view of all fields in a form-view
  * @param {Object} form     The form instance
  * @param {Object} schema   The schema
  */
  renderView: function(form, schema) {
    var fields = form.getFields();
    var children = map(fields, function (field) {
      var name = field.getName();
      var fieldType;

      if (schema[name].viewComponent) {
        return schema[name].viewComponent({
          field: field,
          name: name,
          key: name
        });
      }

      // currently we only support a basic text view.
      // Custom views can be handled by using a custom component.
      // In the future more ready views, i.e. ImageView should be
      // available
      return TextView({
        type: fieldType,
        field: field,
        name: name,
        key: name
      });
    });

    return React.DOM.div({
      className: 'react-formview__view-wrapper'
    }, children);
  },

  /**
   * Renders all editable fields of a form
   * @param {Object} form     The form instance
   * @param {Object} schema   The schema
   * @param {Function} onSubmit The onSubmit handler
   */
  renderForm: function (form, schema, onSubmit) {
    var fields = form.getEditableFields();
    var Types = Field.Types;
    var children = map(fields, function (field) {
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

    return React.DOM.form({
      className: 'react-formview__form',
      onSubmit:onSubmit
    }, children);
  }

};



module.exports = Builder;

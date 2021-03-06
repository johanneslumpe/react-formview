'use strict';

var React  = require('react/addons');
var Errors = React.createFactory(require('./Errors'));

var Input = React.createClass({

  getType: function() {
    return {
      checkbox: this.props.type === 'checkbox',
      file: this.props.type === 'file'
    };
  },

  onChange: function (e) {
    var value;
    var type = this.getType();
    if (type.checkbox) {
      value = e.target.checked;
    } else if (type.file) {
      value = e.target.files[0];
    } else {
      value = e.target.value;
    }

    this.props.field.change(value);
  },

  render: function() {
    var cx = React.addons.classSet;
    var field = this.props.field;
    var fieldValid = field.isValid();
    var errors;
    var name = this.props.name;
    var classNames = cx({
      'react-formview__field': true,
      'react-formview__field--invalid': !fieldValid && field.isDirty()
    });

    if (!fieldValid) {
      var fieldErrors = field.getErrors();
      errors = fieldErrors ?
               Errors({
                 key: name + '-errors',
                 errors:fieldErrors
               }) :
               null;
    }

    var label = field.hasLabel() ?
                React.DOM.label({
                  key: name + '-label',
                  className: 'react-formview__label',
                  htmlFor: name,
                }, field.getLabel()) :
                null;

    var props = {
      className: classNames,
      key: name,
      type: this.props.type,
      name: name,
      id: name,
      onChange: this.onChange,
    };

    var type = this.getType();
    if (!type.file) {
      if (type.checkbox) {
        props.checked = field.value();
      } else {
        props.value = field.value();
      }
    }

    return React.DOM.div({
      className: 'react-formview__field-wrapper',
    }, [label, React.DOM.input(props), errors]);
  }
});

module.exports = Input;

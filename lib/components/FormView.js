'use strict';
var React   = require('react/addons');
var Builder = require('../Builder');
var Form    = require('../Form');
var isEqual = require('lodash-node/modern/objects/isEqual');

var FormView = React.createClass({

  getInitialState: function() {
    var form = Form.create(
      this.props.schema, this.onChange, this.props.initialValues
    );

    return {
      form: form
    };
  },

  onChange: function () {
    this.setState({
      form: this.state.form
    });
  },

  onSubmit: function(e) {
    e.preventDefault();
    var form = this.state.form;

    if (form.isValid()) {
      this.props.onValidSubmit && this.props.onValidSubmit(form.serialize());
    } else {
      this.setState({
        form: form
      });
    }
  },

  componentWillReceiveProps: function(nextProps) {
    var initial = nextProps.initialValues;
    if (initial && !isEqual(initial, this.props.initialValues)) {
      this.state.form.deserialize(initial);
    }
  },

  render: function() {
    var form = this.state.form;
    return !this.props.edit ?
           Builder.renderView(form, this.props.schema) :
           Builder.renderForm(form, this.props.schema, this.onSubmit);
  }

});

module.exports = FormView;

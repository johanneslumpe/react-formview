'use strict';

var React = require('react/addons');
var keys  = require('lodash-node/modern/objects/keys');

var Errors = React.createClass({

  render: function() {
    var errors = this.props.errors;
    var messages = keys(errors).map(function (key) {
      return React.DOM.p({key: key}, errors[key]);
    });

    return React.DOM.div({
      className: 'react-formview__errors'
    }, messages);
  }

});

module.exports = Errors;

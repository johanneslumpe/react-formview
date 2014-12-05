'use strict';

var React  = require('react/addons');

var Text = React.createClass({
  
  render: function() {
    var cx = React.addons.classSet;
    var field = this.props.field;
    var name = this.props.name;

    var label = field.hasLabel() ?
                React.DOM.span({
                  key: name + '-label-view',
                  className: 'react-formview__label-view',
                }, field.getLabel()) :
                null;

    var props = {
      className: cx({
        'react-formview__view-text': true
      }),
      key: name,
      name: name,
      id: name,
    };

    var viewClass = 'react-formview__view-wrapper-' + name;
    var wrapperClasses = {
      'react-formview__view-wrapper': true
    };
    wrapperClasses[viewClass] = true;

    return React.DOM.div({
      className: cx(wrapperClasses),
    }, [label, React.DOM.span(props, field.displayValue())]);
  }
});

module.exports = Text;

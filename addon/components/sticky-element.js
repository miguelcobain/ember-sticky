import Ember from 'ember';
import layout from '../templates/components/sticky-element';
const { Component, isNone } = Ember;
/* global Waypoint */

export default Component.extend({
  layout,

  stickyOptions: ['direction', 'stuckClass'],

  didInsertElement() {
    this._super(...arguments);
    this._sticky = new Waypoint.Sticky(this.buildOptions());
  },

  buildOptions() {
    let options = this.getProperties(this.stickyOptions);

    Object.keys(options).forEach((key) => {
      if (isNone(options[key])) {
        delete options[key];
      }
    });

    options.context = this.element.parentNode;
    options.element = this.element.querySelector('.sticky-container');
    options.handler = (direction) => {
      console.log('handler', direction);
    };

    return options;
  },

  willDestroyElement() {
    this._super(...arguments);
    this._sticky.destroy();
  }
});
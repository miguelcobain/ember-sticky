import Ember from 'ember';
import layout from '../templates/components/sticky-element';
import getScrollbarWidth from '../utils/scrollbar-width';
const { Component, computed, isNone, run, $ } = Ember;
/* global Waypoint */

const SCROLLBAR_WIDTH = getScrollbarWidth();

export default Component.extend({
  layout,

  enabled: true,
  stickyOptions: ['direction', 'stuckClass', 'offset'],

  didInsertElement() {
    this._super(...arguments);

    if (typeof document === 'undefined') {
      return;
    }

    if (this.get('enabled')) {
      this.initWaypoints();
    }
  },

  didUpdateAttrs() {
    this._super(...arguments);

    if (this.get('enabled')) {
      this.initWaypoints();
    } else {
      this.destroyWaypoints();
    }
  },

  initWaypoints() {
    this._sticky = new Waypoint.Sticky(this.get('waypointsOptions'));
  },

  waypointsOptions: computed(function() {
    let options = this.getProperties(this.stickyOptions);

    Object.keys(options).forEach((key) => {
      if (isNone(options[key])) {
        delete options[key];
      }
    });

    options.context = this.element.parentNode;
    options.element = this.element.querySelector('.sticky-container');
    options.handler = run.bind(this, this.waypointsHandler);

    return options;
  }),

  waypointsHandler(direction) {
    let isSticky = direction === 'down';
    this.set('isSticky', isSticky);
    this.setContainerWidth(isSticky);
  },

  setContainerWidth(isSticky) {
    let { element, context } = this.get('waypointsOptions');
    element.style.width = isSticky ? `${$(context).width() - SCROLLBAR_WIDTH}px` : '';
  },

  willDestroyElement() {
    this._super(...arguments);
    this.destroyWaypoints();
  },

  destroyWaypoints() {
    if (this._sticky) {
      this._sticky.destroy();
    }
  }
});
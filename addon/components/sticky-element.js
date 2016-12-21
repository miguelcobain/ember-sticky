import Ember from 'ember';
import layout from '../templates/components/sticky-element';
import getScrollbarWidth from '../utils/scrollbar-width';
const { Component, computed, isNone, run, $ } = Ember;
/* global Waypoint */

const SCROLLBAR_WIDTH = getScrollbarWidth();

export default Component.extend({
  layout,

  enabled: true,
  refreshOnMutations: true,
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

  didUpdateAttrs({ offset }) {
    this._super(...arguments);

    if (this.get('enabled')) {
      this.initWaypoints();
    } else {
      this.destroyWaypoints();
    }

    if (offset) {
      this.destroyWaypoints();
      this.initWaypoints();
    }
  },

  initWaypoints() {
    this._sticky = new Waypoint.Sticky(this.get('waypointsOptions'));

    if (this.get('refreshOnMutations')) {
      let mutObserver = new MutationObserver(this.didMutate.bind(this));
      mutObserver.observe(this.element, {
        subtree: true,
        childList: true
      });
      this._mutObserver = mutObserver;
    }
  },

  didMutate() {
    Waypoint.refreshAll();
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
    this.setElementOffset(isSticky);
    this.setContainerWidth(isSticky);
  },

  setElementOffset(isSticky) {
    let { element } = this.get('waypointsOptions');
    let offset = this.get('offset');
    element.style.top = isSticky && offset ? `${offset}px` : '';
  },

  setContainerWidth(isSticky) {
    let { element, context } = this.get('waypointsOptions');
    let canScroll = context.scrollHeight > context.clientHeight;
    let newWidth = canScroll ? $(context).width() - SCROLLBAR_WIDTH : $(context).width();
    element.style.width = isSticky ? `${newWidth}px` : '';
  },

  willDestroyElement() {
    this._super(...arguments);
    this.destroyWaypoints();
  },

  destroyWaypoints() {
    if (this._mutObserver) {
      this._mutObserver.disconnect();
    }
    this.waypointsHandler('up');
    if (this._sticky) {
      this._sticky.destroy();
    }
  }
});
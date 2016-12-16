import Ember from 'ember';
import isInViewport from 'ember-sticky/utils/is-in-viewport';

import { Container, addScrollHandler, removeScrollHandler } from 'ember-sticky/scroll-listener/scroll-listener';

const { Mixin, guidFor, $ } = Ember;

export default Mixin.create({

  enabled: true,
  stickyClass: 'sticky',

  init() {
    this._super(...arguments);
    this.set('uniqueId', guidFor(this));
  },

  didInsertElement() {
    this._super(...arguments);

    this._setElements();

    if (this.get('enabled')) {
      this._bindListeners();
    }

    this._didRender = true;
  },

  didUpdateAttrs() {
    this._super(...arguments);

    // only react to updates after render
    if (!this._didRender) {
      return;
    }

    if (this.get('enabled')) {
      this._bindListeners();
    } else {
      this._didEnter();
      this._unbindListeners();
    }
  },

  willDestroyElement() {
    this._super(...arguments);
    if (this.get('enabled') && this._didRender) {
      this._unbindListeners();
    }
  },

  _setElements() {
    this._wrapper = document.getElementById(`sticky-wrapper-${this.get('uniqueId')}`);
    this._contentWrapper = document.getElementById(`sticky-content-wrapper-${this.get('uniqueId')}`);
    this._heightWrapper = document.getElementById(`sticky-height-wrapper-${this.get('uniqueId')}`);
    this._contextEl = this._wrapper.parentNode || window;
  },

  _bindListeners() {
    addScrollHandler(this._contextEl, this._update.bind(this));
  },

  _unbindListeners() {
    removeScrollHandler(this._contextEl, this._update.bind(this));
  },

  _update({ top }) {
    let element = this._wrapper;
    let contextEl = this._contextEl;

    let boundingClientRect = element.getBoundingClientRect();
    let topOffset = this.get('offsets.top') || 0;
    let inViewport = this.get('inViewport');

    let notOnTop = boundingClientRect.top - topOffset > 0;
    let newInViewport = isInViewport(boundingClientRect, $(contextEl).innerHeight(), $(contextEl).innerWidth(), this.get('offsets'));

    if (!inViewport && newInViewport) {
      this._didEnter();
    } else if (inViewport && !newInViewport && !notOnTop) {
      // if it is *not on top* and it is *on in viewport* anymore,
      // we conclude that the element "bottomed out" (exited through the bottom)
      this._didLeave();
    }

    if (!newInViewport) {
      this._setTranslateY(top + topOffset);
    }

    this.set('inViewport', newInViewport);
  },

  _didEnter() {
    this._toggleStickyClass(false);
    this._setTranslateY(false);
    this._setWrapperHeight(false);
  },

  _didLeave(translateY) {
    let contentWrapper = this._contentWrapper;
    let wrapperHeight = $(contentWrapper).outerHeight(true);

    this._setWrapperHeight(wrapperHeight);
    this._toggleStickyClass(true);
  },

  _toggleStickyClass(toggle) {
    let contentWrapper = this._contentWrapper;
    let stickyClass = this.get('stickyClass');
    $(contentWrapper).toggleClass(stickyClass, toggle);
    this.set('isSticky', toggle);
  },

  _setTranslateY(translateY) {
    let contentWrapper = this._contentWrapper;
    contentWrapper.style.top = translateY ? `${translateY}px` : '';
  },

  _setWrapperHeight(height) {
    let heightWrapper = this._heightWrapper;
    heightWrapper.style.height = height ? `${height}px` : '';
  }
});

import Ember from 'ember';
import canUseDOM from 'ember-sticky/utils/can-use-dom';
import canUseRaf from 'ember-sticky/utils/can-use-raf';
import isInViewport from 'ember-sticky/utils/is-in-viewport';
import SCROLLBAR_WIDTH from 'ember-sticky/utils/scrollbar-width';

const { Mixin, guidFor, $ } = Ember;

const events = ['scroll', 'resize'];

const TICK = 17;
const raf = canUseRaf() ? requestAnimationFrame : (fn) => {
  setTimeout(fn, TICK);
};

export default Mixin.create({

  enabled: true,
  stickyClass: 'sticky',
  classNames: ['sticky-wrapper'],

  init() {
    this._super(...arguments);
    this.set('uniqueId', guidFor(this));
  },

  didInsertElement() {
    this._super(...arguments);
    if (!canUseDOM) {
      return;
    }

    if (this.get('enabled')) {
      this._setElements();
      this._canUseRaf = canUseRaf();
      this._bindListeners();
    }
    this._didRender = true;
  },

  didUpdateAttrs() {
    this._super(...arguments);
    if (!this._didRender) {
      return;
    }
    
    if (this.get('enabled')) {
      this._setElements();
      this._canUseRaf = canUseRaf();
      this._bindListeners();
    } else {
      this._didEnter();
      this._unbindListeners();
    }
  },

  willDestroyElement() {
    this._super(...arguments);
    if (!canUseDOM) {
      return;
    }

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
    let element = this._wrapper;
    let contextEl = this._contextEl;
    let elementId = this.get('uniqueId');

    events.forEach((event) => {
      $(contextEl).on(`${event}.${elementId}`, () => {
        this._onScroll(contextEl, element);
      });
    });
  },

  _onScroll(contextEl, element) {
    this._lastScrollY = contextEl.scrollTop;

    // Prevent multiple rAF callbacks.
    if (this._scheduledAnimationFrame) {
      return;
    }

    this._scheduledAnimationFrame = true;
    raf(() => {
      this._updateInViewport(contextEl, element);
      this._scheduledAnimationFrame = false;
    });
  },

  _updateInViewport(contextEl, element) {
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

    this.set('inViewport', newInViewport);
  },

  _unbindListeners() {
    let elementId = this.get('uniqueId');
    let contextEl = this._contextEl;

    events.forEach((event) => {
      $(contextEl).off(`${event}.${elementId}`);
    });
  },

  _toggleStickyClass(toggle) {
    let contentWrapper = this._contentWrapper;
    let contextEl = this._contextEl;
    let stickyClass = this.get('stickyClass');
    $(contentWrapper).toggleClass(stickyClass, toggle);

    contentWrapper.style.boxSizing = 'border-box';

    let offsetTop = this.get('offsets.top') || 0;
    contentWrapper.style.top = toggle ? `${offsetTop}px` : '';

    let contextWidth = $(contextEl).outerWidth(true);
    contentWrapper.style.width = toggle ? `${contextWidth - SCROLLBAR_WIDTH}px` : '';

    this.set('isSticky', toggle);
  },

  _setWrapperHeight(height) {
    let heightWrapper = this._heightWrapper;
    heightWrapper.style.height = height ? `${height}px` : '';
  },

  _didEnter() {
    this._toggleStickyClass(false);
    this._setWrapperHeight(false);
  },

  _didLeave() {
    let contentWrapper = this._contentWrapper;
    let wrapperHeight = $(contentWrapper).outerHeight(true);

    this._setWrapperHeight(wrapperHeight);
    this._toggleStickyClass(true);
  }
});

import Ember from 'ember';
import canUseDOM from 'ember-sticky/utils/can-use-dom';
import canUseRaf from 'ember-sticky/utils/can-use-raf';
import isInViewport from 'ember-sticky/utils/is-in-viewport';

const { Mixin, computed, String: { htmlSafe }, run, guidFor, $ } = Ember;

const rAFIDS = {};
const events = ['scroll', 'resize'];

export default Mixin.create({

  enabled: true,
  stickyClass: 'sticky',

  translateStyle: computed('isSticky', 'scrollTop', function() {
    let scrollTop = this.get('scrollTop');
    let isSticky = this.get('isSticky');
    return isSticky && !!scrollTop ? htmlSafe(`transform: translateY(${scrollTop}px);`) : null;
  }),

  wrapperHeightStyle: computed('wrapperHeight', function() {
    let wrapperHeight = this.get('wrapperHeight');
    return wrapperHeight ? htmlSafe(`height: ${wrapperHeight}px;`) : null;
  }),

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
      this._bindListeners();
    }
  },

  didUpdateAttrs() {
    this._super(...arguments);
    if (this.get('enabled') && this._getStickyWrapper()) {
      this._bindListeners();
    } else {
      this._didEnter();
      this._unbindListeners();
    }
  },

  _getStickyWrapper() {
    return document.getElementById(`sticky-wrapper-${this.get('uniqueId')}`);
  },

  _getStickyContentWrapper() {
    return document.getElementById(`sticky-content-wrapper-${this.get('uniqueId')}`);
  },

  _getContext() {
    return this._getStickyWrapper().parentNode || window;
  },

  willDestroyElement() {
    this._super(...arguments);
    if (!canUseDOM) {
      return;
    }

    this._unbindListeners();
  },

  _bindListeners() {
    let element = this._getStickyWrapper();
    let contextEl = this._getContext();
    let elementId = this.get('uniqueId');

    if (canUseRaf()) {
      this._rafLoop(element, contextEl);
    } else {
      events.forEach((event) => {
        $(contextEl).on(`${event}.${elementId}`, () => {
          this._updateInViewport(element, contextEl);
        });
      });
    }
  },

  _rafLoop(element, contextEl) {
    let elementId = this.get('uniqueId');
    this._updateInViewport(element, contextEl);
    rAFIDS[elementId] = window.requestAnimationFrame(run.bind(this, this._rafLoop, element, contextEl));
  },

  _updateInViewport(element, contextEl) {
    let boundingClientRect = element.getBoundingClientRect();

    let newInViewport = isInViewport(boundingClientRect, $(contextEl).innerHeight(), $(contextEl).innerWidth(), this.get('viewportTolerance'));
    let inViewport = this.get('inViewport');
    let notOnTop = boundingClientRect.top > contextEl.scrollTop;

    if (!inViewport && newInViewport) {
      this._didEnter();
    } else if (inViewport && !newInViewport && !notOnTop) {
      // if it is *not on top* and it is *on in viewport* anymore,
      // we conclude that the element "bottomed out" (exited through the bottom)
      this._didLeave();
    }

    this._updateTranslate(element, contextEl);

    this.set('inViewport', newInViewport);
  },

  _updateTranslate(element, contextEl) {
    this.set('scrollTop', contextEl.scrollTop);
  },

  _unbindListeners() {
    let elementId = this.get('uniqueId');
    let contextEl = this._getContext();

    if (canUseRaf()) {
      window.cancelAnimationFrame(rAFIDS[elementId]);
      delete rAFIDS[elementId];
    } else {
      events.forEach((event) => {
        $(contextEl).off(`${event}.${elementId}`);
      });
    }
  },

  _didEnter() {
    this.set('isSticky', false);
    this.set('wrapperHeight', null);
  },

  _didLeave() {
    let contentWrapper = this._getStickyContentWrapper();
    let wrapperHeight = $(contentWrapper).outerHeight(true);
    this.set('isSticky', true);
    this.set('wrapperHeight', wrapperHeight);
  }
});

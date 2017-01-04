import Ember from 'ember';
import layout from '../templates/components/sticky-element';
import getScrollbarWidth from '../utils/scrollbar-width';
const { Component, computed, run, String: { htmlSafe }, isPresent, $ } = Ember;
/* global scrollMonitor */

const SCROLLBAR_WIDTH = getScrollbarWidth();

export default Component.extend({
  layout,

  classNames: ['sticky-wrapper'],

  enabled: true,
  topOffset: 0,
  stickyClass: 'stuck',

  heightStyle: computed('wrapperHeight', function() {
    let wrapperHeight = this.get('wrapperHeight');
    return isPresent(wrapperHeight) ? htmlSafe(`height: ${wrapperHeight}px;`) : null;
  }),

  wrapperStyle: computed('topOffset', 'containerWidth', function() {
    let style = '';
    let topOffset = this.get('topOffset');
    style += isPresent(topOffset) ? `top: ${topOffset}px;` : '';
    let containerWidth = this.get('containerWidth');
    style += isPresent(containerWidth) ? `width: ${containerWidth}px;` : '';

    return htmlSafe(style);
  }),

  isSticky: computed.and('shouldStick', 'enabled'),

  didInsertElement() {
    this._super(...arguments);

    this.initScrollMonitor();
  },

  didUpdateAttrs() {
    this._super(...arguments);
    if (this.watcher) {
      this.watcher.offsets.top = this.get('topOffset') || 0;
    }
  },

  willDestroyElement() {
    this._super(...arguments);

    this.destroyScrollMonitor();
  },

  initScrollMonitor() {
    let containerMonitor = scrollMonitor.createContainer(this.element.parentNode);
    let elementWatcher = containerMonitor.create(this.element, { top: this.get('topOffset') || 0 });

    elementWatcher.stateChange(run.bind(this, this.stateChange));

    this.watcher = elementWatcher;
  },

  destroyScrollMonitor() {
    this.watcher.destroy();
  },

  stateChange(event, { isAboveViewport, isFullyInViewport }) {
    if (!isFullyInViewport && isAboveViewport) {
      this.set('wrapperHeight', this.$('.sticky-wrapper').outerHeight(true));

      let context = this.element.parentNode;
      let canScroll = context.scrollHeight > context.clientHeight;
      let newWidth = canScroll ? $(context).width() - SCROLLBAR_WIDTH : $(context).width();
      this.set('containerWidth', newWidth);

      this.set('shouldStick', true);
    } else {
      this.set('wrapperHeight', null);
      this.set('containerWidth', null);
      this.set('shouldStick', false);
    }
  }

});
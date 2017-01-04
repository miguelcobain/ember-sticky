import Ember from 'ember';
import layout from '../templates/components/sticky-element';
import getScrollbarWidth from '../utils/scrollbar-width';
const { Component, computed, run, String: { htmlSafe } } = Ember;
/* global scrollMonitor */

const SCROLLBAR_WIDTH = getScrollbarWidth();

export default Component.extend({
  layout,

  classNames: ['sticky-wrapper'],

  enabled: true,
  refreshOnMutations: true,
  stickyClass: 'stuck',

  heightStyle: computed('wrapperHeight', function() {
    let wrapperHeight = this.get('wrapperHeight');
    return wrapperHeight ? htmlSafe(`height: ${wrapperHeight}px;`) : null;
  }),

  wrapperStyle: computed('offset', 'containerWidth', function() {
    let style = '';
    let offset = this.get('offset');
    style += offset ? `top: ${offset}px;` : '';
    let containerWidth = this.get('containerWidth');
    style += containerWidth ? `width: ${containerWidth}px;` : '';

    return htmlSafe(style);
  }),

  isSticky: computed.and('shouldStick', 'enabled'),

  didInsertElement() {
    this._super(...arguments);

    this.initScrollMonitor();
  },

  willDestroyElement() {
    this._super(...arguments);
    this.watcher.destroy();
  },

  initScrollMonitor() {
    let containerMonitor = scrollMonitor.createContainer(this.element.parentNode);
    let elementWatcher = containerMonitor.create(this.element, { top: this.get('offset') || 0 });

    elementWatcher.stateChange(run.bind(this, this.stateChange));

    this.watcher = elementWatcher;
  },

  stateChange(event, { isAboveViewport, isFullyInViewport }) {
    if (!isFullyInViewport && isAboveViewport) {
      this.set('wrapperHeight', this.$('.sticky-wrapper').outerHeight(true));

      let context = this.element.parentNode
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
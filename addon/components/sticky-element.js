import Ember from 'ember';
import layout from '../templates/components/sticky-element';
const { Component, computed, run, String: { htmlSafe }, isPresent } = Ember;
/* global scrollMonitor */

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

  wrapperStyle: computed('topOffset', 'wrapperWidth', function() {
    // To ensure that this component becomes sticky immediately on mobile devices instead
    // of disappearing until the scroll event completes, we add `transform: translateZ(0)`
    // to 'kick' rendering of this element to the GPU
    // @see http://stackoverflow.com/questions/32875046
    let styles = ['transform: translateZ(0px)'];

    let { topOffset, wrapperWidth } = this.getProperties('topOffset', 'wrapperWidth');
    if (isPresent(topOffset)) {
      styles.push(`top: ${topOffset}px`);
    }

    if (isPresent(wrapperWidth)) {
      styles.push(`width: ${wrapperWidth}px;`);
    }

    return htmlSafe(styles.join('; '));
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

    elementWatcher.stateChange((event, { isAboveViewport, isFullyInViewport }) => {
      let isSticky = !isFullyInViewport && isAboveViewport;
      let methodName = isSticky ? 'enterSticky' : 'leaveSticky';
      run.bind(this, methodName)();
    });

    this.watcher = elementWatcher;
  },

  destroyScrollMonitor() {
    this.watcher.destroy();
  },

  enterSticky() {
    let { width, height } = this.element.getBoundingClientRect();
    this.set('wrapperHeight', height);
    this.set('wrapperWidth', width);
    this.set('shouldStick', true);
  },

  leaveSticky() {
    this.set('wrapperHeight', null);
    this.set('wrapperWidth', null);
    this.set('shouldStick', false);
  }

});
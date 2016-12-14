import Ember from 'ember';
import layout from '../templates/components/sticky-element';
import StickyMixin from 'ember-sticky/mixins/sticky';
const { Component } = Ember;

export default Component.extend(StickyMixin, {
  tagName: '',
  layout
});
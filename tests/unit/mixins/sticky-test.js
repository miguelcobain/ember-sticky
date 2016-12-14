import Ember from 'ember';
import StickyMixin from 'ember-sticky/mixins/sticky';
import { module, test } from 'qunit';

module('Unit | Mixin | sticky');

// Replace this with your real tests.
test('it works', function(assert) {
  let StickyObject = Ember.Object.extend(StickyMixin);
  let subject = StickyObject.create();
  assert.ok(subject);
});

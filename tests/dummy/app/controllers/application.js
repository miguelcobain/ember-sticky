import Ember from 'ember';

export default Ember.Controller.extend({
  secondaryEnabled: true,
  tertiaryEnabled: true,
  actions: {
    toggleSecondary() {
      this.toggleProperty('secondaryEnabled');
    },
    toggleTertiary() {
      this.toggleProperty('tertiaryEnabled');
    }
  }
});
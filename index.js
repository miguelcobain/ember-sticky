/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-sticky',

  options: {
    nodeAssets: {
      scrollmonitor: function() {
        return {
          import: [{
            path: 'scrollMonitor.js',
            sourceMap: 'scrollMonitor.js.map'
          }]
        };
      }
    }
  },

  included: function(parent) {
    this.addonOptions = parent.options && parent.options.emberSticky || {};
    this._super.included.apply(this, arguments);
  }
};

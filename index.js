/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-sticky',

  options: {
    nodeAssets: {
      scrollmonitor: function() {
        var files = [];
        var includeWaypoints = this.addonOptions.includeWaypoints;
        if (includeWaypoints === undefined || includeWaypoints === true) {
          files.push('jquery.waypoints.js')
        }
        files.push('shortcuts/sticky.js');

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

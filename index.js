/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-sticky',

  options: {
    nodeAssets: {
      waypoints: function() {
        var files = [];
        var includeWaypoints = this.addonOptions.includeWaypoints;
        if (includeWaypoints === undefined || includeWaypoints === true) {
          files.push('jquery.waypoints.js')
        }
        files.push('shortcuts/sticky.js');

        return { srcDir: 'lib', import: files };
      }
    }
  },

  included: function(parent) {
    this.addonOptions = parent.options && parent.options.emberSticky || {};
    this._super.included.apply(this, arguments);
  }
};

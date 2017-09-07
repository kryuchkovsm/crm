/**
 * Created by user on 18.03.15.
 */
'use strict';

angular.module('SitesSetupService', [])
  .factory('SitesSetup',

  function($state, ModalService) {

    var toScope = {};
    var createItem = function(item) {
      var result = item;
      result.sitesAmount = result.Sites.length;
      result.chargesAmount = result.Charges.length;
      return result;
    };

    // Return directly only functions and constants (whiteLabel), other things through function(){return {val: someobject};}
    var methods = {
      createItem: createItem,
      toScope: function () { return toScope; }
    };

    return methods;
  });

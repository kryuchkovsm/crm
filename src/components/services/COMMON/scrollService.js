/**
 * Created by user on 5/17/15.
 */

'use strict';

angular.module('ScrollService', [])
  .factory('ScrollService',
  function($location, $anchorScroll, $timeout) {

    var scrollTo = function (elemId) {
      // set the location.hash to the id of
      // the element you wish to scroll to.
      $location.hash(elemId);
      // call $anchorScroll()
      // Scroll with timeout to allow ng-if/show element appear in full size,
      // not to scroll an empty space with zero result
      $timeout(function () {
        $anchorScroll();
      }, 0);
    };

    // Return directly only functions and constants (whiteLabel), other things through function(){return {val: someobject};}

    return {
      scrollTo: scrollTo
    };
  });

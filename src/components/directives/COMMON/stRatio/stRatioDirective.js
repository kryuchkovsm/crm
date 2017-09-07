/**
 * Created by user on 12.03.15.
 */
'use strict';
angular.module('st-ratio', [])
  .directive('stRatio', function () {
    return {
      link:function(scope, element, attr){
        var ratio=+(attr.stRatio);
        element.css('width',ratio+'%');
      }
    };
  });

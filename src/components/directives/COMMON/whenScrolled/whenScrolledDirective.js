/**
 * Created by user on 31.03.15.
 */
'use strict';

angular.module('when-scrolled-directive', []).directive('crmWhenScrolled', function() {
  return function(scope, elm, attr) {
    var raw = elm[0];
    elm.bind('scroll', function() {
      if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
        scope.$apply(attr.crmWhenScrolled);
      }
    });
  };
});

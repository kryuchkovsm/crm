/**
 * Created by user on 31.03.15.
 */
'use strict';
angular.module('email-validation-directive', []).directive('vemail', function () {
  //var EMAIL_REGEXP = new RegExp('^[a-z0-9]+(\.[_a-z0-9]+)*@@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,50})$', 'i');
  //var EMAIL_REGEXP = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
  var EMAIL_REGEXP = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  return {
    require: 'ngModel',
    link: function (scope, elm, attrs, ctrl) {
      if (attrs && attrs.type === 'email') {
        ctrl.$parsers.unshift(function (viewValue) {
          if (!viewValue || EMAIL_REGEXP.test(viewValue)) {
            // it is valid
            ctrl.$setValidity('email', true);
            return viewValue;
          } else {
            // it is invalid, return undefined (no model update)
            ctrl.$setValidity('email', false);
            return undefined;
          }
        });
      }
    }
  };
});

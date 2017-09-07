/**
 * Created by user on 04.03.15.
 */
'use strict';
angular.module('textRange-input-directive', [])
  .directive('crmTextRangeInput', function ($compile) {
  return {
    scope: {
      options: '=',
      value: '='
    },
    templateUrl: 'components/directives/COMMON/textRangeInput/textRangeInputTpl.html',
    link: function ($scope, $element, $attrs) {
      if ($scope.options.inline) {
        $element.replaceWith($compile('<input type="{{options.type}}" class="form-control search-box" id="inputTxtId{{name}}" name="{{name}}" ng-model="value"  >' +
        '<p class="help-block" ng-if="error.required">The {{options.label}} is required</p>' +
        '<p class="help-block" ng-if="error.email">The EMAIL is invalid</p>')($scope));
      }
    }
  };
});

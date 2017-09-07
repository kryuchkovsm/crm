/**
 * Created by user on 12.03.15.
 */
'use strict';
angular.module('portlet-header-directive', [])
  .directive('crmPortletHeader', function ($compile, $timeout) {
  return {
    replace: true,
    scope: {
      value: '=',
      options: '='
    },
    templateUrl: 'components/directives/COMMON/portletHeader/portletHeaderTpl.html',
    link: function ($scope, $element, $attrs) {
    }
  };
});

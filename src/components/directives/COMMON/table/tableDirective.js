/**
 * Created by user on 12.03.15.
 */
'use strict';
angular.module('table-directive', [])
  .directive('crmTable', function ($compile) {
  return {
    replace: true,
    scope: {
      value: '=',
      options: '='
    },
    templateUrl: 'components/directives/COMMON/table/tableTpl.html',
    link: function ($scope, $element, $attrs) {

    }
  };
});

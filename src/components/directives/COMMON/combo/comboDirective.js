/**
 * Created by user on 04.03.15.
 */
'use strict';
angular.module('combo-directive', [])
  .directive('crmCombo', function ($compile) {
    return {
      scope: {
        value: '=',
        options: '='
      },
      templateUrl: 'components/directives/COMMON/combo/comboTpl.html',
      link: function ($scope, $element, $attrs) {
        $scope.options.label = $scope.options.label || 'Combo Name';
        $scope.value = $scope.value || {};
        $scope.selectOptions = angular.copy($scope.options.data);


        if ($scope.options.select) {
          if ($scope.options.noDefault) {
            $scope.default = '-- Please Select --';
          } else if ($scope.value.selectValue) {
            $scope.default = $scope.value.selectValue.name;
          } else {
            $scope.default = $scope.selectOptions.shift().name;
          }
        }

        $scope.setSelectedItem = function () {
              if ($scope.options.checkbox.value === true) {
                $scope.options.checkbox.value = false;
              } else {
                $scope.options.checkbox.value = true;
              }
          $scope.value.checkboxValue = $scope.options.checkbox.value;
          //console.log(' checkboxValue ', $scope.value.checkboxValue);
          return false;
        };

        $scope.buttonClick = function () {
          console.log(' Combo Button Click ');
        }
      }
    };
  });

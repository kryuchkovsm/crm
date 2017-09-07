/**
 * Created by user on 12.03.15.
 */
'use strict';
angular.module('date-picker-directive', [])
  .directive('crmDatePicker', function ($timeout, $filter, GlobalVars, DataProcessing) {
    return {
      require: '?^ngModel',
      scope: {
        value: '=',
        options: '='
      },
      templateUrl: 'components/directives/COMMON/datepicker/datepickerTpl.html',
      link: function($scope, $element, $attrs, $ngModelCtrl) {
        $scope.options = $scope.options || {}
        $scope.name = $scope.options.label ? $scope.options.label.replace(/\W/g, '') + $scope.options.id : '';
        $scope.$on('show-errors-check-validity', function(event, name) {
          if (angular.isUndefined(name) || angular.element($element).parents('form').attr('name') == name){
            $scope.options.showError = true;
          }
        });
        $scope.$on('show-errors-reset', function(event, name) {
          if (angular.isUndefined(name) || angular.element($element).parents('form').attr('name') === name){
            $scope.options.showError = false;
          }
        });

        if ($scope.options.valRequired && $ngModelCtrl && $scope.name && $ngModelCtrl.$modelValue)
          $scope.$watch(function () {
              return $ngModelCtrl.$modelValue[$scope.name];
          }, function(newValue, oldValue) {
            if (!newValue) {
              $scope.newValue = {}
              return;
            }
            $scope.newValue = newValue;
          }, true);

        if ($scope.options.width)
          $scope.options.width = 'width: ' + $scope.options.width + 'px!important;';

        $scope.datepickerOptions = {
          rtl: Metronic.isRTL(),
          orientation: "left",
          startDate: '01/01/2012',
          minDate: '01/01/2012',
          autoclose: true,
          format: (GlobalVars.commonObject().DateFormat || 'mm/dd/yyyy').toLowerCase(),
          todayHighlight: true
        };

        if ($scope.options.beforeShowDay)
          $scope.datepickerOptions.beforeShowDay = angular.copy($scope.options.beforeShowDay);

        $timeout(function(){
          $scope.inputHasFocus = false;
          $element.find('input').datepicker($scope.datepickerOptions).on('changeDate', function(e) {
            return $scope.$apply(function() {
              return $scope.value = DataProcessing.toDateFormat(e.date);
            });
          });

          $element.find('input').on('focus', function() {
            return $scope.inputHasFocus = true;
          }).on('blur', function() {
            return $scope.inputHasFocus = false;
          });
          $scope.$watch('value', function(newValue) {
            if (!$scope.inputHasFocus && newValue) {
              return $element.find('input').datepicker('update', newValue);
            }
          });

          angular.element('.date-picker .btn').click(function(e){
            angular.element(e.target).parents('.date-picker').find('input').datepicker('show')
          })
        });

      }
    };
  });

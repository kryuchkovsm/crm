/**
 * Created by user on 04.03.15.
 */
'use strict';
angular.module('select-directive', [])
  .directive('crmSelect', function ($compile) {
    return {
      require: '^ngModel',
      scope: {
        value: '=',
        options: '='
      },
      templateUrl: 'components/directives/COMMON/select/selectTpl.html',
      link: function ($scope, $element, $attrs, $ngModelCtrl) {
        $scope.options.label = $scope.options.label || 'Select Name';
        if ($scope.options.valRequired){
          $($element).find('select').attr('required', 'true')
        }
        if ($scope.options.valRequired)
          $scope.$watch('value', function(val){
            if (val) {
              if ($ngModelCtrl)
                $ngModelCtrl.$setValidity($scope.options.label+' required', true);
              $scope.options.showError = false;
            }
            else if ($ngModelCtrl)
              $ngModelCtrl.$setValidity($scope.options.label+' required', false);

          })

        $scope.$on('show-errors-check-validity', function(event, name) {
          if ((angular.isUndefined(name) || angular.element($element).parents('form').attr('name') === name) && !$scope.value)
            $scope.options.showError = true;
          else
            $scope.options.showError = false;
        });

      }
    };
  });

/**
 * Created by user on 04.03.15.
 */
'use strict';
angular.module('checkbox-directive', [])
  .directive('crmCheckbox', function ($compile) {
    return {
      scope: {
        value: '=',
        options: '='
      },
      templateUrl: 'components/directives/COMMON/checkbox/checkboxTpl.html',
      link: function ($scope, $element, $attrs) {
        $scope.value = $scope.value || [];
        $scope.options.label = $scope.options.label || '';
        $scope.options.inline = $scope.options.inline || false;
        $scope.options.class = $scope.options.class || 'default';

        if ($scope.options.inline) {
          if ($scope.options.inline === 'column') {
            $scope.options.inlineClass = '';
          } else {
            $scope.options.inlineClass = $scope.options.inlineClass || 'inline';
          }
          $element.replaceWith($compile('<div class="checkbox-list {{options.inlineClass}}" style="{{options.containerStyle}}"><label class="{{options.class}} checkbox-{{options.inlineClass}}" ng-repeat="option in options.data" ng-click="setSelectedItem(option)">' +
          '<div class="checker"><span ng-class="{checked: option.value}"></span></div> {{option.name}}</label></div>')($scope));
        }

        angular.forEach($scope.options.data, function(vD,nD){
          angular.forEach($scope.value, function(v,n){
            if (vD.id == v.id) $scope.options.data[nD].value = v.value
          })
        });

        $scope.setSelectedItem = function (option) {
          var f;
          angular.forEach($scope.value, function(v,n){
            if (v.id == option.id) {
              f = true
              option.value = !option.value
              $scope.value[n].value = option.value
            }
          });
          if (!f) {
            option.value = true;
            $scope.value.push(option)
          }
        };

      }
    };
  });

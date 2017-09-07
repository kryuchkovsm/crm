/**
 * Created by user on 04.03.15.
 */
'use strict';
angular.module('radio-list-directive', [])
  .directive('crmRadioList', function ($compile) {
    return {
      scope: {
        value: '=',
        options: '='
      },
      templateUrl: 'components/directives/COMMON/radioList/radioListTpl.html',
      link: function ($scope, $element, $attrs) {
        $scope.options = $scope.options || {};
        $scope.options.label = $scope.options.label || false;
        $scope.options.inline = $scope.options.inline || false;
        $scope.options.wide = $scope.options.wide ? 'radio-list form-control search-box gray-bg' : '';
        $scope.options.labelInline = $scope.options.labelInline ? 'inline-block margin-left-20' : '';
        $scope.options.column = $scope.options.column ? true : false;

        if ($scope.options.inline) {
          $element.replaceWith($compile(
            '<div class="radio-list">\
              <label class="radio-inline" ng-repeat="option in options.data">\
                <div class="radio">\
                  <span class="{{option.checked}}">\
                    <input type="radio" id="{{option.id}}" value="{{option.id}}" \
                      ng-click="setSelectedItem(option.id)">\
                  </span>\
                </div>\
                {{option.name | translate}}\
              </label>\
             </div>')($scope));
        }

        $scope.setSelectedItem = function (id) {
          for (var i = 0; i < $scope.options.data.length; i++) {
            var item = $scope.options.data[i];
            if(item.id === id) {
              item.checked = 'checked';
              $scope.value = angular.copy(item);
            } else {
              item.checked = '';
            }
          }
          return false;
        };

        angular.forEach($scope.options.data, function(option){
          if (option.checked) $scope.setSelectedItem(option.id)
        });

        if ($scope.options.defaultID) {
          $scope.setSelectedItem($scope.options.defaultID);
        }

        $scope.$watch('value.id', function(newVal){
          if (newVal || newVal == 0){
            $scope.setSelectedItem(newVal)
          }
        })

      }
    };
  });

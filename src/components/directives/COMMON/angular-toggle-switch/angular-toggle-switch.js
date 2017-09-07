angular.module('toggle-switch', ['ng']).directive('toggleSwitch', ['$compile', function($compile) {
  return {
    restrict: 'EA',
    replace: true,
    scope: {
      model: '=',
      onLabel: '@',
      offLabel: '@'
    },
    template:
    '<div class="ats-switch" ng-click="toggle()">' +
      '<div class="switch-left" ng-class="{\'switch-active\': model}"></div>' +
      '<div class="switch-right" ng-class="{\'switch-active\': !model}"></div>' +
    '</div>',
    controller: ['$scope', function($scope) {
      $scope.toggle = function() {
          $scope.model = !$scope.model;
      };
    }],
    compile: function(element, attrs) {
      if (angular.isUndefined(attrs.onLabel)) {
        attrs.onLabel = 'On';
      }
      if (angular.isUndefined(attrs.offLabel)) {
        attrs.offLabel = 'Off';
      }

      return function postLink(scope, iElement, iAttrs, controller) {

        var bindSpan = function(span, html) {
          span = angular.element(span);
          var bindAttributeName = (html === true) ? 'ng-bind-html' : 'ng-bind';

          // remove old ng-bind attributes
          span.removeAttr('ng-bind-html');
          span.removeAttr('ng-bind');

          if (angular.element(span).hasClass("switch-left"))
            span.attr(bindAttributeName, 'onLabel');
          if (span.hasClass("switch-right"))
            span.attr(bindAttributeName, 'offLabel');

          $compile(span)(scope, function(cloned, scope) {
            span.replaceWith(cloned);
          });
        };

        var bindSwitch = function(iElement, html) {
          angular.forEach(iElement[0].children, function(span, index) {
            bindSpan(span, html);
          });
        };

        scope.$watch('html', function(newValue) {
          bindSwitch(iElement, newValue);
        });
      };
    }
  };
}]);

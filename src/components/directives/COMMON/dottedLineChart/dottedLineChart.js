/**
 * Created by user on 04.03.15.
 */
'use strict';
angular.module('dotted-linechart-directive', [])
  .directive('crmDottedLinechart', function ($compile, $timeout, ChartInit) {
    return {
      scope: {
        options: '='
      },
      templateUrl: 'components/directives/COMMON/dottedLineChart/dottedLineChartTpl.html',
      link: function ($scope, $element, $attrs) {
        $scope.leftBlock = $scope.options.leftBlockDisabled ? false : true;
        $scope.addBlueBg = $scope.leftBlock ? 'blue-bg' : '';

        $scope.height = $scope.options.bottomBlock ? '200' : '210';
        $scope.height = $scope.options.height ? angular.copy($scope.options.height) : angular.copy($scope.height);

        $scope.paddingTop = $scope.options.bottomBlock ? '10' : '77';
        $scope.activeBg = 'ActiveElementColor';
        $scope.chartBg = 'GraphBackgroundColor';
        var initChart = function () {
          var method = 'dottedLineChartInit';
          if ($scope.options.universal)
            method = 'dottedLineChartInitUniversal';
          ChartInit[method]($scope.options.chartID, $scope.options.chartData, $scope.options.tooltipLabel);
        };
        $scope.$watchCollection('options.chartData', function (newVal, oldVal) {
          //console.log('$watch chartData', newVal);
          $timeout(function () {
            initChart();
          }, 0);
        });
        $timeout(function () {
          initChart();
        }, 0);
      }
    };
  });

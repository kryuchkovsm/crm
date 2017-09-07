/**
 * Created by user on 04.03.15.
 */
'use strict';
angular.module('barchart-directive', [])
  .directive('crmBarchart', function ($compile, $timeout, ChartInit) {
    return {
      scope: {
        options: '='
      },
      templateUrl: 'components/directives/COMMON/barChart/barChartTpl.html',
      link: function ($scope, $element, $attrs) {
        var colors = {green: '#7CB242', black: '#383D42', orange: '#F69956'};
        $scope.paddingTop = $scope.options.paddingTop || 20;
        $scope.paddingBottom = $scope.options.paddingBottom || 20;
        $scope.height = $scope.options.height || 120;
        $scope.options.total = $scope.options.showPercents ? $scope.options.total + '%' : $scope.options.total;

        $scope.options.color = colors[$scope.options.color];

        var initChart = function () {
          ChartInit.barChartInit(
            $scope.options.chartID,
            $scope.options.chartData,
            $scope.options.tooltipLabel,
            $scope.options.color
          );
        };
        $scope.$watchCollection('options.chartData', function (newVal, oldVal) {
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

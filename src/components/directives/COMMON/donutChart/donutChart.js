/**
 * Created by user on 04.03.15.
 */
'use strict';
angular.module('donutchart-directive', [])
  .directive('crmDonutchart', function ($compile, $timeout, ChartInit) {
    return {
      scope: {
        options: '='
      },
      templateUrl: 'components/directives/COMMON/donutChart/donutChartTpl.html',
      link: function ($scope, $element, $attrs) {
        var colors = { green: '#7CB242', black: '#383D42', orange: '#f68f42' };
        $scope.options.color = colors[ $scope.options.color ] || $scope.options.color;
        $scope.options.longDonut = $scope.options.squareDonut ? false : true;
        $scope.options.squareDonut = $scope.options.squareDonut || false;
        var initChart = function () {
          ChartInit.donutChartInit(
            $scope.options.chartID,
            $scope.options.chartData,
            $scope.options.tooltipLabel,
            $scope.options.color
          );
        };
        $scope.$watchCollection('options.chartData', function (newVal, oldVal) {
          //console.log('$watch donut chartData', newVal);
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

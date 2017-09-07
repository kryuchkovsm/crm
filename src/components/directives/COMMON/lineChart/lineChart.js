/**
 * Created by user on 04.03.15.
 */
'use strict';
angular.module('linechart-directive', [])
  .directive('crmLinechart', function ($compile, $timeout, ChartInit) {
    return {
      scope: {
        options: '='
      },
      templateUrl: 'components/directives/COMMON/lineChart/lineChartTpl.html',
      link: function ($scope, $element, $attrs) {
        $scope.paddingTop = $scope.options.paddingTop || 100;
        $scope.paddingBottom = $scope.options.paddingBottom || 30;
        $scope.height = $scope.options.height || 100;

        if ($scope.options.total === 0) {
          $scope.options.total = '0';
        }

        if ($scope.options.percents === 0) {
          $scope.options.percents = '0';
        }

        var initChart = function () {
          ChartInit.lineChartInit(
            $scope.options.chartID,
            $scope.options.chartData,
            $scope.options.tooltipLabel,
            $scope.options.color
          );
        };

        $scope.$watchCollection('options.chartData', function (newVal, oldVal) {
          //console.log('$watch line chartData', newVal);
          $timeout(function () {
            initChart();
          }, 0)
        });

        $timeout(function () {
          initChart();
        }, 0);

      }
    };
  });

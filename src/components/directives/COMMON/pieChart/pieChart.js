/**
 * Created by user on 04.03.15.
 */
'use strict';
angular.module('piechart-directive', [])
  .directive('crmPiechart', function ($compile, $timeout, ChartInit) {
    return {
      scope: {
        options: '='
      },
      templateUrl: 'components/directives/COMMON/pieChart/pieChartTpl.html',
      link: function ($scope, $element, $attrs) {

        var initChart = function () {
          $scope.labels = [];
          $scope.amounts = [];
          $scope.txtColors = [];

          $scope.labels = $scope.options.chartData.map(function (item) {
            return item.label;
          });

          $scope.txtColors = $scope.options.chartData.map(function (item) {
            return item.txtColor;
          });

          $scope.amounts = $scope.options.chartData.map(function (item) {
            var result = item.amountToShow ? item.amountToShow :  item.data;
            if ($scope.options.percents)
              result = result + '%';
            return result;
          });

          // Labels color
          var colors = {green: '#7CB242', black: '#383D42', grey: '#eee', orange: '#F69956'};
          $scope.options.color = colors[$scope.options.color];
          // Bg
          $scope.options.bg = $scope.options.bg || '#eee';

          ChartInit.pieChartInit(
            $scope.options.chartID,
            $scope.options.chartData,
            $scope.options.tooltipLabel,
            $scope.options.color
          );
        };
        $scope.$watch('options', function (newVal, oldVal) {
          $timeout(function(){
            initChart();
          },100)
        },true);

      }
    };
  });

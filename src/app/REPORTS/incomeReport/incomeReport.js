'use strict';

angular.module('crm')
  .controller('incomeReportCtrl', function ($scope, $window, ReportsSetup, ChartInit) {

    ReportsSetup.commonOptions($scope, 'income', 'IncomeReport');
    
    angular.extend($scope.clientDatesOptions, {
      groupBySelectOptions: [
        {"id":0,"name":"BIN", "sName":"bin"},
        {"id":1,"name":"Amount", "sName":"amount"},
        {"id":2,"name":"Processor", "sName":"processor"},
        {"id":3,"name":"Affiliate", "sName":"affiliate"},
        {"id":4,"name":"Campaign", "sName":"campaign"}
      ]
    })

    ReportsSetup.incomeOptions($scope);

    $scope.piechartOptions1 = {
      text_transform: 'initial',
      percents: true,
      bg: '#bbb',
      color: 'grey',
      chartData: [],
      chartID: 1
    };

    $scope.piechartOptions2 = {
      text_transform: 'initial',
      percents: true,
      bg: '#bbb',
      color: 'grey',
      chartData: [],
      chartID: 2
    };


  })

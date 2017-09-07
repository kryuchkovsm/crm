'use strict';

angular.module('crm')
  .controller('processingReportCtrl', function ($scope, ReportsSetup, $rootScope) {

    $scope.portletHeaderOptions2 = {title: $rootScope.translate('reports.processingreport.processingreport.controller.processing-charts')};
    $scope.portletHeaderOptions3 = {title: $rootScope.translate('reports.processingreport.processingreport.controller.processing-details')};
    $scope.fields = {};
    $scope.clientsModel = [];
    $scope.sitesModel = [];
    $scope.sitesData = [{"SiteID":0,"Name":$rootScope.translate('reports.processingreport.processingreport.controller.no-clients-selected'), disabled: true}];

    // Pie chart
    $scope.piechartOptions = {
      percents: true,
      bg: '#bbb',
      color: 'grey',
      chartData: [],
      chartID: 1
    };

    $scope.barchartOptions = {
      chartData: [],
      height: 270,
      tooltipLabel: 'LIMIT',
      chartID: 2
    };

    ReportsSetup.commonOptions($scope, 'processing', 'ProcessingReport');
    ReportsSetup.processingOptions($scope);

  });

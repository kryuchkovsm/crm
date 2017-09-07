'use strict';

angular.module('crm')
  .controller('marketingReportCtrl', function ($scope, GlobalVars, ChartInit, 
  DataProcessing, $rootScope) {

    $scope.portletHeaderOptions1 = {title: $rootScope.t('reports.marketingreport.marketingreport.controller.search-clients')};
    $scope.portletHeaderOptions2 = {title: $rootScope.t('reports.marketingreport.marketingreport.controller.marketing-chart')};
    $scope.portletHeaderOptions3 = {title: $rootScope.t('reports.marketingreport.marketingreport.controller.marketing-details')};

    $scope.fields = {};
    $scope.clientsModel = [];
    $scope.sitesModel = [];
    $scope.sitesData = [{"SiteID":0,"Name":$rootScope.t('reports.marketingreport.marketingreport.controller.no-clients-selected'), disabled: true}];

    $scope.$watchCollection( "fields",
      function( newValue, oldValue ) {
        console.log( 'fields: ', $scope.fields );
      }
    );

    //  1st select
    $scope.clientsData = GlobalVars.commonObject().Clients;
    $scope.clientsSettings = {
      enableSearch: true,
      scrollableHeight: '100px',
      scrollable: true,
      idProp: 'ClientID',
      displayProp: 'CompanyName',
      selectName: $rootScope.t('common.clients')
    };
    $scope.$watchCollection("clientsModel",
      function(clients) {
        $scope.sitesData = DataProcessing.newMakeSites(clients, $scope.clientsData) || $scope.sitesData;
        $scope.sitesModel = DataProcessing.checkAvailableSites($scope.sitesModel, clients, $scope.clientsData)
      }
    );

    //  2nd select
    $scope.sitesSettings = {
      idProp: 'SiteID',
      displayProp: 'Name',
      enableSearch: true,
      scrollableHeight: '100px',
      scrollable: true,
      searchPlaceholder: $rootScope.t('reports.marketingreport.marketingreport.controller.type-site-name-here-or-select-from-list.'),
      selectName: $rootScope.t('common.sites')
    };
    $scope.$watchCollection( "sitesModel",
      function( newValue, oldValue ) {
        console.log( 'sites: ', $scope.sitesModel );
      }
    );

    $scope.fromDateOptions = {
      width: 110,
      label: 'From:',
      id: 304,
      inline: true
    };

    $scope.toDateOptions = {
      width: 110,
      label: 'To:',
      id: 305,
      inline: true
    };


    $scope.dottedLinechartOptions1 = {
      total: 154,
      tooltipLabel: 'Conversions',
      chartData: ChartInit.makeData('double'),
      chartID: 1,
      bottomBlock: false
    };

  });

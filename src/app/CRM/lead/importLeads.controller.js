'use strict';

angular.module('crm')
  .controller('ImportLeadsCtrl', function ($scope, $state, GlobalVars, ChartInit, 
  DataProcessing, DataStorage, $filter, $rootScope) {

    $scope.portletHeaderOptions1 = {title: $rootScope.translate('crm.lead.importleads.controller.options')};

    $scope.fields = {};
    $scope.clientsModel = [];
    $scope.sitesModel = [];
    $scope.sitesData = [{"SiteID":0,"Name":$rootScope.translate('crm.lead.importleads.controller.no-clients-selected'), disabled: true}];
    $scope.importSubmitted = false;

    $scope.dataForImport = [];
    $scope.filedDataForImport = [];
    $scope.$watch('csv.result', function(data){
      if (data) $scope.dataForImport.push(data)
    });

    $scope.showExcel = function () {

    };

    $scope.exit = function () {
      //$scope.dataForImport = [];
      //$scope.filedDataForImport = [];
      //$scope.$broadcast('clear-uploaded-files')
      $state.go('main.dashboard');
    };

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

    $scope.getHeader = function(row){
      return Object.keys(row.data[0])

    }

    $scope.$watchCollection( "clientsModel", function(clients) {
      $scope.sitesData = DataProcessing.newMakeSites(clients, $scope.clientsData);
      $scope.sitesModel = DataProcessing.checkAvailableSites($scope.sitesModel, clients, $scope.clientsData)
    });

    $scope.importData = function(){
      $scope.$broadcast('show-errors-reset');
      $scope.$broadcast('show-errors-check-validity', 'importLeadsForm');
      if ($scope.sitesModel.length>0 && $scope.sitesModel[0].Name != $rootScope.translate('crm.lead.importleads.controller.no-clients-selected')){
        $scope.importSubmitted = false
        _.each($scope.dataForImport, function(item, n){
          if (!item.imported){
            _.each(item.data, function(it, n){return item.data[n].SiteID = $scope.sitesData[0].SiteID})
            DataStorage.importLeads().post(JSON.parse(angular.toJson(item.data)), function(resp){
              $scope.dataForImport[n].imported = true;
              if (resp.Failed){
                $scope.dataForImport[n].failedLength = resp.Failed.length;
                _.each(resp.Failed, function(fail){
                  $scope.filedDataForImport.push($filter('filter')(item.data, {RowID: fail.RowID})[0])
                });
              }
              if (resp.Succeeded)
                $scope.dataForImport[n].succeededLength = resp.Succeeded.length;
            })
          }
        })
      }
    };

    //  2nd select
    $scope.sitesSettings = {
      idProp: 'SiteID',
      displayProp: 'Name',
      enableSearch: true,
      scrollableHeight: '156px',
      scrollable: true,
      searchPlaceholder: $rootScope.t('crm.lead.importleads.controller.type-site-name-here-or-select-from-list.'),
      selectName: $rootScope.t('common.sites'),
      showUncheckAll: false,
      showCheckAll: false,
      selectionLimit: 1,
      valRequired: true
    };

  });

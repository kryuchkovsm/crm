'use strict';

angular.module('crm')
  .controller('SearchCtrl', function ($scope, $state, DataStorage, GlobalVars, $filter,
  ScrollService, SearchSetup, DataProcessing, $timeout, resolvedIndex, $rootScope, $cacheFactory) {
    
    var searchObj = {};
    var serverDataChunkSize = 100;
    var totalFound = 0;
    var fromDate = new Date(new Date().setMonth(new Date().getMonth() - 3))

    var fieldOptions = SearchSetup.searchFormFields();
    if (resolvedIndex && !resolvedIndex.Status){
      fieldOptions.chargeTypeRLOptions.data = resolvedIndex.Index.ChargeTypes
      fieldOptions.transactionTypeRLOptions.data = resolvedIndex.Index.TransactionType
      fieldOptions.stepRLOptions.data = resolvedIndex.Index.StepType
      fieldOptions.orderTypeRLOptions.data = resolvedIndex.Index.OrderType
      fieldOptions.recurringStatusRLOptions.data = resolvedIndex.Index.RecurringStatus
      fieldOptions.accountNumberRLOptions.data = resolvedIndex.Index.AccountType
    }
    $scope.fieldOptions = angular.copy(fieldOptions);

    $scope.reset = function(formId){
      $scope.$broadcast('show-errors-reset')
      angular.element(formId).find('input[type="email"]').val('')
      $scope.showTable = false;
      $scope.notes = {};
      $scope.clientsModel = [];
      $scope.sitesModel = [];
      $scope.sitesData = [{"SiteID":0,"Name":$rootScope.t('crm.search.search.controller.no-clients-selected'), disabled: true}];
      $scope.customersDisplayed = [];
      $scope.fields = {
        fromDateValue: fromDate,
        toDateValue: new Date(),
        stepRLValue: {id: fieldOptions.stepRLOptions.data[0].id},
        transactionTypeRLValue: {id: fieldOptions.transactionTypeRLOptions.data[0].id},
        chargeTypeRLValue: {id: fieldOptions.chargeTypeRLOptions.data[0].id},
        recurringStatusRLValue: {id: fieldOptions.recurringStatusRLOptions.data[0].id},
        orderTypeRLValue: {id: fieldOptions.orderTypeRLOptions.data[0].id},
        accountNumberRLValue: {id: fieldOptions.accountNumberRLOptions.data[0].id}
      };

    };

    $scope.reset();

    //  1st select
    $scope.clientsData = GlobalVars.commonObject().Clients;
    $scope.clientsSettings = {
      enableSearch: true,
      scrollableHeight: '251px',
      scrollable: true,
      idProp: 'ClientID',
      displayProp: 'CompanyName',
      selectName: $rootScope.t('common.clients')
    };
    $scope.$watchCollection("clientsModel",
      function (clients) {
        $scope.sitesData = DataProcessing.newMakeSites(clients, $scope.clientsData) || $scope.sitesData;
        $scope.sitesModel = DataProcessing.checkAvailableSites($scope.sitesModel, clients, $scope.clientsData)
      }
    );

    //  2nd select
    $scope.sitesSettings = {
      idProp: 'SiteID',
      displayProp: 'Name',
      enableSearch: true,
      scrollableHeight: '251px',
      scrollable: true,
      searchPlaceholder: $rootScope.t('crm.search.search.controller.type-site-name-here-or-select-from-list.'),
      selectName: $rootScope.t('common.sites'),
    };

    $scope.search = function() {
      $scope.$broadcast('show-errors-reset')
      $timeout(function(){
        $scope.notes.sitesRequired = !$scope.fields.customerIdTxtValue && !$scope.fields.transactionIdTxtValue;
        $scope.notes.noRecords = false;
        $scope.$broadcast('show-errors-check-validity');
        if ($scope.customerSearchForm.$invalid || ($scope.notes.sitesRequired && $scope.sitesModel.length==0)) return;
        searchObj = SearchSetup.makeFields($scope.sitesModel, $scope.fields);
        searchObj.PageNumber = 1;
        searchObj.RowCount = serverDataChunkSize;
        var searchPromise = DataStorage.searchApi().post(searchObj).$promise;
        $scope.searching = true;
        searchPromise.then(
          function (reply) {
            $scope.searching = false;
            $scope.notes.sitesRequired = false;
            if (reply.Status) return false;
            // Update results table
            if (reply.CustomerGUID){
              $state.go('main.customer', {cuid: reply.CustomerGUID});
              return;
            }else
            if (reply && reply.Customers && reply.Customers.length) {
              $scope.customers = SearchSetup.makeCustomers(reply.Customers);
              totalFound = reply.Total;
              $scope.showTable = true;
              $scope.notes.noRecords = false;
            } else {
              $scope.customers = [];
              $scope.notes.noRecords = true;
              $scope.showTable = false
            }
            ScrollService.scrollTo('bottom');
          },
          function (error) {
            console.log(' search req error ', error);
          }
        );
      },100)
    };

    // Infinite pagination
    $scope.tablePageChange = function (newPage, itemsByPage) {
      var customers = [],
        serverPageNumber = 0,
        serverPageObj = DataProcessing.calcServerPageNew(newPage, itemsByPage, serverDataChunkSize, $scope.customers, totalFound);
      if (!serverPageObj.load) {
        return false;
      }
      serverPageNumber = serverPageObj.pageNumber;
      // Add data to table if the current table page is eq or more than 4 + serverPageNumber * 5
      searchObj.PageNumber = serverPageNumber;
      var searchPromise = DataStorage.searchApi().post(searchObj).$promise;
      searchPromise.then(
        function (reply) {
          if (reply.Status) return false;
          // Update results table
          if (reply && reply.Customers && reply.Customers.length) {
            var startPos = (serverPageNumber - 1) * serverDataChunkSize,
              itemsToRemove = serverDataChunkSize;

            customers = SearchSetup.makeCustomers(reply.Customers, startPos);
            $scope.customers = $scope.customers.concat(customers);
          }
        },
        function (error) {
          console.log(' search req error ', error);
        }
      );
    };
});

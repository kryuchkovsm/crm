'use strict';

angular.module('crm')
  .controller('periscopeTransactionReportCtrl', function (
  $scope, $state, $rootScope, GlobalVars, DataProcessing, $q, DataStorage, ScrollService) {

    $scope.portletHeaderOptions2 = {
      title: $rootScope.translate('reports.transactionreport.transactionreport.controller.list-of-transactions')
    };

    $scope.clientDatesOptions = {
      title: 'services.reports.reportssetup.choose-clients-and-sites'
    };
    $scope.clientDatesOptions.advancedSearch = true;

    var clients = _.map(GlobalVars.commonObject().Clients, function(client){
      return {id: client.ClientID}
    });
    $scope.autocompleteSitesData = DataProcessing.newMakeSites(clients, GlobalVars.commonObject().Clients)
    $scope.autocompleteClientsData = GlobalVars.commonObject().Clients

    var transactionGetDataPromise = function ($scope) {
      var cd = $scope.clientDatesValue,
          dateFrom = cd.fromDateValue ? DataProcessing.stringToDate(cd.fromDateValue) : defaultFrom,
          dateTo = cd.toDateValue ? DataProcessing.stringToDate(cd.toDateValue) : defaultTo,
          action = 'periscope/transaction',
          searchObj = {
            "SiteIDs": cd.sitesModel.map(function (item) {
              return item.id;
            }),
            "DateFrom": DataProcessing.dateToServer(dateFrom),
            "DateTo": DataProcessing.dateToServer(dateTo),
            "Status": cd.statusCheckBoxValue || [],
            "TransactionTypes": cd.transactionTypeCheckBoxValue || [],
            "TransactionID": cd.transactionIdTxtValue || null,
            "CustomerID": cd.customerIdTxtValue || null,
            "LastName": cd.lastNameTxtValue || null,
            "Email": cd.emailTxtValue || null,
            "CCLast4Digits": cd.last4digitsTxtValue || null,
            "ProcessorID": cd.processorIdTxtValue || null,
            "AffiliateID": cd.affiliateIdTxtValue || null,
            "AmountFrom": cd.amountTxtRangeValue && cd.amountTxtRangeValue[0] ? cd.amountTxtRangeValue[0] : "0",
            "AmountTo": cd.amountTxtRangeValue && cd.amountTxtRangeValue[1] ? cd.amountTxtRangeValue[1] : "0"
          };
      return DataStorage.reportsAnyApi(action).post(searchObj).$promise;
    };

    $scope.search = function () {
      var deferred = $q.defer();
      GlobalVars.setLoadingRequestStatus(true)
      var actionPromise = transactionGetDataPromise($scope);
      
      actionPromise.then(function (data) {
          deferred.resolve();
          GlobalVars.setLoadingRequestStatus(false)
          if (data.Status) {
            $scope.dataReady = 'No';
          } else {
            $scope.ReportURL = data.ReportURL;
          }
          ScrollService.scrollTo('bottom');
        }
      );
      return deferred.promise;
    };
    
})
.filter('trusted', ['$sce', function ($sce) {
  return function(url) {
    return $sce.trustAsResourceUrl(url);
  };
}]);

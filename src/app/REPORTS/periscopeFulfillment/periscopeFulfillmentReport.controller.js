'use strict';

angular.module('crm')
  .controller('periscopeFulfillmentReportCtrl', function (
  $scope, $state, $rootScope, GlobalVars, DataProcessing, $q, DataStorage, ScrollService) {

    $scope.portletHeaderOptions2 = {
      title: $rootScope.translate('reports.transactionreport.transactionreport.controller.list-of-transactions')
    };

    $scope.clientDatesOptions = {
      title: 'services.reports.reportssetup.choose-clients-and-sites'
    };

    var clients = _.map(GlobalVars.commonObject().Clients, function(client){
      return {id: client.ClientID}
    });
    $scope.autocompleteSitesData = DataProcessing.newMakeSites(clients, GlobalVars.commonObject().Clients)
    $scope.autocompleteClientsData = GlobalVars.commonObject().Clients

    var transactionGetDataPromise = function ($scope) {
      var cd = $scope.clientDatesValue;
      var dateFrom = cd.fromDateValue ? DataProcessing.stringToDate(cd.fromDateValue) : defaultFrom;
      var dateTo = cd.toDateValue ? DataProcessing.stringToDate(cd.toDateValue) : defaultTo;
      var action = 'periscope/fulfillment';
      var searchObj = {
        "SiteIDs": cd.sitesModel.map(function (item) {
          return item.id;
        }),
        "DateFrom": DataProcessing.dateToServer(dateFrom),
        "DateTo": DataProcessing.dateToServer(dateTo),
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

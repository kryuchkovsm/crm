'use strict';

angular.module('crm')
  .controller('transactionReportCtrl', function ($scope, $state, ReportsSetup, $rootScope) {
    $scope.portletHeaderOptions2 = {title: $rootScope.translate('reports.transactionreport.transactionreport.controller.list-of-transactions')};
    $scope.goToCustomer = function (id) {
      $state.go('main.customer', { cuid : id });
    };
    $scope.expandRow = function (row, expand) {
      row.expanded = expand;
    };
    ReportsSetup.commonOptions($scope, 'transaction', 'TransactionReport');
    ReportsSetup.transactionOptions($scope);
});

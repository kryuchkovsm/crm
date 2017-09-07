'use strict';
angular.module('crm')
  .controller('summaryDetailsCtrl',function($scope, data, close, DataStorage, $state, $filter, DataProcessing) {
    $scope.modalTitle = data.modalTitle;
    $scope.loading = true;

    $scope.normalizeName = function(name){
      return name
        .replace('recurring', 'recurring ')
        .replace('active', 'active ')
        .replace('sales', 'sales ')
    }


    DataStorage.anyApiMethod('/reports/details/'+data.method).post(data.query, function(resp){
      $scope.loading = false;
      if (resp && resp.Grid){
        resp.Grid = _.map(resp.Grid, function(row){
          if (row.TotalAmount || row.TotalAmount == 0)
            row.TotalAmount = '$' + parseFloat(row.TotalAmount).toFixed(2)
          if (row.Date)
            row.Date = DataProcessing.toDateFormat(row.Date*1000)
          return row;
        })
        $scope.productChargeData = resp.Grid;
        $scope.productChargeDataSafe = resp.Grid;
      }
    });

    $scope.unCamelCase = function(str){
      return str
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
        .replace(/^./, function(str){ return str.toUpperCase(); })
    };

    $scope.getKeys = function(obj){
      obj = obj || {};
      return Object.keys(JSON.parse(angular.toJson(obj)))
    };

    $scope.getHeader = function(obj){
      obj = obj || [];
      return Object.keys(JSON.parse(angular.toJson(obj)))
    };

    $scope.close = function(result) {
      close(result, 500);
    };
});

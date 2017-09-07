'use strict';
angular.module('crm')
  .controller('userActivityCtrl',function($scope, data, close, DataStorage) {
    $scope.data = data;

    $scope.loading = true;
    DataStorage.anyApiMethod('/reports/details/user').post(data.query, function(resp){
      if (resp && resp.Grid)
        $scope.gridSafe = resp.Grid
      $scope.loading = false;
    });

    $scope.close = function(result) {
      close(result, 500);
    };
});

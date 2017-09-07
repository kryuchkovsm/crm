'use strict';
angular.module('crm')
  .controller('ChargesReccuringsTableCtrl',function($scope, data, close) {
    $scope.modalTitle = data.modalTitle;
    $scope.groupChargesDataSafe = data.data;

    $scope.close = function(result) {
      close(result, 500); // close, but give 500ms for bootstrap to animate
    };
});

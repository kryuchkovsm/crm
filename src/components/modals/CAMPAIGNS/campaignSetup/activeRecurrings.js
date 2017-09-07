'use strict';
angular.module('crm')
  .controller('ActiveRecurringsCtrl',function($scope, data, close) {
    $scope.data = data;
    $scope.activeRecurringsSafe = angular.copy(data.activeRecurrings);

    $scope.close = function(result) {
      close(result, 500);
    };
});

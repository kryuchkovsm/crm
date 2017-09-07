'use strict';
angular.module('crm')
  .controller('ColorPickerCtrl',function($scope, data, close) {
    $scope.data = data;


    $scope.close = function(result) {
      if (!result) {
        $scope.showError = true
        return;
      }
      close(result, 500); // close, but give 500ms for bootstrap to animate
    };
});

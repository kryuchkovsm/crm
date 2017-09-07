/**
 * Created by user on 24.03.15.
 */
'use strict';
angular.module('crm')
  .controller('DeletePGConfirmationCtrl',function($scope, data, close) {
    $scope.data = data;
    $scope.close = close;
  });

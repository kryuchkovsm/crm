/**
 * Created by user on 25.03.15.
 */
'use strict';
angular.module('crm')
  .controller('DataModalCtrl',function($scope, close, data, $sce) {
    $scope.data = data;
    $scope.trustAsHtml = function(string) {
      return $sce.trustAsHtml(string);
    };

    $scope.close = function(result) {
      close(result, 500);
    };
  });

'use strict';

angular.module('crm')
  .controller('ConfirmModalCtrl',function($scope, close, data, $sce, $rootScope) {
    $scope.data = data;
    
    $scope.confirmTxtOptions = {
      label: $rootScope.t('modals.common.confirm.type-confirm'),
      id: 1,
      valRequired: true
    };
    
    $scope.trustAsHtml = function(string) {
      return $sce.trustAsHtml(string);
    };

    $scope.close = function(result) {
      close(result, 500);
    };
  });

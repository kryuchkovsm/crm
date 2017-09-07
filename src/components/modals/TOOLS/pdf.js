'use strict';
angular.module('crm')
  .controller('PDFModal',function($scope, data, close, $sce) {
    $scope.close = close
    $scope.data = data
    $scope.trustSrc = function(dataUrl){
      return $sce.trustAsResourceUrl(dataUrl)
    }
  });

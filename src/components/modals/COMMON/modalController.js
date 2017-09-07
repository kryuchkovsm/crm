'use strict';
angular.module('crm')
  .controller('ModalCtrl',function($scope, close, $sce) {

    // Common controller, may be used without passing any data (color tiles)
    $scope.trustAsHtml = function(string) {
      return $sce.trustAsHtml(string);
    };

    // when you need to close the modal, call close
    $scope.close = function(result) {
      close(result, 500); // close, but give 500ms for bootstrap to animate
    };
  });

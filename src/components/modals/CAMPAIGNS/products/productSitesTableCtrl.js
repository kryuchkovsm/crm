'use strict';
angular.module('crm')
  .controller('ProductSitesTableCtrl',function($scope, $state, data, close) {

    $scope.modalTitle = data.modalTitle;
    $scope.productSitesData = angular.copy(data.data);

    var unbind = $scope.$watchCollection(function () {
      return data.data;
    },
    function () {
      unbind();
      angular.copy(data.data, $scope.productSitesData);
    });
    $scope.editSite = function(id) {
      close(false, 500); // close, but give 500ms for bootstrap to animate
      $state.go('main.siteoptions', {ClientID: data.ClientID, SiteID: id})
    };

    // when you need to close the modal, call close
    $scope.close = function(result) {
      close(result, 500); // close, but give 500ms for bootstrap to animate
    };
});

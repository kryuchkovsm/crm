'use strict';
angular.module('crm')
  .controller('ProductChargeTableCtrl',function($scope, data, close, ModalService, DataStorage, SitesSetup, $rootScope) {
    $scope.modalTitle = data.modalTitle;
    $scope.disallowActions = data.disallowActions;
    $scope.productChargeData = angular.copy(data.data.Charges);
    $scope.productChargeDataSafe = angular.copy(data.data.Charges);
    $scope.closeNotices = false;
    $scope.noticeText = false;
    var productGroups = [];
    var fetchGroups = function(){
      DataStorage.productsAnyApi('index/' + data.ClientID).query(function(productsData){
        $scope.productChargeData = []
        $scope.productChargeDataSafe = []
        productGroups = [];
        _.each(productsData.GroupsWithCharges, function(gwCharge){
          var item = SitesSetup.createItem(gwCharge);
          productGroups.push(item);
          if (gwCharge.ID == data.data.ID){
            $scope.productChargeDataSafe = angular.copy(item.Charges)
            $scope.productChargeData = angular.copy(item.Charges)
          }
        });
      });
    }
    if (!$scope.productChargeData.length) $scope.noticeText = $rootScope.translate('modals.campaigns.products.productchargetablectrl.this-product-does-not-have-charges-yet');
    $scope.closeNotice = function () {
      $scope.closeNotices = true;
    };

    $scope.deleteCharge = function (chId) {
      ModalService.showModal({
        templateUrl: "components/modals/COMMON/sure.html",
        controller: "DataModalCtrl",
        inputs: {
          data: {
            modalTitle: $rootScope.translate('modals.campaigns.products.productchargetablectrl.delete-charge'),
            modalTxt: $rootScope.translate('modals.campaigns.products.productchargetablectrl.are-you-sure-you-want-to-delete-this-charge?')
          }
        }
      }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (result) {
          if (result === 'false') return false;
          var serverAction = 'deletecharge';
          var server = DataStorage.productsAnyApi(serverAction).post({"ChargeID": chId}).$promise;
          server.then(
            function (result) {
              if (result.Status) {
                $scope.noticeText = $rootScope.translate('modals.campaigns.products.productchargetablectrl.server-error!') + ' ' + result.ErrorMessage;
                $scope.closeNotices = false;
                return false;
              }
              fetchGroups()
              $scope.noticeText = $rootScope.translate('modals.campaigns.products.productchargetable.charge-deleted', {value: chId});
              $scope.closeNotices = false;
            },
            function (error) {
              $scope.noticeText = $rootScope.translate('modals.campaigns.products.productchargetablectrl.server-error!');
              $scope.closeNotices = false;
            }
          );
          return false;
        });
      });
    };

    $scope.active = true;

    $scope.addEditCharge = function (chargeID) {
      var serverAction = chargeID ? 'editcharge/' + chargeID : 'addcharge/' + data.ClientID;
      var server = DataStorage.productsAnyApi(serverAction).query().$promise;
      server.then(
        function (result) {
          if (result.Status) {
            $scope.noticeText = $rootScope.translate('modals.campaigns.products.productchargetablectrl.server-error!')+' ' + result.ErrorMessage;
            $scope.closeNotices = false;
            return false;
          }
          addEditModal(result, chargeID);
        },
        function (error) {
          $scope.noticeText = $rootScope.translate('modals.campaigns.products.productchargetablectrl.server-error!');
          $scope.closeNotices = false;
        }
      );
    };

    var addEditModal = function (result, chargeID) {
      var modalTitle = 'Create Charge';
      if (chargeID)
        modalTitle = 'Update Charge';
      ModalService.showModal({
        templateUrl: "components/modals/CAMPAIGNS/products/addEditCharge.html",
        controller: "AddEditChargeCtrl",
        windowClass: 'big-modal',
        inputs: {
          data: {
            serverData: result,
            modalTitle: modalTitle,
            ClientID: data.ClientID,
            chargeID: chargeID,
            productGroup: data.data
          }
        }
      }).then(function (modal) {
        modal.element.modal({
          backdrop: 'static',
          keyboard: false
        });
        modal.close.then(function (result) {
          if (result == 'false') return false;
          if (result.Status) {
            $scope.noticeText = result.ErrorMessage;
            $scope.closeNotices = false;
          }else if (result.saved){
            fetchGroups()
            $scope.noticeText = $rootScope.translate('modals.campaigns.products.productchargetable.charge-saved', {value:result.Name || '' });
            $scope.closeNotices = false;

          }
          return false;
        });
      });
    };


    // when you need to close the modal, call close
    $scope.close = function() {
      close({
        productGroups: productGroups
      }); // close, but give 500ms for bootstrap to animate
    };
});

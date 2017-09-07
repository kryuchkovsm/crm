'use strict';

angular.module('crm')
  .controller('MdfCtrl', function ($scope, $stateParams, resolvedMdfs, ModalService, DataStorage, DataProcessing, $timeout, $rootScope) {
    if (!$stateParams.clientID)
      return $rootScope.showSelectClientModal()

    $scope.mdfHeaderOptions = {title: 'Merchant Defined Fields', searchField: {cb: void(0)}};

    $scope.mdfsSafe = angular.copy(resolvedMdfs.MDFs)

    var fetch = function(){
      return DataStorage.mdfsAnyApi('/' + $stateParams.clientID).query(function(resp){
        if (resp && !resp.Status)
          DataProcessing.updateSafeArr(resp.MDFs, $scope.mdfsSafe, 'ID')
      });
    };

    $scope.addNewMdf = function () {
      ModalService.showModal({
        templateUrl: "components/modals/CAMPAIGNS/mdf/addNewMdf.html",
        controller: "AddNewMdfCtrl",
        inputs: {
          data: {
            modalTitle: 'Add Merchant Defined Field',
            ClientID: $stateParams.clientID,
            existingMdfs: angular.copy($scope.mdfsSafe)
          }
        }
      }).then(function (modal) {
        //it's a bootstrap element, use 'modal' to show it
        modal.element.modal({
          backdrop: 'static',
          keyboard: false
        });
        modal.close.then(function (result) {
          fetch()
          if (result === 'false') return false;
          return false;
        });
      });
    };

    $scope.editMerchantRow = function (row) {
      ModalService.showModal({
        templateUrl: "components/modals/CAMPAIGNS/mdf/editMdf.html",
        controller: "EditMdfCtrl",
        inputs: {
          data: {
            modalTitle: 'Edit Merchant Defined Field',
            row: row,
            existingMdfs: angular.copy($scope.mdfsSafe)
          }
        }
      }).then(function (modal) {
        //it's a bootstrap element, use 'modal' to show it
        modal.element.modal();
        modal.close.then(function (result) {
          fetch()
          if (result === 'false') return false;
          $scope.saved = true;
          $scope.savedMessage = result.msg;
          $timeout(function(){
            $scope.savedMessage = ''
          }, 3000)
          return false;
        });
      });
    };

    $scope.deleteMerchantRow = function (curID) {
      ModalService.showModal({
        templateUrl: "components/modals/COMMON/sure.html",
        controller: "DataModalCtrl",
        inputs: {
          data: {
            modalTitle: 'Delete Merchant Defined Field',
            modalTxt: 'Are you sure you want to delete this field?'
          }
        }
      }).then(function (modal) {
        //it's a bootstrap element, use 'modal' to show it
        modal.element.modal();
        modal.close.then(function (result) {
          if (result === 'false') return false;
          //console.log(' rules result ', result);

          $scope.saved = true;

          var serverAction = 'delete/' + curID;
          var server = DataStorage.mdfsAnyApi(serverAction).post().$promise;
          server.then(
            function (result) {
              fetch()
              if (result.Status)
                $scope.savedMessage = 'MDF ID: "' + curID + '" delete error! ' + result.ErrorMessage;
              $scope.savedMessage = 'MDF ID: "' + curID + '" successfully deleted!';
              $timeout(function(){
                $scope.savedMessage = ''
              }, 3000)
            },
            function (error) {
              //console.log('delete MDF error', error);
              $scope.savedMessage = 'MDF ID: "' + curID + '" delete error!' + error;
              $timeout(function(){
                $scope.savedMessage = ''
              }, 3000)
              return false;
            }
          );


          return false;
        });
      });
    };

  });

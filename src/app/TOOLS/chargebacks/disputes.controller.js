'use strict';

angular.module('crm')
  .controller('disputesCtrl', function ($scope, ChargebackSetup, ModalService, DataStorage, Notification, resolveDisputesCodes, DataProcessing, $rootScope) {
    $scope.portletHeaderOptions = {title: 'tools.chargebacks.disputes.controller.manage-disputes'};
    $scope.safeDisputes = []
    var fetch = function(cb){
      cb = cb || function(){};
      DataStorage.chargeBackSystemApi('disputes/index').query(function(resp){
        if (resp && !resp.Status)
          DataProcessing.updateSafeArr(resp.Disputes, $scope.safeDisputes, 'DisputeID');
        cb()
      })
    };
    fetch();

    $scope.addEditDispute = function(row){
      var modalTitle = $rootScope.translate('tools.chargebacks.disputes.controller.add-dispute');
      if (row)
        modalTitle = $rootScope.translate('tools.chargebacks.disputes.controller.edit-dispute');
      ModalService.showModal({
        templateUrl: "components/modals/TOOLS/editDispute.html",
        controller: "EditDisputeCtrl",
        inputs: {
          data: {
            modalTitle: modalTitle,
            dispute: row,
            codes: resolveDisputesCodes.Codes
          }
        }
      }).then(function (modal) {
        modal.element.modal({
          backdrop: 'static',
          keyboard: false
        });
        modal.close.then(function (result) {
          if (result && !result.Status) fetch(function(){
            var message = '';
            if (row)
              message = $rootScope.translate('tools.chargebacks.disputes.dispute-modified', {value: row.DisputeID})
            else
              message = $rootScope.translate('tools.chargebacks.disputes.dispute-added', {value: result.DisputeID})
            Notification.success({message: message, delay: 5000})
          });
        });
      });

    };

    $scope.deleteDispute = function(row){
      ModalService.showModal({
        templateUrl: "components/modals/COMMON/sure.html",
        controller: "DataModalCtrl",
        inputs: {
          data: {
            modalTitle: $rootScope.translate('tools.chargebacks.disputes.controller.delete-dispute'),
            modalTxt: $rootScope.translate('tools.chargebacks.disputes.sure-delete', {value: row.DisputeID})
          }
        }
      }).then(function (modal) {
        modal.element.modal({
          backdrop: 'static',
          keyboard: false
        });
        modal.close.then(function (result) {
          if (result === 'false') return false;
          DataStorage.anyApiMethod('/chargeback/disputes/delete/'+row.DisputeID).post({},function(resp){
            if (resp && !resp.Status){
              $scope.safeDisputes.splice($scope.safeDisputes.indexOf(row),1)
              Notification.success({message: $rootScope.translate('tools.chargebacks.disputes.dispute-deleted', {value: row.DisputeID}), delay: 5000})
            }
          })
        })
      });
    }
  });

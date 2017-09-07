'use strict';

angular.module('crm')
  .controller('chargebackCodesCtrl', function ($scope, resolvedCategories, ChargebackSetup, ModalService, DataStorage, Notification, $rootScope) {
    var fetch = function(cb){
      cb = cb || function(){}
      DataStorage.anyApiMethod('/chargeback/codes/index').query(function(resp){
        if (resp && resp.Codes){
          $scope.codes = resp.Codes;
          $scope.safeCodes = resp.Codes;
          cb()
        }
      })
    };
    $scope.categories = resolvedCategories.CodeCategories;
    fetch();

    $scope.deleteCode = function(row){
      ModalService.showModal({
        templateUrl: "components/modals/COMMON/sure.html",
        controller: "DataModalCtrl",
        inputs: {
          data: {
            modalTitle: $rootScope.translate('tools.chargebacks.chargebackcodes.controller.delete-chargeback-code'),
            modalTxt: $rootScope.translate('tools.chargebacks.chargebackcodes.sure-delete', {value: row.ChargebackCodeId})
          }
        }
      }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (result) {
          if (result === 'false') return false;
          DataStorage.anyApiMethod('/chargeback/codes/delete/'+row.ChargebackCodeId).post({}, function(resp){
            if (resp && !resp.Status){
              Notification.success({message: $rootScope.translate('tools.chargebacks.chargebackcodes.code-deleted', {value: row.ChargebackCodeId}), delay: 5000});
              $scope.codes = $scope.codes.filter(function(code){
                return code.ChargebackCodeId != row.ChargebackCodeId
              });
              $scope.safeCodes = $scope.safeCodes.filter(function(code){
                return code.ChargebackCodeId != row.ChargebackCodeId
              });
            }
          });
          return true;
        });
      });
    };

    $scope.addEditCode = function(row){
      var modalTitle = $rootScope.translate('tools.chargebacks.chargebackcodes.controller.add-code');
      if (row)
        modalTitle = $rootScope.translate('tools.chargebacks.chargebackcodes.controller.edit-code');
      ModalService.showModal({
        templateUrl: "components/modals/TOOLS/editCode.html",
        controller: "EditCodeCtrl",
        inputs: {
          data: {
            modalTitle: modalTitle,
            code: row,
            categories: $scope.categories
          }
        }
      }).then(function (modal) {
        modal.element.modal({
          backdrop: 'static',
          keyboard: false
        });
        modal.close.then(function(resp){
          if (resp && !resp.Status) {
            fetch(function(){
              var message = '';
              if (row)
                message = $rootScope.translate('tools.chargebacks.chargebackcodes.cb-modified', {value: row.ChargebackCodeId});
              else
                message = $rootScope.translate('tools.chargebacks.chargebackcodes.cb-added', {value: row.ChargebackCodeId})
              Notification.success({message: message, delay: 5000})
            });
          }
        });
      });
    };
  });

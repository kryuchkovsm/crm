'use strict';

angular.module('crm')
  .controller('editChargebackCtrl', function ($scope, $state, $stateParams, ChargebackSetup, DataProcessing,
                                              DataStorage, ModalService, GlobalVars, Notification, $rootScope) {
    $scope.portletHeaderOptions = {title: 'Chargeback Processing Information'};
    $scope.fields = {
      BlockCC: true,
      BlockIP: true,
      IsRetrieval: false,
      DateOfNotice: DataProcessing.toDateFormat(moment()),
      PdfPagesInformation: {
        cbCustomerDetail: true,
        cbDisputeInformation: true,
        cbOfferImage: true,
        cbTermsAndConditions: true,
        cbChargebackReceipt: true
      }
    };
    if ($state.params.transactionId)
      $scope.fields.TransactionID = $state.params.transactionId
    if ($state.params.c)
      $scope.fields.ChargebackGuid = $state.params.c

    $scope.transactionId = $state.params.transactionId
    $scope.cguid = $state.params.c
    $scope.siteID = $state.params.siteId;

    $scope.unCamelCase  = function(str){
      return str
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
        .replace(/^./, function(str){ return str.toUpperCase(); })
    };

    $scope.fieldOptions = ChargebackSetup.newChargebackOptions();
    $scope.dataReady = true;
    if ($state.params.transactionId || $state.params.c){
      var method = '/add/'+$state.params.transactionId
      if ($state.params.c)
        method = '/edit/'+$state.params.c
      $scope.dataReady = false;
      GlobalVars.setLoadingRequestStatus(true)
      DataStorage.anyApiMethod('/chargeback'+method).query(function(resp){
        GlobalVars.setLoadingRequestStatus(false)
        $scope.dataReady = true;
        if (resp && !resp.Status){
          $scope.fieldOptions.chargebackCodeSelectOptions.data = resp.ChargebackCodes
          $scope.cardholderInformation = resp.Chargeback.CardholderInformation
          console.log(resp.Chargeback)
          if (resp.Chargeback){
            if (resp.Chargeback.TransactionID)
              $scope.transactionId = resp.Chargeback.TransactionID
            angular.extend($scope.fields, resp.Chargeback)
            if (resp.Chargeback.DateOfNotice)
              $scope.fields.DateOfNotice = DataProcessing.dateFromServer(resp.Chargeback.DateOfNotice)
            if (resp.Chargeback.TransactionInformation){
              if (resp.Chargeback.TransactionInformation.TransactionDate)
                resp.Chargeback.TransactionInformation.TransactionDate = DataProcessing.dateFromServer(resp.Chargeback.TransactionInformation.TransactionDate)
              if (resp.Chargeback.TransactionInformation.SettlementDate)
                resp.Chargeback.TransactionInformation.SettlementDate = DataProcessing.dateFromServer(resp.Chargeback.TransactionInformation.SettlementDate)
            }

          }
        }
      });
    }

    $scope.changeValueForAll = function (value) {
      $scope.fields.PdfPagesInformation = {
          cbCustomerDetail: value,
          cbDisputeInformation: value,
          cbOfferImage: value,
          cbTermsAndConditions: value,
          cbChargebackReceipt: value
      }
    };

    $scope.toggleExtra = function (state) {
      $scope.showExtra = state;
    };

    $scope.newChargebackForm = {}

    var save = function(cb){
      var saveObj = angular.copy($scope.fields);
      saveObj.DateOfNotice = DataProcessing.dateToServer(DataProcessing.stringToDate(saveObj.DateOfNotice));
      if (saveObj.TransactionInformation.TransactionDate)
        saveObj.TransactionInformation.TransactionDate = DataProcessing.dateToServer(DataProcessing.stringToDate(saveObj.TransactionInformation.TransactionDate))
      if (saveObj.TransactionInformation.SettlementDate)
        saveObj.TransactionInformation.SettlementDate = DataProcessing.dateToServer(DataProcessing.stringToDate(saveObj.TransactionInformation.SettlementDate))
      delete saveObj.MerchantInformation
      delete saveObj.CardholderInformation
      DataStorage.anyApiMethod('/chargeback/' + ($state.params.transactionId ? 'add' : 'edit') ).post(saveObj, function(resp){
        if (resp && !resp.Status){
          Notification.success({message: $rootScope.translate('tools.chargebacks.editchargeback.controller.chargeback-has-been-successfully-saved'), delay: 5000})
          if (resp.ChargebackGuid)
            $state.go('main.editchargeback', { c: resp.ChargebackGuid});
          cb(resp.ChargebackGuid || $scope.fields.ChargebackGuid)
        }else cb(false)
      });
    };

    $scope.saveAndView = function () {
      $scope.submitted = true;
      $scope.$broadcast('show-errors-check-validity', 'newChargebackForm');
      if ($scope.newChargebackForm.$invalid) return;
      $scope.saving = true
      save(function(ChargebackGuid){
        if (!ChargebackGuid) {
          $scope.saving = false
          return
        }
        $scope.saving = true
        DataStorage.anyApiMethod('/chargeback/pdf/'+ ChargebackGuid).query(function(resp){
          $scope.saving = false
          if (resp && resp.PdfFile){
            ModalService.showModal({
              templateUrl: "components/modals/TOOLS/pdf.html",
              controller: "PDFModal",
              windowClass: 'big-modal',
              inputs: {
                data: {
                  dataPDF: "data:application/pdf;base64, " + resp.PdfFile
                }
              }
            }).then(function (modal) {
              modal.element.modal();
            });
          }
        })
      });
    };

    $scope.saveAndSend = function () {
      $scope.submitted = true;
      $scope.$broadcast('show-errors-check-validity', 'newChargebackForm');
      if ($scope.newChargebackForm.$invalid) return;
      $scope.saving = true
      save(function(ChargebackGuid){
        if (!ChargebackGuid) {
          $scope.saving = false
          return
        }
        $scope.saving = true
        DataStorage.anyApiMethod('/chargeback/send/'+ ChargebackGuid).post({}, function(resp){
          $scope.saving = false
          if (resp && !resp.Status)
            Notification.success({message: $rootScope.translate('tools.chargebacks.editchargeback.controller.chargeback-has-been-successfully-sent'), delay: 5000})
        })

      })
    };

    $scope.editMerchantInfo = function(){
      ModalService.showModal({
        templateUrl: "components/modals/TOOLS/merchantInfo.html",
        controller: "MerchantInfoModal",
        inputs: {
          data: {
            fields: $scope.fields.MerchantInformation || {}
          }
        }
      }).then(function (modal) {
        modal.element.modal({
          backdrop: 'static',
          keyboard: false
        });
        modal.close.then(function (result) {
          if (!result) return;
          angular.extend($scope.fields.MerchantInformation, result)
        });
      });

    }

});

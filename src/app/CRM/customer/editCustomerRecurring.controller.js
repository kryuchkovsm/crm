/**
 * Created by user on 4/7/15.
 */
'use strict';

angular.module('crm')
  .controller('EditCustomerRecurringCtrl',
  function ($scope, $state, $stateParams, $filter, resolvedRecurring, CustomerSetup, DataStorage, Notification, $document,
            DataProcessing, ScrollService, ModalService, $rootScope) {
    ScrollService.scrollTo('top');
    var recurring = resolvedRecurring.Recurring || {};
    $scope.intervalId = parseInt($stateParams.intervalid);
    if (recurring) {
      if (recurring.ChargeId)
        $scope.editingMode = true
      $scope.retries = recurring.RetriesInit;
    } else {
      $scope.retries = false;
    }

    $scope.cloneRetries = angular.copy($scope.retries)

    $scope.opened = {
      retries: false
    }
    $scope.fields = {};
    $scope.fields.retryAmountTxtValue = {};
    $scope.fieldOptions = recurring ? CustomerSetup.customerRecurringFieldOptions(recurring) : {};

    $scope.fields.retryTimeframeComboValue = [];
    if ($scope.retries)
      for (var i = 0; i < $scope.retries.length; i++) {
        var obj = $scope.retries[i];
        $scope.fields.retryAmountTxtValue[i + 1] = obj.Amount;
        $scope.fields.retryTimeframeComboValue[i + 1] = {};
        $scope.fields.retryTimeframeComboValue[i + 1].numberValue = obj.ChargeInterval;
        $scope.fields.retryTimeframeComboValue[i + 1].selectValue =
          obj.ChargeIntervalID ? $scope.fieldOptions.retryTimeframeComboOptions.data.filter(function (item) {
            return item.id === obj.ChargeIntervalID;
          })[0] : $scope.fields.retryTimeframeComboValue[i + 1].selectValue;
      }

    // Set values
    $scope.fields.chargeSelectValue = recurring.ChargeId;
    $scope.fields.amountTxtValue = recurring.Amount || 0;
    $scope.fields.subsequentChargeIntervealComboValue = {};
    $scope.fields.subsequentChargeIntervealComboValue.numberValue = recurring.SubsequentChargeIntervalValue || 0;
    $scope.fields.subsequentChargeIntervealComboValue.selectValue =
      recurring.SubsequentChargeIntervalType ? $scope.fieldOptions.subsequentChargeIntervealComboOptions.data.filter(function (item) {
        return item.id === recurring.SubsequentChargeIntervalType;
      })[0] : $scope.fields.subsequentChargeIntervealComboValue.selectValue;
    $scope.fields.retryAtemptIntervalValue = recurring.RetryAttemptNumber || 0;
    $scope.fields.chargeCountTxtValue = recurring.ChargeCount || 0;
    $scope.fields.totalChargesToRunTxtValue = recurring.TotalChargesToRun || 0;

    if (recurring && $scope.editingMode)
      $scope.fields.activeCheckboxValue = recurring.IsActive ? [{id: 320, name: 'ACTIVE?', value: true}] : [];
    else
      $scope.fields.activeCheckboxValue = [{id: 320, name: 'ACTIVE?', value: true}];

    if (recurring.NextChargeDueDate)
      $scope.fields.nextChargeDueDateValue = DataProcessing.toDateFormat(recurring.NextChargeDueDate * 1000);
    //else
    //  $scope.fields.nextChargeDueDateValue = DataProcessing.toDateFormat(moment());

    if (recurring.RetryChargeDueDate)
      $scope.fields.retryChargeDueDateValue = DataProcessing.toDateFormat(recurring.RetryChargeDueDate * 1000);

    $scope.resetAttempt = function(){
      DataStorage.resetAttemptsCustomerRecurring().post({
        "CustomerGuid": $stateParams.cuid,
        "CustomerIntervalID": $scope.intervalId
      }, function(resp){
        if (resp && resp.Status==0){
          $scope.fields.retryAtemptIntervalValue = 0;
          $scope.fields.retryChargeDueDateValue = '';
          Notification.success({message: $rootScope.translate('crm.customer.editcustomerrecurring.controller.recurring-information-has-been-updated'), delay: 5000})
        }
      })
    };

    $scope.chargeChanged = function(val){
      $scope.retries = angular.copy($scope.cloneRetries);
      if ($scope.fieldOptions.chargeSelectOptions && $scope.fieldOptions.chargeSelectOptions.data && $scope.fieldOptions.chargeSelectOptions.data.length){
        var prepopulated = $filter('filter')($scope.fieldOptions.chargeSelectOptions.data, {id: val})[0]
        if (prepopulated){
          $scope.fields.amountTxtValue = prepopulated.Amount || 0;
          if (prepopulated.SubsequentChargeTypeID){
            var filtered = $filter('filter')($scope.fieldOptions.subsequentChargeIntervealComboOptions.data, {id: prepopulated.SubsequentChargeTypeID})
            if (filtered.length)
              $scope.fields.subsequentChargeIntervealComboValue.selectValue = filtered[0]
          }else
            $scope.fields.subsequentChargeIntervealComboValue.selectValue = '';
          $scope.fields.subsequentChargeIntervealComboValue.numberValue = prepopulated.SubsequentChargeValue || 0
          if (prepopulated.Retries && prepopulated.Retries.length && $scope.retries && $scope.retries.length){
            angular.forEach($scope.retries, function(retry){
              var ret = $filter('filter')(prepopulated.Retries, {RetryAttemptNumber: retry.RetryAttemptNumber})
              if (ret.length && ret[0]) {
                angular.extend(retry, ret[0])
              }
            })
          }

        }
      }
    };

    $scope.save = function(transaction) {
      $scope.$broadcast('show-errors-check-validity', 'editCustomerRecurringForm');
      if ($scope.editCustomerRecurringForm.$invalid) {
        var someElement = angular.element('.ng-invalid').eq(0);
        if (someElement && someElement.length>0)
          $document.scrollToElementAnimated(someElement);
        return false;
      }

      var save = {},
        nextDate = $scope.fields.nextChargeDueDateValue,
        retryDate = $scope.fields.retryChargeDueDateValue,
        retries = [],
        customerId = $stateParams.cuid || '',
        saveObj = {
          "CustomerGuid": customerId,
          "ChargeId": $scope.fields.chargeSelectValue,
          "Amount": $scope.fields.amountTxtValue || 0,
          "SubsequentChargeIntervalType": $scope.fields.subsequentChargeIntervealComboValue.selectValue ? $scope.fields.subsequentChargeIntervealComboValue.selectValue.id : 61,
          "SubsequentChargeIntervalValue": $scope.fields.subsequentChargeIntervealComboValue.numberValue || 0,
          "TotalChargesToRun": $scope.fields.totalChargesToRunTxtValue || 0,
          "IsActive": $scope.fields.activeCheckboxValue && $scope.fields.activeCheckboxValue.length>0 ? $scope.fields.activeCheckboxValue[0].value : false,
          //"ChargeCount": $scope.fields.chargeCountTxtValue,
          "RetryAttemptNumber": $scope.fields.retryAtemptIntervalValue

        };

      if ($scope.intervalId && customerId)
        saveObj.CustomerIntervalID = angular.copy($scope.intervalId);

      if (nextDate)
        saveObj.NextChargeDueDate = DataProcessing.dateToServer(DataProcessing.stringToDate(nextDate));

      //for (var i = 0; i < $scope.retries.length; i++) {
      //  retries[i] = {
      //    "RetryAttemptNumber": i + 1,
      //    "ChargeInterval": $scope.fields.retryTimeframeComboValue[i + 1].numberValue || 0,
      //    "Amount": $scope.fields.retryAmountTxtValue[i + 1] || 0,
      //    "ChargeIntervalID": $scope.fields.retryTimeframeComboValue[i + 1].selectValue ? $scope.fields.retryTimeframeComboValue[i + 1].selectValue.id : 61
      //  };
      //}

      saveObj.Retries = angular.copy($scope.retries);
      if (retryDate)
        saveObj.RetryChargeDueDate = DataProcessing.dateToServer(DataProcessing.stringToDate(retryDate));
      var runtransaction = function(){
        if (transaction)
          $scope.savingTransaction = true
        else
          $scope.saving = true;
        save.then (function (data) {
            $scope.saving = false;
            $scope.savingTransaction = false;
            if (data && !data.Status){
              //$scope.editingMode = true;
              if (customerId && !$scope.intervalId)
                $state.go('main.customer', {cuid: $stateParams.cuid});
              if (data.Response)
                ModalService.showModal({
                  templateUrl: "components/modals/COMMON/sure.html",
                  controller: "DataModalCtrl",
                  inputs: {
                    data: {
                      hideProceedButton: true,
                      panelInfoClass: true,
                      cancelButtonText: 'EXIT',
                      modalTitle: $rootScope.translate('crm.customer.editcustomerrecurring.controller.response'),
                      modalTxt: $rootScope.translate('crm.customer.editcustomerrecurring.controller.gateway-response')+": " + data.Response
                    }
                  }
                }).then(function (modal) {
                  modal.element.modal();
                });
              else
                Notification.success({message: $rootScope.translate('crm.customer.editcustomerrecurring.controller.recurring-information-has-been-updated'), delay: 5000})
            }
          },
          function (error) {
            console.log('save error', error);
          }
        );
      };

      if (transaction){
        ModalService.showModal({
          templateUrl: "components/modals/COMMON/sure.html",
          controller: "DataModalCtrl",
          inputs: {
            data: {
              panelInfoClass: true,
              modalTitle: $rootScope.translate('crm.customer.editcustomerrecurring.controller.run-transaction-confirmation'),
              modalTxt: $rootScope.translate('crm.customer.editcustomerrecurring.controller.all-changes-will-be-saved.-do-you-really-want-to-run-the-recurring-transaction?')
            }
          }
        }).then(function (modal) {
          modal.element.modal();
          modal.close.then(function (result) {
            if (result == 'false') return;
            save = DataStorage.runTransactionCustomerRecurring().post(saveObj).$promise;
            runtransaction()
          });
        });
        return
      }else if (customerId && !$scope.intervalId)
        save = DataStorage.addCustomerRecurring().post(saveObj).$promise;
      else if (customerId && $scope.intervalId)
        save = DataStorage.editCustomerRecurring().post(saveObj).$promise;
      runtransaction()
    };

    $scope.close = function () {
      $state.go('main.customer', {cuid: $stateParams.cuid});
    };

  });

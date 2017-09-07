/**
 * Created by user on 24.03.15.
 */
'use strict';
angular.module('crm')
  .controller('EditProcessorCtrl',function($scope, data, close, ProcessorSetup, DataStorage, Notification, $rootScope) {
    $scope.modalTitle = data.modalTitle;
    $scope.fieldOptions = ProcessorSetup.processorCreateEditFormFields();

    if (data.rowData) {
      $scope.fields = {
        monthlyLimitTxtValue: data.rowData.MonthlyLimit ? parseInt(data.rowData.MonthlyLimit) : '',
        passwordTxtValue: data.rowData.Password ? data.rowData.Password : '',
        processorIdTxtValue: data.rowData.Processor_Id ? data.rowData.Processor_Id : '',
        processorNameTxtValue: data.rowData.ProcessorName ? data.rowData.ProcessorName : '',
        usernameTxtValue: data.rowData.Username ? data.rowData.Username : '',
        Processor_Id: data.rowData.Processor_Id
      };
      $scope.fieldOptions.currencyRLOptions.defaultID = $scope.fieldOptions.currencyRLOptions.data.filter(function (item) {
        return data.rowData.CurrencyKey === item.name;
      })[0].id;
      $scope.fieldOptions.stickyRLOptions.defaultID = data.rowData.IsSticky ? 23 : 24;
      $scope.fieldOptions.activeRLOptions.defaultID = data.rowData.IsActive ? 25 : 26;
    }

    $scope.save = function() {
      $scope.$broadcast('show-errors-check-validity');
      if ($scope.editProcessorForm.$invalid) return false;
      var saveObj = {};
      saveObj.ProcessorID = data.rowData.ProcessorID;
      // This proc id never used, but required
      saveObj.Processor_Id = $scope.fields.processorIdTxtValue;

      saveObj.Username = $scope.fields.usernameTxtValue || '';
      saveObj.Password = $scope.fields.passwordTxtValue || '';
      saveObj.ProcessorName = $scope.fields.processorNameTxtValue || '';
      saveObj.MonthlyLimit = $scope.fields.monthlyLimitTxtValue || '0';
      // Add CurrencyKey
      saveObj.CurrencyKey = $scope.fields.currencyRLValue ? $scope.fields.currencyRLValue.name : 'USD';
      saveObj.IsSticky = $scope.fields.stickyRLValue.name == 'Yes';
      saveObj.IsActive = $scope.fields.activeRLValue.name == 'Yes';

      var serverAction = 'editprocessor';
      var server = DataStorage.processorAnyApi(serverAction).post(saveObj).$promise;
      $scope.saving = true;
      server.then(
        function (result) {
          $scope.saving = false;
          if (result.Status) {
            close(false, 500);
          }else{
            Notification.success({message: $rootScope.translate('modals.campaigns.processor.editprocessor.processor-updated', {value: saveObj.ProcessorID}), delay: 5000})
            close(result, 500);
          }
        },
        function (error) {
          close(false, 500);
        }
      );
    };

    // when you need to close the modal, call close
    $scope.close = function(result) {
      close(result, 500); // close, but give 500ms for bootstrap to animate
    };
  });

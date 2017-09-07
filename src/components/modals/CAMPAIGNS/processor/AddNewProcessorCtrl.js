/**
 * Created by user on 24.03.15.
 */
'use strict';
angular.module('crm')
  .controller('AddNewProcessorCtrl',function($scope, data, close, ProcessorSetup, DataStorage, $rootScope) {

    var initOptions = function(){
      $scope.fields = {};
      $scope.fieldOptions = ProcessorSetup.processorCreateEditFormFields();
      $scope.fieldOptions.stickyRLOptions.defaultID = 24;
      $scope.saved = false;
      $scope.error = false;
    }

    initOptions()

    $scope.modalTitle = data.modalTitle;

    $scope.save = function() {
      $scope.$broadcast('show-errors-check-validity');
      if ($scope.addProcessorForm.$invalid) {
        $scope.saved = false;
        return false;
      }

      var saveObj = {};
      // ClientID required for add only
      saveObj.ClientID = data.ClientID;

      // This proc id never used, but required
      saveObj.Processor_Id = $scope.fields.processorIdTxtValue || '';
      saveObj.Username = $scope.fields.usernameTxtValue || '';
      saveObj.Password = $scope.fields.passwordTxtValue || '';
      saveObj.ProcessorName = $scope.fields.processorNameTxtValue || '';
      saveObj.MonthlyLimit = $scope.fields.monthlyLimitTxtValue || '0';
      // Add CurrencyKey
      saveObj.CurrencyKey = $scope.fields.currencyRLValue ? $scope.fields.currencyRLValue.name : 'USD';
      saveObj.IsSticky = $scope.fields.stickyRLValue.name == 'Yes';
      //saveObj.IsActive = $scope.fields.activeRLValue.name == 'Yes';

      var serverAction = 'addprocessor';
      var server = DataStorage.processorAnyApi(serverAction).post(saveObj).$promise;
      server.then(
        function (result) {
          if (result.Status) {
            $scope.saved = false;
            $scope.error = true;
            $scope.errorMessage = 'Server error: ' + result.ErrorMessage;
            return false;
          }
          $scope.$broadcast('show-errors-reset');
          $scope.savedMessage = $rootScope.translate('modals.campaigns.processor.addnewprocessor.processor-added', {value: $scope.fields.processorIdTxtValue})
          $scope.saved = true;
        },
        function (error) {
          $scope.saved = false;
          $scope.error = true;
          $scope.errorMessage = 'Server error: ' + error;
          return false;
        }
      );
      //close(result, 500);
    };

    $scope.addAnother = initOptions;

    // when you need to close the modal, call close
    $scope.close = function(result) {
      close(result, 500); // close, but give 500ms for bootstrap to animate
    };
  });

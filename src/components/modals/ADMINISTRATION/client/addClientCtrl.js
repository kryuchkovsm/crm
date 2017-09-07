/**
 * Created by user on 24.03.15.
 */
'use strict';
angular.module('crm')
  .controller('AddClientModalCtrl',function($scope, data, close, ClientSetup, DataStorage, GlobalVars, $rootScope) {
    $scope.fields = {};
    $scope.customerDetails = {};
    $scope.saved = false;

    $scope.modalTitle = data.modalTitle;

    $scope.inputOptions = ClientSetup.clientAddNewFormFields();

    $scope.save = function(result) {
      $scope.$broadcast('show-errors-check-validity', 'addForm');
      if ($scope.addForm.$invalid) {
        $scope.saved = false;
        return false;
      }

      var saveObj = {
        "FirstName": result.firstnameTxtValue,
        "LastName": result.lastnameTxtValue,
        "CompanyName": result.companynameTxtValue,
        "Address1": result.address1TxtValue,
        "Address2": result.address2TxtValue,
        "City": result.cityTxtValue,
        "State": result.stateTxtValue,
        "ZipCode": result.zipTxtValue,
        "Email": result.emailTxtValue,
        "Phone": result.phoneTxtValue
      };

      //cosnol
      var save = DataStorage.addClientApi().post(saveObj).$promise;
      $scope.saving = true;
      save.then (
        function (data) {
          $scope.errorMessage = '';
          if (data.Status) {
            $scope.saving = false;
            if (data.ErrorMessage && data.ErrorMessage.length)
              $scope.errorMessage = data.ErrorMessage[0]
            $scope.saved = false;
            return false;
          }

          $scope.saving = false;
          $scope.savedMessage = $rootScope.t('modals.administration.client.addclient.saved', {value: saveObj.CompanyName});
          $scope.saved = true;
        },
        function (error) {
          if (error && error.ErrorMessage)
            $scope.errorMessage = error.ErrorMessage[0]
          $scope.saved = false;
        }
      );
    };

    $scope.addAnother = function() {
      $scope.customerDetails = {};
      $scope.fields = {};
      $scope.saved = false;
    };

    // when you need to close the modal, call close
    $scope.close = function(result) {
      close(result, 500); // close, but give 500ms for bootstrap to animate
    };
  });

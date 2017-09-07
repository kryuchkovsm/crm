/**
 * Created by user on 24.03.15.
 */
'use strict';
angular.module('crm')
  .controller('AddNewMdfCtrl',function($scope, data, close, DataStorage, $filter, $rootScope) {
    $scope.existingMdfs = data.existingMdfs || [];
    $scope.fields = {};
    $scope.saved = false;
    $scope.submitted = false;

    $scope.modalTitle = data.modalTitle;

    $scope.nameTxtOptions = {
      label: 'NAME:',
      id: 1,
      valRequired: true
    };
    $scope.save = function() {
      $scope.submitted=true;
      if ($scope.addMdfForm.$invalid || $filter('filterByField')($scope.existingMdfs, {Name: $scope.fields.nameTxtValue}).length) return;
      var saveObj = {};
      saveObj.ClientID = data.ClientID;
      saveObj.Name = $scope.fields.nameTxtValue || '';

      var serverAction = 'add';
      var server = DataStorage.mdfsAnyApi(serverAction).post(saveObj).$promise;
      $scope.saving = true;
      server.then(
        function (result) {
          $scope.saving = false;
          if (result.Status) {
            $scope.saved = false;
            $scope.error = true;
            $scope.errorMessage = 'Server error: ' + result.ErrorMessage;
            return false;
          }
          $scope.savedMessage =  $rootScope.translate('modals.campaigns.mdf.addnewmdf.saved', {value: saveObj.Name});
          $scope.saved = true;
        },
        function (error) {
          $scope.saving = false;
          $scope.saved = false;
          $scope.error = true;
          $scope.errorMessage = 'Server error: ' + error;
          return false;
        }
      );
    };

    $scope.addAnother = function() {
      $scope.fields = {};
      $scope.saved = false;
      $scope.submitted = false;
    };

    // when you need to close the modal, call close
    $scope.close = function(result) {
      close(result, 500); // close, but give 500ms for bootstrap to animate
    };
  });

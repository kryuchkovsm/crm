/**
 * Created by user on 24.03.15.
 */
'use strict';
angular.module('crm')
  .controller('EditMdfCtrl',function($scope, data, close, DataStorage, $filter, $rootScope) {
    $scope.existingMdfs = data.existingMdfs || [];

    $scope.fields = {};
    if (data.row && data.row.Name){
      $scope.existingMdfs = (data.existingMdfs || []).filter(function(t){
        return t.Name != data.row.Name
      })
      $scope.fields.nameTxtValue = data.row.Name;
    }
    $scope.modalTitle = data.modalTitle;

    $scope.nameTxtOptions = {
      label: 'NAME:',
      id: 1,
      valRequired: true
    };

    $scope.save = function() {
      $scope.submitted=true;
      if ($scope.editMdfForm.$invalid || $filter('filterByField')($scope.existingMdfs, {Name: $scope.fields.nameTxtValue}).length) return;
      var saveObj = {};
      saveObj.MdfID = data.row.ID;
      saveObj.Name = $scope.fields.nameTxtValue || '';

      var serverAction = 'edit';
      var server = DataStorage.mdfsAnyApi(serverAction).post(saveObj).$promise;
      $scope.saving = true;
      server.then(
        function (result) {
          $scope.saving = false;
          if (result.Status)
            close({error: true, msg: result.ErrorMessage}, 500);
          $scope.savedMessage = $rootScope.translate('modals.campaigns.mdf.editmdf.saved', {value: saveObj.Name});
          close({error: false, msg: $scope.savedMessage}, 500);
        },
        function (error) {
          $scope.saving = false;
          close({error: true, msg: error}, 500);
          return false;
        }
      );
    };

    // when you need to close the modal, call close
    $scope.close = function(result) {
      close(result, 500); // close, but give 500ms for bootstrap to animate
    };
  });

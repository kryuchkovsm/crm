/**
 * Created by user on 24.03.15.
 */
'use strict';
angular.module('crm')
  .controller('addEditCBCCCtrl',function($scope, data, close, DataStorage) {
    if (data.cbCC)
      angular.extend(data.cbCC, {
        Name: data.cbCC.CategoryName,
        DisputeID: data.cbCC.DisputeId
      })
    else data.cbCC = {};
    $scope.cbCodeCategory = angular.copy(data.cbCC)
    $scope.data = angular.copy(data);
    $scope.submittedCbCC = false;

    $scope.insert = function (form) {
      $scope.newChargebackCodeAdded = false;
      if (form.$invalid) return false
      var method = 'codecategories/add';
      var saveObj = angular.copy($scope.cbCodeCategory)
      if ($scope.cbCodeCategory.CategoryID)
        method = 'codecategories/edit';
      DataStorage.chargeBackSystemApi(method).post(saveObj, close)
    };

    $scope.close = close;
  });

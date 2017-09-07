/**
 * Created by user on 24.03.15.
 */
'use strict';
angular.module('crm')
  .controller('EditCodeCtrl',function($scope, data, close, DataStorage) {
    data.code = data.code || {};
    $scope.data = angular.copy(data);

    $scope.save = function(form){
      if (form.$invalid) return;
      var method = 'codes/add';
      var editObj = {
        CategoryID: $scope.data.code.CategoryId,
        Description: $scope.data.code.ChargebackCodeDesc,
        SortOrder: $scope.data.code.SortOrder
      };

      if ($scope.data.code.ChargebackCodeId){
        method = 'codes/edit';
        editObj.CodeID = $scope.data.code.ChargebackCodeId;
      }
      DataStorage.chargeBackSystemApi(method).post(editObj, close)
    };

    $scope.close = close;
  });

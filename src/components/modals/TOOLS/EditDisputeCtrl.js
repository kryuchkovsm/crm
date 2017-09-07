/**
 * Created by user on 24.03.15.
 */
'use strict';
angular.module('crm')
  .controller('EditDisputeCtrl',function($scope, data, close, DataStorage) {
    $scope.dispute = {}
    if (data.dispute){
      DataStorage.anyApiMethod('/chargeback/disputes/edit/'+data.dispute.DisputeID).query(function(resp){
        if (resp && !resp.Status){
          $scope.dispute = resp.Dispute;
          $scope.dispute.DisputeID = data.dispute.DisputeID;
        }
      })
    }
    $scope.data = data;

    $scope.save = function(form) {
      if (form.$invalid) return false;
      var saveObj = angular.copy($scope.dispute)
      var method = 'disputes/add';
      if ($scope.dispute.DisputeID)
        method = 'disputes/edit';
      DataStorage.chargeBackSystemApi(method).post(saveObj, close);
    };

    $scope.close = close;
  });

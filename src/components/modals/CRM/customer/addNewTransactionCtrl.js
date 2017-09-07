'use strict';
angular.module('crm')
  .controller('AddNewTransactionCtrl',function($scope, data, close, $filter, DataStorage) {
    $scope.modalTitle = data.modalTitle;
    $scope.groupsWithCharges = angular.copy(data.groupsWithCharges);
    $scope.fields = {
      CustomerGuid: data.CustomerGuid
    };
    $scope.toggleGroup = function(group){
      group.checked = !group.checked
      angular.forEach(group.Charges, function(charge){
        charge.checked = group.checked
      })
    };

    $scope.toggleCharge = function(charge, group){
      charge.checked=!charge.checked
      group.checked = !$filter('filter')(group.Charges || [], {checked: '!true'}).length
    };

    $scope.getAmount = function(group){
      var amount = 0;
      _.each(group.Charges, function(charge){
        if (charge.Amount && parseFloat(charge.Amount)) amount += parseFloat(charge.Amount)
      })
      return amount.toFixed(2)
    };

    $scope.active = true;

    $scope.save = function () {
      $scope.fields.Charges = [];
      angular.forEach($scope.groupsWithCharges, function(group){
        angular.forEach(group.Charges, function(charge){
          if (charge.checked)
            $scope.fields.Charges.push({
              ChargeId: charge.ChargeId,
              Amount: charge.Amount
            })
        });
      });
      if (!$scope.fields.Charges.length) return;
      $scope.processing = true
      DataStorage.customerAddTransactionApi().post($scope.fields, function(resp){
        if (resp && !resp.Status)
          close(resp, 500);
      });
    };

    $scope.close = function() {
      close(false, 500);
    };

});

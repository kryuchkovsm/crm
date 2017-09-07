/**
 * Created by user on 04.04.15.
 */
'use strict';

angular.module('crm')
  .controller('EditCustomerCtrl',

  function ($scope, $state, CustomerSetup, resolvedCustomer, DataStorage, $stateParams, $timeout, $document) {
    $scope.fields = {};
    $scope.showSuccess = false;
    $scope.showError = false;
    $scope.customerDetails = resolvedCustomer.Customer;
    $scope.fieldOptions = CustomerSetup.customerFieldOptions($scope.customerDetails);


    $scope.fields = $scope.customerDetails ? CustomerSetup.setFieldValues($scope.customerDetails) : {};

    $scope.toggleCustomerDetails = function () {
      if ($scope.customerDetailsShown) {
        $scope.customerDetailsShown = false;
        return false;
      }
      $scope.customerDetailsShown = true;
      return false;
    };

    $scope.save = function (result) {
      $scope.status = {};
      $scope.$broadcast('show-errors-check-validity');
      if ($scope.editCustomerForm.$invalid) {
        $timeout(function(){
          var someElement = angular.element('.ng-invalid').eq(0);
          if (someElement && someElement.length)
            $document.scrollToElementAnimated(someElement, 50);
        },100);

        $scope.status.errorValidation = true;
        return false;
      }
      var saveObj = CustomerSetup.makeSaveObject($scope.fields);
      saveObj.CustomerGuid = $scope.customerDetails.CustomerGuid;
      var saveCustomer = DataStorage.editCustomerApi().post(saveObj).$promise;
      saveCustomer.then(
        function (resp) {
          if (resp && resp.Status == 0){
            $scope.status.success = true;
          }
        },
        function (error) {
          console.log('customer save error', error);
          $scope.status.errorServer = true;
        }
      );
    };

    $scope.close = function () {
      $state.go('main.customer', {cuid: $stateParams.cuid, openForm: true});
    };

  });

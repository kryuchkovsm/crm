/**
 * Created by user on 24.03.15.
 */
'use strict';
angular.module('crm')
  .controller('AddProductGroupCtrl',function($scope, data, close, DataStorage, Notification, $rootScope) {
    $scope.modalTitle = data.modalTitle;
    $scope.fields = {};
    $scope.data = data;
    $scope.saved = false;
    $scope.nameTxtOptions = {
      label: 'NAME:',
      id: 1,
      valRequired: true
    };

    $scope.activeRLOptions = {
      label: $rootScope.t('campaigns.products.products.active'),
      data: [{"id":1,"name":"Yes", checked: true}, {"id":2,"name":"No"}]
    };

    var action, obj, server;

    // Add or Edit
    if (data.groupToEdit) {
      action = 'editgroup';
      $scope.fields.nameTxtValue = data.groupToEdit.Name;
      $scope.fields.activeRLValue = $scope.activeRLOptions.data.filter(function (item) {
        var id = data.groupToEdit.IsActive ? 1 : 2;
        var result = id === item.id;
        result ?  item.checked = 'checked' : item.checked = '';
        return result;
      })[0];
    } else {
      action = 'addgroup';
    }

    $scope.save = function(result) {
      $scope.$broadcast('show-errors-check-validity');
      if ($scope.addProductGroupForm.$invalid) {
        $scope.saved = false;
        return false;
      }

      obj = {
        Name: $scope.fields.nameTxtValue,
        IsActive: $scope.fields.activeRLValue && $scope.fields.activeRLValue.name === 'Yes' ? true : false
      };

      if (action === 'addgroup') {
        obj.ClientID = data.ClientID;
      } else {
        obj.ProductGroupID = data.groupToEdit.ID;
      }

      server = DataStorage.productsAnyApi(action).post(obj).$promise;
      server.then(
        function (result) {
          $scope.$broadcast('show-errors-reset');

          if (result.Status) {
            $scope.savedMessage = $rootScope.translate('modals.campaigns.products.addproductgroup.save-error', {value: obj.Name});
            $scope.saved = true;
            return false;
          }
          $scope.savedMessage = $rootScope.translate('modals.campaigns.products.addproductgroup.save-success', {value: obj.Name});
          if (action == 'addgroup'){
            $scope.saved = true;
          }else{
            Notification.success({message: $scope.savedMessage, delay: 5000})
            close(null, 500)
          }
        },
        function (error) {
          $scope.$broadcast('show-errors-reset');
          $scope.savedMessage = $rootScope.translate('modals.campaigns.products.addproductgroup.save-error', {value: obj.Name});
          $scope.saved = true;
        }
      );
    };

    $scope.addAnother = function() {
      $scope.fields = {};
      $scope.saved = false;
    };

    // when you need to close the modal, call close
    $scope.close = function(result) {
      close(result, 500); // close, but give 500ms for bootstrap to animate
    };
  });

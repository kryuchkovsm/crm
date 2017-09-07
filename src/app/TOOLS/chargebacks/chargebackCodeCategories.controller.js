'use strict';

angular.module('crm')
  .controller('chargebackCodeCategoriesCtrl', function ($scope, $timeout, ChargebackSetup, DataStorage, ModalService, Notification, $rootScope) {
    var fetch = function(cb){
      cb = cb || function(){};
      DataStorage.chargeBackSystemApi('codecategories/index').query(function(resp){
        $scope.codeCategories = resp.CodeCategories;
        $scope.safeCodeCategories = resp.CodeCategories;
        $scope.disputes = resp.Disputes;
        cb()
      })
    };
    fetch();
    $scope.editRow = [];

    $scope.addEditCBCC = function(row){
      var modalTitle = $rootScope.translate('tools.chargebacks.chargebackcodecategories.controller.add-chargeback-code-category')
      if (row)
        modalTitle = $rootScope.translate('tools.chargebacks.chargebackcodecategories.controller.edit-chargeback-code-category')
      ModalService.showModal({
        templateUrl: "components/modals/TOOLS/addEditCBCC.html",
        controller: "addEditCBCCCtrl",
        inputs: {
          data: {
            modalTitle: modalTitle,
            cbCC: row,
            disputes: $scope.disputes
          }
        }
      }).then(function (modal) {
        modal.element.modal({
          backdrop: 'static',
          keyboard: false
        });
        modal.close.then(function(resp){
          if (resp && !resp.Status){
            fetch(function(){
              var message = '';
              if (row)
                message = $rootScope.translate('tools.chargebacks.chargebackcodecategories.cb-modified', {value: row.CategoryName});
              else
                _.each($scope.safeCodeCategories, function(cC){
                  if (cC.CategoryID == resp.CategoryID){
                    message = $rootScope.translate('tools.chargebacks.chargebackcodecategories.cb-added', {value: cC.CategoryName});
                  }
                });
              Notification.success({message: message, delay: 5000})
            })
          }
        });
      });
    };

    $scope.getCopy = function(row){
      return angular.copy(row)
    };
  });

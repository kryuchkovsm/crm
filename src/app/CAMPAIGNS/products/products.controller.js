'use strict';

angular.module('crm')
  .controller('ProductsCtrl', function ($scope, $stateParams, SitesSetup, ModalService, 
    DataStorage, GlobalVars, Notification, $rootScope) {
  
    if (!$stateParams.clientID)
      return $rootScope.showSelectClientModal()

    $scope.productGroupsHeaderOptions = {title: 'Product Groups', searchField: {cb: void(0)}};

    $scope.closeNotice = function () {
      $scope.errorMessage = false;
      $scope.noProductGroupsMessage = false;
    };
    $scope.productGroups = [];
    $scope.productGroupsSafe = [];

    var fetch = function(cb){
      cb = cb || function(){};
      DataStorage.productsAnyApi('index/' + $stateParams.clientID).query(function(resolvedProducts){
        processResult(resolvedProducts);
        cb()
      })
    };

    GlobalVars.setLoadingRequestStatus(true)
    fetch(function(){
      GlobalVars.setLoadingRequestStatus(false)
    });

    var processResult = function(resolvedProducts){
      if (resolvedProducts.Status == 0){

        var fetchedGroups = [];
        _.each(resolvedProducts.GroupsWithCharges, function(group){
          fetchedGroups.push(SitesSetup.createItem(group))
        });

        $scope.productGroupsSafe = angular.copy(fetchedGroups);

      }else{
        if(resolvedProducts.Status === 1)
          $scope.errorMessage = resolvedProducts.ErrorMessage[0];

        if(resolvedProducts.GroupsWithCharges && !resolvedProducts.GroupsWithCharges.length )
          $scope.noProductGroupsMessage = "The client does not have Product Groups";
      }
    };

    $scope.showCharges = function (productGroup) {
      ModalService.showModal({
        templateUrl: "components/modals/CAMPAIGNS/products/productChargeTable.html",
        controller: "ProductChargeTableCtrl",
        windowClass: 'big-modal',
        inputs: {
          data: {
            modalTitle: 'Product Charges',
            ClientID: $stateParams.clientID,
            data: productGroup
          }
        }
      }).then(function (modal) {
        modal.element.modal({
          backdrop: 'static',
          keyboard: false
        });
        modal.close.then(function(){
          fetch()
        });
      });
    };

    var deletePG = function(row){
      DataStorage.anyApiMethod('/products/group/delete/'+row.ID).post({}, function(resp){
        if (resp && !resp.Status){
          Notification.success({message: 'Product group ' + row.Name + ' has been deleted', delay: 5000});
          var index = $scope.productGroupsSafe.indexOf(row)
          if (index != -1)
            $scope.productGroupsSafe.splice(index,1)
        }
      });
    };

    $scope.dumpUntiedGroups = function (row) {
      ModalService.showModal({
        templateUrl: "components/modals/COMMON/confirm.html",
        controller: "ConfirmModalCtrl",
        inputs: {
          data: {
            modalTitle: $rootScope.t('campaigns.products.products.dump-modal-title'),
            modalTxt: $rootScope.t('campaigns.products.products.dump-modal-text'),
          }
        }
      }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (result) {
          if (result === 'false') 
            return false;

          var url = '/products/group/delete/alluntied/' + $stateParams.clientID;
          DataStorage.anyApiMethod(url).post(function(resp){
            if (resp.Status == 0){
            	Notification.success({message: $rootScope.t('campaigns.products.products.dump-success'), delay: 5000});
              fetch();
            }
          });

        });
      });
    }

    $scope.deletePG = function (row) {
      DataStorage.anyApiMethod('/products/group/delete/confirmation/'+row.ID).query(function(resp){
        if (resp && resp.SitesAffected && resp.SitesAffected.length){
          ModalService.showModal({
            templateUrl: "components/modals/CAMPAIGNS/products/deletePGConfirmation.html",
            controller: "DeletePGConfirmationCtrl",
            inputs: {
              data: {
                groupName: row.Name,
                groupID: row.ID,
                SitesAffected: resp.SitesAffected
              }
            }
          }).then(function (modal) {
            modal.element.modal();
            modal.close.then(function (result) {
              if (!result) return false;
              deletePG(row)
            });
          });
        }else{
          ModalService.showModal({
            templateUrl: "components/modals/COMMON/sure.html",
            controller: "DataModalCtrl",
            inputs: {
              data: {
                modalTitle: 'Delete Product Group',
                modalTxt: 'Are you sure you want to delete product group: '+row.Name+' ?'
              }
            }
          }).then(function (modal) {
            modal.element.modal();
            modal.close.then(function (result) {
              if (result === 'false') return false;
              deletePG(row)
            });
          });
        }
      })
    };

    $scope.showSites = function (sites) {
      ModalService.showModal({
        templateUrl: "components/modals/CAMPAIGNS/products/productSitesTable.html",
        controller: "ProductSitesTableCtrl",
        windowClass: 'big-modal',
        inputs: {
          data: {
            modalTitle: 'Product Sites',
            ClientID: $stateParams.clientID,
            data: sites
          }
        }
      }).then(function (modal) {
        //it's a bootstrap element, use 'modal' to show it
        modal.element.modal();
        modal.close.then(function (result) {
          if (result === 'false') return false;
          return false;
        });
      });
    };

    $scope.addEditProductGroup = function (groupToEdit) {
      ModalService.showModal({
        templateUrl: "components/modals/CAMPAIGNS/products/addProductGroup.html",
        controller: "AddProductGroupCtrl",
        inputs: {
          data: {
            modalTitle: groupToEdit ? 'Edit Product Group' : 'Add Product Group',
            ClientID: $stateParams.clientID,
            groupToEdit: groupToEdit
          }
        }
      }).then(function (modal) {
        modal.element.modal({
          backdrop: 'static',
          keyboard: false
        });
        modal.close.then(function(){
          fetch()
        });
      });
    };
	
	
	$scope.importProducts = function () {
      ModalService.showModal({
        templateUrl: "components/modals/CAMPAIGNS/products/importProducts.html",
        controller: "ImportProductsCtrl",
        inputs: {
          data: {
            modalTitle: 'Import Products',
            ClientID: $stateParams.clientID
          }
        }
      }).then(function (modal) {
        modal.element.modal({
          backdrop: 'static',
          keyboard: false
        });
        modal.close.then(function(){
          fetch()
        });
      });
    };
  });

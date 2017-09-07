'use strict';

angular.module('crm')
  .controller('MerchantsCtrl', function ($scope, $state, DataProcessing, resolvedClientSiteCharges, 
    ModalService, DataStorage, $timeout, $filter, Notification, $rootScope) {

    $scope.clientsModel = [];
    $scope.sitesModel = [];
    $scope.chargesModel = [];
    $scope.chargesData = [];
    $scope.sitesData = [];

    //  1st select
    $scope.clientsData = resolvedClientSiteCharges.clients;
    $scope.clientsSettings = {
      enableSearch: true,
      scrollableHeight: '243px',
      scrollable: true,
      idProp: 'ClientID',
      displayProp: 'CompanyName',
      selectName: $rootScope.t('common.clients'),
      showCheckAll: false,
      showUncheckAll: false,
      selectionLimit: 1

    };

    //  2nd select
    $scope.sitesSettings = {
      idProp: 'SiteID',
      displayProp: 'Name',
      enableSearch: true,
      scrollableHeight: '243px',
      scrollable: true,
      searchPlaceholder: $rootScope.translate('administration.merchants.merchants.controller.type-site-name-here-or-select-from-list.'),
      selectName: $rootScope.t('common.sites'),
      defaultText: $rootScope.t('common.no-clients-selected'),
    };

    if ($state.params.clientID) {
      $scope.clientsSettings.selectedByDefault = [{ClientID: $state.params.clientID}];
      $state.params.clientID = false;
    }

    //  3rd select
    $scope.chargesSettings = {
      idProp: 'ChargeId',
      displayProp: 'Name',
      enableSearch: true,
      scrollableHeight: '243px',
      scrollable: true,
      searchPlaceholder: $rootScope.translate('administration.merchants.merchants.controller.type-charge-name-here-or-select-from-list.'),
      selectName: 'CHARGES',
      defaultText: $rootScope.translate('administration.merchants.merchants.controller.no-sites-selected')
    };

    $scope.$watchCollection('clientsModel',
      function(clients) {
        $scope.processors = [];
        $scope.sitesModel = [];
        $scope.chargesModel = [];
        $scope.chargesData = [];
        //$scope.rules = [];
        $scope.sitesData = [];
        if (clients && clients.length>0)
          DataStorage.anyApiMethod('/processors/'+clients[0].id+'?active=active').query(function(resp){
            if (resp && resp.Processors)
              $scope.processors = resp.Processors;
          });
        $scope.sitesData = DataProcessing.newMakeSites(clients, $scope.clientsData) || $scope.sitesData;

        $timeout(function(){
          if ($state.params.siteID) {
            var siteID = angular.copy($state.params.siteID)
            $state.params.siteID = false;
            $scope.sitesSettings.selectedByDefault = [{SiteID: siteID}];
          }
        },500)
      }
    );

    var concatCharges = function () {
      var tmpChargesData = [];
      $scope.chargesData = [];
      $scope.sitesModel = $scope.sitesModel || [];
      if ($scope.sitesModel.length==0) {
        $scope.chargesModel = [];
        return
      }
      for (var i = 0; i < $scope.sitesModel.length; i++) {
        var selectedObj = $scope.sitesModel[i];
        var siteObj = $scope.sitesData.filter(function (value) {
          return value.SiteID == selectedObj.id;
        });
        if (siteObj.length) {
          tmpChargesData = tmpChargesData.concat(siteObj[0].Charges);
        }
      }
      for (var j = 0; j < tmpChargesData.length; j++) {
        tmpChargesData[j].chid = j;
      }
      tmpChargesData = tmpChargesData || [];
      $scope.chargesData = tmpChargesData;
      $scope.chargesModel = $scope.chargesModel.filter(function(ch){
        return $filter('filterByField')(tmpChargesData, {ChargeId: ch.id}).length > 0
      });
    };

    var productRules = function(cb){
      cb = cb || function(){};
      $scope.charges = [];
      $scope.productRules = [];
      if ($scope.chargesModel && $scope.chargesModel.length>0){
        angular.forEach($scope.chargesModel, function(ch){
          angular.forEach($scope.chargesData, function(chD){
            if (ch.id == chD.ChargeId)
              $scope.charges.push(chD)
          })
        });
        DataStorage.merchantsAnyApi("rules").post({Charges: $scope.chargesModel.map(function (val) {return val.id;})}, function(resp){
          $scope.productRules = resp.ProductsRules || [];
          cb()
        });
      }
    }
    $scope.$watchCollection('sitesModel',
      function(sites) {
        concatCharges();
      }
    );

    $scope.$watchCollection('chargesModel',
      function(arr) {
        productRules()
      }
    );

    $scope.advancedRules = function (advancedRuleID) {
      if (advancedRuleID){
        var serverAction = 'advancedrule/' + advancedRuleID;
        var server = DataStorage.processorAnyApi(serverAction).query().$promise;
        server.then(
          function (result) {
            if (result.Status) {
              $scope.closeNotices = false;
              $scope.noticeText = 'advancedrule Server error: ' + result.ErrorMessage;
              return false;
            }
            ModalService.showModal({
              templateUrl: "components/modals/CAMPAIGNS/processor/advancedProcessor.html",
              controller: "AdvancedProcessorCtrl",
              windowClass: 'big-modal',
              inputs: {
                data: {
                  modalTitle: $rootScope.translate('administration.merchants.merchants.controller.advanced-processor-settings'),
                  ruleData: result.AdvancedRule,
                  productsLevelAdvancedRuleID:advancedRuleID
                }
              }
            }).then(function (modal) {
              modal.element.modal();
              modal.close.then(function (result) {
                if (result == 'false') return false;
                $scope.noticeText = $rootScope.translate('administration.merchants.merchants.controller.advanced-rule-for-processor')+': "' + advancedRuleID+ '" '+$rootScope.translate('administration.merchants.merchants.controller.successfully-saved!');
                $scope.closeNotices = false;
                return false;
              });
            });
          },
          function (error) {
            $scope.closeNotices = false;
            $scope.noticeText = $rootScope.translate('administration.merchants.merchants.controller.get-advanced-rule-error')+': ' + error;
            return false;
          }
        );
      }
    }

    $scope.editrule = function (productRule) {
      ModalService.showModal({
        templateUrl: "components/modals/ADMINISTRATION/rule/addRule.html",
        controller: "AddRuleModalCtrl",
        windowClass: 'big-modal',
        inputs: {
          data: {
            processors: $scope.processors || [],
            charges: productRule.Products || [],
            rules: productRule.Rules || [],
            isEdit: true,
            advancedRules: $scope.advancedRules
          }
        }
      }).then(function (modal) {
        modal.element.modal({
          backdrop: 'static',
          keyboard: false
        });

        modal.close.then(function (result) {
          if (!result) 
            return;

          productRules();
        });
      });
    }
  });

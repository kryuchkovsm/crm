/**
 * Created by user on 24.03.15.
 */
'use strict';
angular.module('crm')
  .controller('AddEditChargeCtrl',function($scope, data, close, DataStorage, $timeout, ScrollService, $element, $rootScope) {
    $scope.modalTitle = data.modalTitle;
    $scope.submittedForm = false;
    $scope.fields = data.serverData.AddCharge || data.serverData.Charge;
    $scope.fields.ProductGroupId = $scope.fields.ProductGroupId || data.productGroup.ID

    var fetchShipingCodes = function(providerId){
      $scope.shippingCodes = [];
      $scope.loadingShippingCodes = true;
      DataStorage.anyApiMethod('/products/shippingcodes/'+providerId).query(function(resp){
        $scope.loadingShippingCodes = false;
        if (resp && !resp.Status)
          $scope.shippingCodes = resp.ShippingCodes
      })
    };

    $scope.$watch('fields.FulfillmentProvider', function(fulfillmentProviderId){
      if (fulfillmentProviderId) {
        fetchShipingCodes(fulfillmentProviderId)
      }else
        $scope.shippingCodes = [];
    });

    var ext = {
      Retries: angular.copy($scope.fields).RetriesInit,
      ProductGroups: _.map(angular.copy($scope.fields).ProductGroups, function (item, index) {return { id: item.ProductGroupID || item.id, name: item.Name || item.name }}) || [],
      ChargeTypes: _.map(angular.copy($scope.fields).ChargeTypes, function (item, index) {return { id: item.id, name: item.name }}) || [],
      UpsellPositions: _.map(angular.copy($scope.fields).UpsellPositions, function(pos){ return {id: pos.Value, name: pos.Text }}) || [],
      Providers: _.map(angular.copy($scope.fields).Providers, function (item, index) {return { id: item.ProviderId, name: item.ProviderName }}) || [],

      FirstChargeIntervalValue: parseInt(angular.copy($scope.fields).FirstChargeIntervalValue) || 0,
      SubsequentChargeIntervalValue: parseInt(angular.copy($scope.fields).SubsequentChargeIntervalValue) || 0,

      intervalType: [
        {"id":61,"name":"Days"},
        {"id":62,"name":"Months"},
        {"id":63,"name":"Years"}
      ],

      taxStatesData: _.map(angular.copy($scope.fields).TaxStates,function (item, index) {
        return { id: item.StateID, name: item.StateAbbrev }
      }) || [],

      taxStatesSettings: {
        enableSearch: false,
        scrollableHeight: '141px',
        scrollable: true,
        idProp: 'id',
        displayProp: 'name',
        valRequired: true,
        selectName: 'TAX STATES'
      },

      trResponseData: _.map(angular.copy($scope.fields).DeclineResponses, function (item) {return { id: item.ResponseTextID, name: item.ResponseText }}) || [],
      trResponseSettings: {
        enableSearch: true,
        scrollableHeight: '150px',
        scrollable: true,
        idProp: 'id',
        displayProp: 'name',
        searchPlaceholder: $rootScope.translate('modals.campaigns.products.addeditchargectrl.type-response-text-here-or-select-from-list'),
        selectName: $rootScope.translate('modals.campaigns.products.addeditchargectrl.transaction-response-text-filter')
      }
    }

    if ($scope.fields.SelectedTaxStates)
      ext.taxStatesModel = _.map(angular.copy($scope.fields).SelectedTaxStates,function (item, index) {
        return { id: item.StateID, name: item.StateAbbrev }
      }) || []

    if ($scope.fields.SelectedDeclineResponses)
      ext.trResponseModel = _.map(angular.copy($scope.fields).SelectedDeclineResponses, function(v){ return {id: parseInt(v)}})
    angular.extend($scope.fields, ext);

    $scope.fields.TaxableAmount = $scope.fields.TaxableAmount || 0;
    $scope.saved = false;

    var action = data.chargeID ? 'editcharge' : 'addcharge';
    if (action == 'editcharge') 
      $scope.fields.chargeID = data.chargeID;

    $scope.save = function(chargeForm) {
      $scope.submittedForm = true;
      $scope.$broadcast('show-errors-check-validity');

      if (chargeForm.$invalid) {
        var toScroll = 'top';
        if (angular.element('.ng-invalid').length>0)
          toScroll = angular.element('.ng-invalid').eq(1);
        $element.scrollTo(toScroll);
        return false;
      }

      if ($scope.fields.IsStateTax && 
         (!$scope.fields.taxStatesModel || ($scope.fields.taxStatesModel && !$scope.fields.taxStatesModel.length))) 
        return

      angular.extend($scope.fields, {
        SelectedDeclineResponses: _.map(angular.copy($scope.fields).trResponseModel, function (item) {return item.id;}) || [],
        SelectedTaxStates: _.map(angular.copy($scope.fields).taxStatesModel, function (item) {return item.id;}) || []
      });

      var saveObj = angular.copy($scope.fields);

      if (saveObj.FulfillmentProvider == 0)
        delete saveObj.FulfillmentProvider;

      _.each(['ChargeTypes','DeclineResponses','ProductGroups', 'Providers', 'RegularProducts', 'RetriesInit', 'TaxStates',
        'UpsellPositions', 'intervalType', 'taxStatesData', 'taxStatesModel', 'taxStatesSettings', 'trResponseData', 'trResponseSettings'], function(key){
        delete saveObj[key]
      });

      var promise = DataStorage.productsAnyApi(action).post(saveObj).$promise;
      $scope.saving = true;
      promise.then(function (reply) {
        if (reply.Status != 0) {
          $scope.saving = false;
          return;
        }

        $scope.saving = false;
        $scope.saved = true;
        close({saved: true, Name: $scope.fields.Name}, 500);
      },
      function (error) {
        $scope.saving = false;
        close(error, 500);
      });
    };

    $scope.resetCustomers = function() {
      var server = DataStorage.productsAnyApi('resetattempts/' + $scope.fields.chargeID).post().$promise
      server.then(function (reply) {
          $scope.successText = 'Attempts reseted'
          $timeout(function(){
            $scope.successText = undefined
          },3000)
        },
        function (error) {
          $scope.errorText = error
          $timeout(function(){
            $scope.errorText = undefined
          },3000)
        });
    };

    $scope.updateCustomers = function() {
      var server = DataStorage.productsAnyApi('updatecustomers').post({
        "ChargeID": $scope.fields.chargeID,
        "Retries": $scope.fields.Retries
      }).$promise;
      server.then(function (reply) {
          $scope.successText = $rootScope.translate('modals.campaigns.products.addeditchargectrl.customers-updated');
          $timeout(function(){
            $scope.successText = undefined
          },3000)
        },
        function (error) {
          $scope.errorText = error
          $timeout(function(){
            $scope.errorText = undefined
          },3000)
        });
    };

    // when you need to close the modal, call close
    $scope.close = function(result) {
      close(result, 500); // close, but give 500ms for bootstrap to animate
    };
  });

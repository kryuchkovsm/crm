'use strict';

angular.module('crm')
  .controller('LeadCtrl', function ($scope, resolvedIndex, GlobalVars, 
  CustomerSetup, ModalService, DataProcessing, DataStorage, $filter, 
  $state, $document, $timeout, Notification, $rootScope) {
  
    $scope.fields = {
      Type: 'customer',
      IpAddress: '127.0.0.1'
    };
    $scope.customerDetails = {};
    $scope.fieldOptions = CustomerSetup.customerFieldOptions();
    $scope.fieldOptions.zipTxtOptions.valRequired = true;
    $scope.fieldOptions.countrySelectOptions.valRequired = true;
    $scope.fieldOptions.countrySelectOptions.data = resolvedIndex.Countries;

    var mS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    $scope.fieldOptions.monthExpiration = {
      label: $rootScope.t('crm.lead.lead.controller.month-expiration')+':',
      data: _.map(_.range(1,13), function(num){
        return {id: num, name: mS[num-1] + '('+num+')'}
      }),
      valRequired: true,
    };

    var curYear = (new Date()).getFullYear()
    $scope.fieldOptions.yearExpiration = {
      label: $rootScope.t('crm.lead.lead.controller.year-expiration')+':',
      data: _.map(_.range(curYear, curYear+11), function(num){
        return {id: num, name: num}
      }),
      valRequired: true,
    };

    $scope.clientsModel = [];
    $scope.sitesModel = [];
    $scope.sitesData = [{"SiteID":0,"Name":$rootScope.t('crm.lead.lead.controller.no-clients-selected'), disabled: true}];
    $scope.newTransaction = {
      PaymentInformation: {
        ProductGroups: []
      }
    };

    //  1st select
    $scope.clientsData = GlobalVars.commonObject().Clients;
    $scope.clientsSettings = {
      enableSearch: true,
      scrollableHeight: '291px',
      scrollable: true,
      idProp: 'ClientID',
      displayProp: 'CompanyName',
      selectName: $rootScope.t('common.clients')
    };

    $scope.$watchCollection("clientsModel",function(clients) {
      $scope.sitesData = DataProcessing.newMakeSites(clients, $scope.clientsData);
      $scope.sitesModel = DataProcessing.checkAvailableSites($scope.sitesModel, clients, $scope.clientsData)
    });

    //  2nd select
    $scope.sitesSettings = {
      idProp: 'SiteID',
      displayProp: 'Name',
      enableSearch: true,
      scrollableHeight: '326px',
      scrollable: true,
      searchPlaceholder: $rootScope.t('crm.lead.lead.controller.type-site-name-here-or-select-from-list.'),
      selectName: $rootScope.t('common.sites'),
      showUncheckAll: false,
      showCheckAll: false,
      selectionLimit: 1,
      valRequired: true
    };

    var lastSite;
    var fetchPG = function(){
      lastSite = angular.copy($scope.sitesModel[0].id);
      $scope.fields.SiteID = angular.copy($scope.sitesModel[0].id)
      DataStorage.anyApiMethod('/addlead/groups/' + $scope.sitesModel[0].id).query(function(resp){
        if (resp && resp.Groups) $scope.productGroups = resp.Groups;
        else $scope.productGroups = []
      });
    }
    $scope.$watchCollection("sitesModel",function(site, oldSite) {
      //if (site && site.length && lastSite && lastSite == site[0].id) return
      if (site && site.length && $scope.newTransaction.PaymentInformation.ProductGroups.length)
        ModalService.showModal({
          templateUrl: "components/modals/COMMON/sure.html",
          controller: "DataModalCtrl",
          inputs: {
            data: {
              modalTitle: $rootScope.translate('crm.lead.lead.controller.changing-site'),
              modalTxt: $rootScope.translate('crm.lead.lead.product-belongs-modal-title', {value: site[0].id})
            }
          }
        }).then(function (modal) {
          modal.element.modal();
          modal.close.then(function (result) {
            if (result == 'false') {
              $scope.sitesModel = oldSite;
              return
            }
            $scope.newTransaction.PaymentInformation.ProductGroups = [];
            fetchPG()
          });
        });
      else{
        if (site && site.length>0 && site[0].Name!=$rootScope.t('crm.lead.lead.controller.no-clients-selected')){
          fetchPG()
        }else{
          delete $scope.fields.SiteID
          $scope.productGroups = []
        }
      }
    });

    $scope.$watch('selectedCountry', function(val){
      if (val && val.id) $scope.fields.CountryID = parseInt(val.id);
      else
        delete $scope.fields.CountryID
    })

    $scope.clearFields = function(){
      $scope.fields.customerFormSubmitted = false;
      $scope.fields = {
        IpAddress: '127.0.0.1'
      };
      $scope.selectedCountry = '';
      $scope.sitesData = [{"SiteID":0,"Name":$rootScope.t('crm.lead.lead.controller.no-clients-selected'), disabled: true}];
      $scope.sitesModel = [];
      $scope.clientsModel = [];
      resetForms()
    };

    var resetForms = function(){
      $scope.$broadcast('show-errors-reset', 'addLeadForm');
      $scope.$broadcast('show-errors-reset', 'submitTransactionForm');
    }

    var validateInqueryForm = function(){
      $scope.$broadcast('show-errors-check-validity', 'addLeadForm');
      $scope.fields.customerFormSubmitted = true;
      if ($scope.addLeadForm.$invalid || !$scope.fields.SiteID) {
        $timeout(function(){
          var someElement = angular.element('[name="addLeadForm"] input.ng-invalid').eq(0);
          var groupError = angular.element('.error-message:visible');
          if (groupError && groupError.length>0)
            $document.scrollToElementAnimated(groupError.parent());
          else if(someElement && someElement.length>0)
            $document.scrollToElementAnimated(someElement);
        },300);
        return false;
      }else return true
    };

    $scope.addNewProduct = function(selectedPoductGroupGUID){
      if (!selectedPoductGroupGUID) {
        ModalService.showModal({
          templateUrl: "components/modals/COMMON/sure.html",
          controller: "DataModalCtrl",
          inputs: {
            data: {
              hideProceedButton: true,
              modalTitle: $rootScope.t('crm.lead.lead.controller.add-product'),
              modalTxt: $rootScope.t('crm.lead.lead.controller.select-product-group-firstly')
            }
          }
        }).then(function (modal) {
          modal.element.modal();
          modal.close.then(function (result){
            $timeout(function(){
              $scope.animatePGSelect = true;
              $timeout(function(){
                $scope.animatePGSelect = false;
              },500)
            },500)
          });
        });

        return
      }
      if ($filter('filter')($scope.newTransaction.PaymentInformation.ProductGroups,{ProductGroupKey: selectedPoductGroupGUID}).length==0)
        $scope.newTransaction.PaymentInformation.ProductGroups.push({
          ProductGroupKey: selectedPoductGroupGUID
        });
      $scope.selectedPoductGroupGUID = '';
    };

    var validatetransaction = function(){
      $scope.transactionsFromSubmitted = true;
      $scope.$broadcast('show-errors-check-validity', 'submitTransactionForm');

      if ($scope.submitTransactionForm.$invalid || $scope.newTransaction.PaymentInformation.ProductGroups.length==0) {
        $timeout(function(){
          var someElement = angular.element('.ng-invalid').eq(0);
          var groupError = angular.element('.error-message:visible');
          if (groupError && groupError.length>0)
            $document.scrollToElementAnimated(groupError.parent());
          else if(someElement && someElement.length>0)
            $document.scrollToElementAnimated(someElement);
        },300);
        return false
      }
      return true
    }

    var enterInquiry = function(cb) {
      cb = cb || function(){}
      $scope.submitting = true
      DataStorage.addCustomer().post(JSON.parse(angular.toJson($scope.fields)), function(resp){
        $scope.submitting = false
        $scope.fields.customerFormSubmitted = false;
        if (resp.CustomerID) {
          $scope.CustomerID = resp.CustomerID;
          $scope.newTransaction.CustomerGuid = resp.CustomerGuid;
          Notification.success({message: $rootScope.t('crm.lead.lead.new-customer-added'), delay: 5000})
          cb()
        }
      });
    };

    var submitTrunsaction = function(cb){
      cb = cb || function(){}
      $scope.responseText = false;
      $scope.submitting = true
      DataStorage.customerSubmitTransactionApi().post(JSON.parse(angular.toJson($scope.newTransaction)), function(resp){
        $scope.submitting = false
        $scope.transactionsFromSubmitted = false;
        if (resp && !resp.Status){
          if (resp.ResponseText != 'SUCCESS')
            $scope.responseText = resp.ResponseText;
          else{
            Notification.success({message: $rootScope.t('crm.lead.lead.new-transaction-added'), delay: 5000})
            $scope.transactionID = resp.TransactionID
          }
          $scope.wantToAddTransaction = false
          cb()
        }
      });
    };

    $scope.totalAmount = function(selectedGroups, productGroups){
      var total = 0;
      _.each(selectedGroups, function(group){
        var g = $filter('filterByField')(productGroups, {ProductGroupGUID: group.ProductGroupKey});
        var amount = g[0].Amount;
        total += amount;
      })
      return total
    };

    $scope.submit = function() {
      var vTr
      if ($scope.CustomerID){
        vTr = validatetransaction();
        if (vTr) submitTrunsaction()
      }else{
        var vInq = validateInqueryForm()
        if (!vInq) return
        var existTr;
        _.each($scope.newTransaction.PaymentInformation, function(v, k){
          if (v && (Array.isArray(v) && v.length || typeof v == 'string'))
            existTr = true
        });
        if ($scope.newTransaction.PaymentInformation.ProductGroups && $scope.newTransaction.PaymentInformation.ProductGroups.length)
          existTr = true
        if (existTr){
          vTr = validatetransaction();
          if (vTr)
            enterInquiry(submitTrunsaction)
        }else{
          $scope.transactionsFromSubmitted = false
          $scope.$broadcast('show-errors-reset', 'submitTransactionForm');
          enterInquiry(function(){
            ModalService.showModal({
              templateUrl: "components/modals/COMMON/sure.html",
              controller: "DataModalCtrl",
              inputs: {
                data: {
                  modalTitle: $rootScope.translate('crm.lead.lead.controller.add-transaction'),
                  modalTxt: $rootScope.translate('crm.lead.lead.controller.new-customer-has-been-added.-would-you-like-to-add-transaction?')
                }
              }
            }).then(function (modal) {
              modal.element.modal();
              modal.close.then(function (result) {
                if (result == 'false') {
                  $scope.createNew();
                  return;
                }
                $scope.wantToAddTransaction = true
              });
            });

          });
        }

      }

    };

    $scope.exit = function() {
      $state.go('main.dashboard');
    };

    $scope.createNew = function() {
      $scope.false = true
      delete $scope.CustomerID;
      delete $scope.transactionID;
      $scope.transactionsFromSubmitted = false;
      $scope.clearFields();
      lastSite = undefined;
      $scope.responseText = false;
      $scope.newTransaction = {
        PaymentInformation: {
          ProductGroups: []
        }
      };
    };

  });

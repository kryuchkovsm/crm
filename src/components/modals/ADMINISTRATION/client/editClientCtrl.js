/**
 * Created by user on 01.04.15.
 */
'use strict';
angular.module('crm')
  .controller('EditClientModalCtrl',function($scope, $timeout, $filter, data, close, $rootScope, 
    ClientSetup, DataStorage, Notification, DataProcessing) {

    $scope.fields1 = {};
    $scope.fields3 = {};
    $scope.fields4 = {};
    $scope.saved = false;
    
    $scope.clientInfo = 'ActiveElement';
    $scope.apiTabClass = false;
    $scope.clientDetails = false;
    
    $scope.modalTitle = data.modalTitle;
    
    $scope.fieldOptions1 = ClientSetup.clientEditFormFields();
    $scope.fieldOptions3 = ClientSetup.clientEditApiFormFields();
    $scope.fieldOptions4 = ClientSetup.clientEditDetailsFormFields();

    if (data.clientObj) {
      var countrySelectValue = $filter('filter')($scope.fieldOptions4.countrySelectOptions.data, {id: data.clientObj.CountryId}, true)[0];
      data.clientObj.IsActive ? $scope.fieldOptions1.activeRLOptions.data[0].checked = 'checked' : $scope.fieldOptions1.activeRLOptions.data[1].checked = 'checked';
      data.clientObj.Address1 ? $scope.fields1.address1TxtValue = data.clientObj.Address1 : false;
      data.clientObj.Address2 ? $scope.fields1.address2TxtValue = data.clientObj.Address2 : false;
      data.clientObj.State ? $scope.fields1.stateTxtValue = data.clientObj.State : false;
      data.clientObj.ZipCode ? $scope.fields1.zipTxtValue = parseInt(data.clientObj.ZipCode) : false;
      data.clientObj.Phone ? $scope.fields1.phoneTxtValue = parseInt(data.clientObj.Phone) : false;
      data.clientObj.LastName ? $scope.fields1.lastnameTxtValue = data.clientObj.LastName : false;
      data.clientObj.FirstName ? $scope.fields1.firstnameTxtValue = data.clientObj.FirstName : false;
      data.clientObj.Email ? $scope.fields1.emailTxtValue = data.clientObj.Email.replace(/ /g,'') : false;
      data.clientObj.CompanyName ? $scope.fields1.companynameTxtValue = data.clientObj.CompanyName : false;
      data.clientObj.City ? $scope.fields1.cityTxtValue = data.clientObj.City : false;
      data.clientObj.PrimaryContact ? $scope.fields1.primaryContactTxtValue = data.clientObj.PrimaryContact : false;

      data.clientObj.ApiUsername ? $scope.fields3.loginTxtValue = data.clientObj.ApiUsername : false;
      data.clientObj.ApiPassword ? $scope.fields3.passwordTxtValue = data.clientObj.ApiPassword : false;

      // fields 4
      data.clientObj.CountryId || data.clientObj.CountryId==0 ? $scope.fields4.countrySelectValue = countrySelectValue : false;
      data.clientObj.ReferralSource ? $scope.fields4.referralSourceTxtValue = data.clientObj.ReferralSource : false;
      data.clientObj.DateEntered ? $scope.fields4.dateCreatedNoEditTxtValue = DataProcessing.toDateFormat(data.clientObj.DateEntered * 1000) : false;
      data.clientObj.DateModified ? $scope.fields4.dateEditedNoEditTxtValue = DataProcessing.toDateFormat(data.clientObj.DateModified * 1000) : false;
      data.clientObj.ExpirationDate ? $scope.fields4.expirationDateValue = DataProcessing.toDateFormat(data.clientObj.ExpirationDate * 1000) : false;

      data.clientObj.Terms ? $scope.fields4.termsTxtValue = data.clientObj.Terms : false;
      data.clientObj.PaymentMethod ? $scope.fields4.paymentMethodTxtValue = data.clientObj.PaymentMethod : false;
      data.clientObj.AccountNumber ? $scope.fields4.accountNumberTxtValue = parseInt(data.clientObj.AccountNumber) : false;
      data.clientObj.RoutingNumber ? $scope.fields4.routingNumberTxtValue = parseInt(data.clientObj.RoutingNumber) : false;
      data.clientObj.AccountManager ? $scope.fields4.accountManagerTxtValue = data.clientObj.AccountManager : false;
      data.clientObj.LicenseFee ? $scope.fields4.licenseFeeTxtValue = data.clientObj.LicenseFee : false;

      data.clientObj.TransactionFee ? $scope.fields4.transactionFeeTxtValue = data.clientObj.TransactionFee : false;
      data.clientObj.SiteSetupFee ? $scope.fields4.siteSetupFeeTxtValue = data.clientObj.SiteSetupFee : false;
      data.clientObj.ProgrammingFee ? $scope.fields4.programmingFeeTxtValue = data.clientObj.ProgrammingFee : false;
      data.clientObj.ClickFee ? $scope.fields4.clickFeeTxtValue = data.clientObj.ClickFee : false;
      data.clientObj.FraudFee ? $scope.fields4.fraudFeeTxtValue = data.clientObj.FraudFee : false;
      data.clientObj.BandwidthFee ? $scope.fields4.bandwidthFeeTxtValue = data.clientObj.BandwidthFee : false;
      data.clientObj.OtherFee1 ? $scope.fields4.otherFee1TxtValue = data.clientObj.OtherFee1 : false;
      data.clientObj.OtherFee2 ? $scope.fields4.otherFee2TxtValue = data.clientObj.OtherFee2 : false;

      data.clientObj.PrimaryName ? $scope.fields4.primaryNameTxtValue = data.clientObj.PrimaryName : false;
      data.clientObj.PrimaryEmail ? $scope.fields4.primaryEmailTxtValue = data.clientObj.PrimaryEmail : false;
      data.clientObj.PrimaryPhone ? $scope.fields4.primaryPhoneTxtValue = data.clientObj.PrimaryPhone : false;
      data.clientObj.TechnicalName ? $scope.fields4.technicalNameTxtValue = data.clientObj.TechnicalName : false;
      data.clientObj.TechnicalEmail ? $scope.fields4.technicalEmailTxtValue = data.clientObj.TechnicalEmail : false;
      data.clientObj.TechnicalPhone ? $scope.fields4.technicalPhoneTxtValue = data.clientObj.TechnicalPhone : false;

      data.clientObj.BillingName ? $scope.fields4.billingNameTxtValue = data.clientObj.BillingName : false;
      data.clientObj.BillingEmail ? $scope.fields4.billingEmailTxtValue = data.clientObj.BillingEmail : false;
      data.clientObj.BillingPhone ? $scope.fields4.billingPhoneTxtValue = data.clientObj.BillingPhone : false;

      data.clientObj.AdminName ? $scope.fields4.adminNameTxtValue = data.clientObj.AdminName : false;
      data.clientObj.AdminEmail ? $scope.fields4.adminEmailTxtValue = data.clientObj.AdminEmail : false;
      data.clientObj.AdminPhone ? $scope.fields4.adminPhoneTxtValue = data.clientObj.AdminPhone : false;
      data.clientObj.OpsName ? $scope.fields4.opsNameTxtValue = data.clientObj.OpsName : false;
      data.clientObj.OpsEmail ? $scope.fields4.opsEmailTxtValue = data.clientObj.OpsEmail : false;
      data.clientObj.OpsPhone ? $scope.fields4.opsPhoneTxtValue = data.clientObj.OpsPhone : false;

      $scope.fields4.crmCheckboxValue = [];
      data.clientObj.cbcrm ? $scope.fields4.crmCheckboxValue.push({"id":1,"name":"CRM", "value": true}) : false;
      data.clientObj.cbdeclines ? $scope.fields4.crmCheckboxValue.push({"id":7,"name":"Declines", "value": true}) : false;
      data.clientObj.cbemails ? $scope.fields4.crmCheckboxValue.push({"id":4,"name":"Emails", "value": true}) : false;
      data.clientObj.cbexports ? $scope.fields4.crmCheckboxValue.push({"id":5,"name":"Exports", "value": true}) : false;
      data.clientObj.cbmid ? $scope.fields4.crmCheckboxValue.push({"id":6,"name":"Multi MID", "value": true}) : false;
      data.clientObj.cbnegdb ? $scope.fields4.crmCheckboxValue.push({"id":9,"name":"Neg Database", "value": true}) : false;
      data.clientObj.cbreports ? $scope.fields4.crmCheckboxValue.push({"id":3,"name":"Reports", "value": true}) : false;
      data.clientObj.cbbilling ? $scope.fields4.crmCheckboxValue.push({"id":2,"name":"Billing", "value": true}) : false;
      data.clientObj.cbchargebacks ? $scope.fields4.crmCheckboxValue.push({"id":8,"name":"Chargebacks", "value": true}) : false;
    }

    $scope.save = function(result) {
      $scope.$broadcast('show-errors-check-validity');

      // TAB 1 Information
      if ($scope.clientInfo){
        if ($scope.editClientForm.$invalid)
          return false;

        var saveObj = ClientSetup.makeInfoSaveObject(data.clientObj.ClientID, $scope.fields1);

        $scope.saving = true;

        DataStorage.anyApiMethod('/clients/edit').post(saveObj, function(results){
          if (results.Status === 0) {
            Notification.success({message: $rootScope.t('modals.administration.client.editclient.saved-notification')});
            close(false);
          } else {
            $scope.saving = false;
          }
        });
      } 

      // TAB 2 API
      if ($scope.apiTab){
        if ($scope.apiForm.$invalid)
          return false;

        var saveObj = ClientSetup.makeApiSaveObject(data.clientObj.ClientID, $scope.fields3);

        $scope.saving = true;

        DataStorage.anyApiMethod('/clients/apicredentials').post(saveObj, function(results){
          if (results.Status === 0) {
            Notification.success({message: $rootScope.t('modals.administration.client.editclient.saved-notification')});
            close(false);
          } else {
            $scope.saving = false;
          }
        });
      } 

      // TAB 3 Details
      if ($scope.clientDetails){
        if ($scope.detailsForm.$invalid)
          return false;

        var saveObj = ClientSetup.makeDetailsSaveObject(data.clientObj.ClientID, $scope.fields4);

        $scope.saving = true;

        DataStorage.anyApiMethod('/clients/details').post(saveObj, function(results){
          if (results.Status === 0) {
            Notification.success({message: $rootScope.t('modals.administration.client.editclient.saved-notification')});
            close(false);
          } else {
            $scope.saving = false;
          }
        });
      } 
    };

    $scope.changeTab = function (elem) {
      switch (true) {
        case elem === 'clientInfo':
          $scope.clientInfo = 'ActiveElementColor';
          $scope.apiTab = false;
          $scope.clientDetails = false;
          $scope.$broadcast('show-errors-reset');
          return false;
          break;
        case elem === 'apiTab':
          $scope.apiTab = 'ActiveElementColor';
          $scope.clientInfo = false;
          $scope.clientDetails = false;
          $scope.$broadcast('show-errors-reset');
          return false;
          break;
        case elem === 'clientDetails':
          $scope.clientDetails = 'ActiveElementColor';
          $scope.apiTab = false;
          $scope.clientInfo = false;
          $scope.$broadcast('show-errors-reset');
          return false;
          break;
        default:
          return false;
          break;
      }
    };

    $scope.changeTab('clientInfo')

    $scope.close = function() {
      close(false, 500); // close, but give 500ms for bootstrap to animate
    };
  });

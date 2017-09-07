/**
 * Created by user on 26.03.15.
 */
'use strict';

angular.module('ClientSetupService', [])
  .factory('ClientSetup',
  function(ModalService, DataStorage, DataProcessing, $rootScope) {

    var clientAddNewFormFields = function () {
      var resultObj = {};
      // second col
      resultObj.companynameTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.company-name')+':',
        id: 201,
        valRequired: true
      };
      resultObj.firstnameTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.first-name')+':',
        id: 202,
        valRequired: true
      };
      resultObj.lastnameTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.last-name')+':',
        id: 203,
        valRequired: true
      };
      resultObj.phoneTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.phone')+':',
        id: 204,
        type: 'number',
        valNumber: true,
        valRequired: true,
        disAllowNegative: true
      };
      resultObj.emailTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.email')+':',
        id: 205,
        type: 'email',
        valRequired: true,
        valEmail: true
      };
      // second col
      resultObj.cityTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.city')+':',
        id: 206,
        valRequired: true
      };
      resultObj.address1TxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.address-1')+':',
        id: 207,
        valRequired: true
      };
      resultObj.address2TxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.address-2')+':',
        id: 208,
        //valRequired: true
      };
      resultObj.stateTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.state')+':',
        id: 209,
        valRequired: true
      };
      resultObj.zipTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.zip')+':',
        id: 210,
        type: 'text',
        valRequired: true,
        maxlength: 9
      };
      return resultObj;
    };

    var clientEditFormFields = function () {
      var resultObj = clientAddNewFormFields();
      resultObj.activeRLOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.active'),
        data: [{"id":2,"name":"Yes"},{"id":3,"name":"No"}],
        id: 213
      };
      resultObj.primaryContactTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.primary-contact')+':',
        id: 212
      };
      return resultObj;
    };

    var clientEditApiFormFields = function () {
      var resultObj = {};
      // first col
      resultObj.loginTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.login')+':',
        id: 103,
        valRequired: true
      };
      // second col
      resultObj.passwordTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.password')+':',
        id: 104,
        valRequired: true
      };
      return resultObj;
    };

    var clientEditDetailsFormFields = function () {
      var resultObj = {};
      // Details
      // first col
      resultObj.countrySelectOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.country')+':',
        data: [
          {"id":0,"name":"USA"},
          {"id":1,"name":"Russia"},
          {"id":2,"name":"China"},
          {"id":3,"name":"Germany"},
          {"id":4,"name":"UK"}
        ],
        id: 214
      };
      resultObj.referralSourceTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.refferal-source')+':',
        id: 211
      };

      resultObj.dateCreatedNoEditTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.date-created')+':',
        type: 'noEditTxt'
      };
      resultObj.dateEditedNoEditTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.date-edited')+':',
        type: 'noEditTxt'
      };
      resultObj.termsTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.terms')+':',
        id: 300
      };
      resultObj.paymentMethodTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.payment-method')+':',
        id: 301
      };
      resultObj.accountNumberTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.account-number')+':',
        id: 302,
        type: 'number',
        valNumber: true
      };
      resultObj.routingNumberTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.routing-number')+':',
        id: 303,
        type: 'number',
        valNumber: true
      };
      resultObj.expirationDateOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.expiration-date')+':',
        id: 304
      };
      resultObj.accountManagerTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.account-manager')+':',
        id: 305
      };
      // second col
      resultObj.licenseFeeTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.license-fee')+':',
        id: 306,
        disAllowNegative: true,
        type: 'number',
        valNumber: true
      };
      resultObj.transactionFeeTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.transaction-fee')+':',
        id: 307,
        disAllowNegative: true,
        type: 'number',
        valNumber: true
      };
      resultObj.siteSetupFeeTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.site-setup-fee')+':',
        id: 308,
        disAllowNegative: true,
        type: 'number',
        valNumber: true
      };
      resultObj.programmingFeeTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.programming-fee')+':',
        id: 309,
        disAllowNegative: true,
        type: 'number',
        valNumber: true
      };
      resultObj.clickFeeTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.click-fee')+':',
        id: 310,
        disAllowNegative: true,
        type: 'number',
        valNumber: true
      };
      resultObj.fraudFeeTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.fraud-fee')+':',
        id: 311,
        disAllowNegative: true,
        type: 'number',
        valNumber: true
      };
      resultObj.bandwidthFeeTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.bandwidth-fee')+':',
        id: 312,
        disAllowNegative: true,
        type: 'number',
        valNumber: true
      };
      resultObj.otherFee1TxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.other-fee')+':',
        id: 313,
        disAllowNegative: true,
        type: 'number',
        valNumber: true
      };
      resultObj.otherFee2TxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.other-fee')+':',
        id: 314,
        disAllowNegative: true,
        type: 'number',
        valNumber: true
      };
      // Services
      // first col
      resultObj.services1CheckboxOptions = {
        inline: 'column',
        data: [
          {"id":1,"name":"CRM"},
          {"id":2,"name":"Billing"},
          {"id":3,"name":"Reports"},
          {"id":4,"name":"Emails"},
          {"id":5,"name":"Exports"}
        ]
      };
      // second col
      resultObj.services2CheckboxOptions = {
        inline: 'column',
        data: [
          {"id":6,"name":"Multi MID"},
          {"id":7,"name":"Declines"},
          {"id":8,"name":"Chargebacks"},
          {"id":9,"name":"Neg Database"}
        ]
      };
      // Contacts
      // Primary
      // first col
      resultObj.primaryNameTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.name')+':',
        id: 324
      };
      // second col
      resultObj.primaryEmailTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.email')+':',
        id: 325,
        type: 'email',
        valEmail: true
      };
      // third col
      resultObj.primaryPhoneTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.phone')+':',
        id: 326
      };
      // Technical
      // first col
      resultObj.technicalNameTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.name')+':',
        id: 327
      };
      // second col
      resultObj.technicalEmailTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.email')+':',
        id: 328,
        type: 'email',
        valEmail: true
      };
      // third col
      resultObj.technicalPhoneTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.phone')+':',
        id: 329
      };
      // Billing
      // first col
      resultObj.billingNameTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.name')+':',
        id: 330
      };
      // second col
      resultObj.billingEmailTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.email')+':',
        id: 331,
        type: 'email',
        valEmail: true
      };
      // third col
      resultObj.billingPhoneTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.phone')+':',
        id: 332
      };
      // Admin
      // first col
      resultObj.adminNameTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.name')+':',
        id: 333
      };
      // second col
      resultObj.adminEmailTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.email')+':',
        id: 334,
        type: 'email',
        valEmail: true
      };
      // third col
      resultObj.adminPhoneTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.phone')+':',
        id: 335
      };
      // Ops
      // first col
      resultObj.opsNameTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.name')+':',
        id: 336
      };
      // second col
      resultObj.opsEmailTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.email')+':',
        id: 337,
        type: 'email',
        valEmail: true
      };
      // third col
      resultObj.opsPhoneTxtOptions = {
        label: $rootScope.translate('services.administration.client.clientsetup.phone')+':',
        id: 338
      };
      return resultObj;
    };

    var createItem = function(item) {
      var
        clid = item.clid,
        firstName = item.firstName,
        lastName = item.lastName,
        companyName = item.companyName,
        phone = item.phone,
        email = item.email,
        address1 = item.address1,
        address2 = item.address2,
        city = item.city,
        state = item.state,
        zip = item.zip;
      return {
        clid: clid,
        firstName: firstName,
        lastName: lastName,
        companyName: companyName,
        phone: phone,
        email: email,
        address1: address1,
        address2: address2,
        city: city,
        state: state,
        zip: zip
      };
    };

    var deleteClient = function (id, cb) {
      ModalService.showModal({
        templateUrl: "components/modals/COMMON/sure.html",
        controller: "DataModalCtrl",
        inputs: {
          data: {
            modalTitle: 'Delete Client',
            modalTxt: 'Are you sure you want to delete this client?'
          }
        }
      }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (result) {
          if (result === 'false') return false;
          var clientDelete = DataStorage.clientDelete().post({ClientID: id}).$promise;
          clientDelete.then(
            function (data) {
              cb(id, true);
              return false;
            },
            function (error) {
              cb(id, false);
              return false;
            }
          );
        });
      });
    };

    var addClient = function (addClientCb) {
      ModalService.showModal({
        templateUrl: "components/modals/ADMINISTRATION/client/addClient.html",
        controller: "AddClientModalCtrl",
        inputs: {
          data: {
            modalTitle: 'Add Client'
          }
        }
      }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (result) {
          addClientCb()
        });
      });
    };

    var editClient = function (clientObj, editClientCb) {
      ModalService.showModal({
        templateUrl: "components/modals/ADMINISTRATION/client/editClient.html",
        controller: "EditClientModalCtrl",
        inputs: {
          data: {
            modalTitle: 'Edit Client',
            clientObj: clientObj
          }
        }
      }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (result) {
          editClientCb(result, clientObj);
        });
      });
      return false;
    };

    // Save object for the first tab
    var makeInfoSaveObject = function (ClientID, fields1) {
      return {
        "ClientID": ClientID,
        "FirstName": fields1.firstnameTxtValue || null,
        "LastName": fields1.lastnameTxtValue || null,
        "CompanyName": fields1.companynameTxtValue || null,
        "Phone": fields1.phoneTxtValue || null,
        "Email": fields1.emailTxtValue || null,
        "Address1": fields1.address1TxtValue || null,
        "Address2": fields1.address2TxtValue || null,
        "City": fields1.cityTxtValue || null,
        "State": fields1.stateTxtValue || null,
        "ZipCode": fields1.zipTxtValue || '',
        "IsActive": fields1.activeRLValue ? (fields1.activeRLValue.name === 'Yes' ? true: false) : false,
        "PrimaryContact": fields1.primaryContactTxtValue || null
      };
    }

    var makeApiSaveObject = function (ClientID, fields) {
      return {
        "ClientID": ClientID,
        "ApiLogin": fields.loginTxtValue,
        "ApiPassword": fields.passwordTxtValue
      };
    }
    
    var makeDetailsSaveObject = function (ClientID, fields4) {
      var cbResult = [];

      if (fields4.crmCheckboxValue) {
        for (var i = 0; i < fields4.crmCheckboxValue.length; i++) {
          var obj = fields4.crmCheckboxValue[i];
          cbResult[obj.id] = obj.value;
        }
      }

      var resultObj = {
        "ClientID": ClientID,
        "LicenseFee": parseInt(fields4.licenseFeeTxtValue) || null,
        "Terms": fields4.termsTxtValue || null,
        "TransactionFee": parseInt(fields4.transactionFeeTxtValue) || null,
        "SiteSetupFee": parseInt(fields4.siteSetupFeeTxtValue) || null,
        "ProgrammingFee": parseInt(fields4.programmingFeeTxtValue) || null,
        "ClickFee": parseInt(fields4.clickFeeTxtValue) || null,
        "FraudFee": parseInt(fields4.fraudFeeTxtValue) || null,
        "BandwidthFee": parseInt(fields4.bandwidthFeeTxtValue) || null,
        "OtherFee1": parseInt(fields4.otherFee1TxtValue) || null,
        "OtherFee2": parseInt(fields4.otherFee2TxtValue) || null,
        "PaymentMethod": fields4.paymentMethodTxtValue || null,
        "AccountNumber": fields4.accountNumberTxtValue || null,
        "RoutingNumber": fields4.routingNumberTxtValue || null,
        "ExpirationDate": fields4.expirationDateValue ? DataProcessing.dateToServer(DataProcessing.stringToDate(fields4.expirationDateValue)) : null,
        "AccountManager": fields4.accountNumberTxtValue || null,
        "PrimaryName": fields4.primaryNameTxtValue || null,
        "PrimaryEmail": fields4.primaryEmailTxtValue || null,
        "PrimaryPhone": fields4.primaryPhoneTxtValue || null,
        "TechnicalName": fields4.technicalNameTxtValue || null,
        "TechnicalEmail": fields4.technicalEmailTxtValue || null,
        "TechnicalPhone": fields4.technicalPhoneTxtValue || null,
        "BillingName": fields4.billingNameTxtValue || null,
        "BillingEmail": fields4.billingEmailTxtValue || null,
        "BillingPhone": fields4.billingPhoneTxtValue || null,
        "AdminName": fields4.adminNameTxtValue || null,
        "AdminEmail": fields4.adminEmailTxtValue || null,
        "AdminPhone": fields4.adminPhoneTxtValue || null,
        "OpsName": fields4.opsNameTxtValue || null,
        "OpsEmail": fields4.opsEmailTxtValue || null,
        "OpsPhone": fields4.opsPhoneTxtValue || null,
        "ReferralSource": fields4.referralSourceTxtValue || null,
        "cbcrm": cbResult[1] || false,
        "cbbilling": cbResult[2] || false,
        "cbreports": cbResult[3] || false,
        "cbemails": cbResult[4] || false,
        "cbexports": cbResult[5] || false,
        "cbmid": cbResult[6] || false,
        "cbdeclines": cbResult[7] || false,
        "cbchargebacks": cbResult[8] || false,
        "cbnegdb": cbResult[9] || false
      };

      if (fields4.countrySelectValue && (fields4.countrySelectValue.id || fields4.countrySelectValue.id==0))
        resultObj.CountryId = fields4.countrySelectValue.id;

      return resultObj;
    }

    // Return directly only functions and constants (whiteLabel), 
    // other things through function(){return {val: someobject};}
    var methods = {
      clientAddNewFormFields: clientAddNewFormFields,
      clientEditFormFields: clientEditFormFields,
      clientEditApiFormFields: clientEditApiFormFields,
      clientEditDetailsFormFields: clientEditDetailsFormFields,
      deleteClient: deleteClient,
      addClient: addClient,
      editClient: editClient,
      makeInfoSaveObject: makeInfoSaveObject,
      makeApiSaveObject: makeApiSaveObject,
      makeDetailsSaveObject: makeDetailsSaveObject
    };

    return methods;
  });

'use strict';

angular.module('SearchSetupService', [])
  .factory('SearchSetup', function(DataProcessing) {

    var searchFormFields = function () {
      var resultObj = {};
      // step radio list
      resultObj.stepRLOptions = {
        label: 'services.crm.search.steptype.step',
        data: [
        {"id": 1,"name": 'services.crm.searchsetup.inquiry'},
        {"id": 2,"name": 'services.crm.searchsetup.decline'},
        {"id": 3,"name": 'services.crm.searchsetup.buyer+'}]
      };

      // transactionType radio list
      resultObj.transactionTypeRLOptions = {
        label: 'services.crm.search.transactiontype.transaction-type',
        data: [
        {"id": 0,"name": 'services.crm.searchsetup.auth'},
        {"id": 1,"name": 'services.crm.searchsetup.sale'},
        {"id": 2,"name": 'services.crm.searchsetup.refund'},
        {"id": 3, "name": 'services.crm.searchsetup.void'}, 
        {"id": 4,"name": 'services.crm.searchsetup.capture'}
        ]
      };

      // chargeType radio list
      resultObj.chargeTypeRLOptions = {
        label: 'services.crm.search.chargetype.charge-type',
        data: [
        {"id": 16, "name": 'services.crm.searchsetup.signup-charge'}, 
        {"id": 18, "name": 'services.crm.searchsetup.recurring-charge'}, 
        {"id": 19, "name": 'services.crm.searchsetup.imported-charge'}, 
        {"id": 20, "name": 'services.crm.searchsetup.upsell-charge'}
        ]
      };

      // recurringStatus radio list
      resultObj.recurringStatusRLOptions = {
        label: 'services.crm.search.recurringstatus.recurring-status',
        data: [
        {"id":"all","name": 'services.crm.searchsetup.all'}, 
        {"id":"active","name": 'services.crm.searchsetup.active'},
        {"id":"inactive","name": 'services.crm.searchsetup.inactive'}
        ]
      };

      // orderType radio list
      resultObj.orderTypeRLOptions = {
        label: 'services.crm.search.ordertype.order-type',
        data: [
        {"id":'RealOrders',"name": 'services.crm.searchsetup.real-orders-only'},
        {"id":'TestOrdersOnly',"name": 'services.crm.searchsetup.test-orders-only'},
        {"id":'All',"name": 'services.crm.searchsetup.all-orders'}]
      };

      // Search form input boxes
      resultObj.customerIdTxtOptions = {
        label: 'services.crm.searchsetup.customer-id',
        id: 1,
        type: 'number',
        disAllowNegative: true,
        valNumber: true
      };

      resultObj.transactionIdTxtOptions = {
        label: 'services.crm.searchsetup.transaction-id',
        id: 1,
        type: 'number',
        disAllowNegative: true,
        valNumber: true
      };

      resultObj.firstNameTxtOptions = {
        label: 'services.crm.searchsetup.first-name',
        id: 1
      };

      resultObj.lastNameTxtOptions = {
        label: 'services.crm.searchsetup.last-name',
        id: 1
      };

      resultObj.emailTxtOptions = {
        label: 'services.crm.searchsetup.email',
        id: 1,
        type: 'email',
        valEmail: true
      };

      resultObj.accountNumberTxtOptions = {
        label: 'services.crm.searchsetup.account-number',
        id: 1,
        inline: true,
        type: 'text',
        valNumber: true
      };

      resultObj.bankAccountTxtOptions = {
        label: 'services.crm.searchsetup.bank-account-(ach)',
        id: 1,
        type: 'text',
        valNumber: true
      };

      // chargeType radio list
      resultObj.accountNumberRLOptions = {
        label: 'services.crm.searchsetup.account-number',
        data: [
        {"id":4,"name": 'services.crm.searchsetup.credit-card', checked: "checked"},
        {"id":5,"name": 'services.crm.searchsetup.bank-account'}
        ],
        inline: true
      };

      resultObj.ccLast4TxtOptions = {
        label: 'services.crm.searchsetup.cc-last-4-digits',
        id: 1,
        type: 'text',
        valNumber: true,
        valMax: 9999,
        maxlength: 4,
        placeholder: 'xxxx',
        disAllowNegative: true
      };

      resultObj.phoneNumTxtOptions = {
        label: 'services.crm.searchsetup.phone-number',
        id: 1,
        disAllowNegative: true
      };

      resultObj.chargeCodeTxtOptions = {
        label: 'services.crm.searchsetup.charge-code',
        id: 1,
        type: 'number',
        valNumber: true
      };

      resultObj.refNumberTxtOptions = {
        label: 'services.crm.searchsetup.reference-number',
        id: 1,
        type: 'number',
        valNumber: true,
        disAllowNegative: true
      };

      resultObj.zipCodeTxtOptions = {
        label: 'services.crm.searchsetup.zip',
        id: 1,
        valZip: true
      };

      resultObj.fromDateOptions = {
        label: 'common.from',
        id: 304,
        inline: true,
        longLabel: true
      };

      resultObj.toDateOptions = {
        label: 'common.to',
        id: 305,
        inline: true,
        longLabel: true
      };

      return resultObj;
    };

    var makeFields = function (sm, f) {
      return {
        Sites: sm.length ? sm.map(function (item) {return item.id;}) : [],
        CustomerID: f.customerIdTxtValue || 0,
        TransactionID: f.transactionIdTxtValue || 0,
        StepType: f.stepRLValue && f.stepRLValue.id ? f.stepRLValue.id : null,
        TransactionType: f.transactionTypeRLValue && f.transactionTypeRLValue.id ? f.transactionTypeRLValue.id : null,
        ChargeType: f.chargeTypeRLValue && f.chargeTypeRLValue.id ? f.chargeTypeRLValue.id : null ,
        DateFrom: DataProcessing.dateToServer(f.fromDateValue),
        DateTo: DataProcessing.dateToServer(f.toDateValue),
        FirstName: f.firstNameTxtValue || "",
        LastName: f.lastNameTxtValue || "",
        Email: f.emailTxtValue || null,
        Zip: f.zipCodeTxtValue || null,
        Phone: f.phoneNumTxtValue || null,
        CCLast4Digits: f.ccLast4TxtValue || null,
        AccountNumber: f.accountNumberTxtValue || null,
        AccountType: f.accountNumberRLValue && f.accountNumberRLValue.id ? f.accountNumberRLValue.id : null,
        IsRecurringActive: f.recurringStatusRLValue && f.recurringStatusRLValue.id ? f.recurringStatusRLValue.id : null,
        ReferenceNumber: f.refNumberTxtValue || null,
        OrderType: f.orderTypeRLValue && f.orderTypeRLValue.id ? f.orderTypeRLValue.id : null
      };
    };

    var makeCustomers = function (c, startPos) {
      var resultArray = [];
      startPos = startPos || 0;
      for (var i = 0; i < c.length; i++) {
        var obj = c[i];
        obj.id = i + startPos;
        resultArray.push(angular.copy(obj));
      }
      return resultArray;
    };

    return {
      searchFormFields: searchFormFields,
      makeFields: makeFields,
      makeCustomers: makeCustomers
    };
  });

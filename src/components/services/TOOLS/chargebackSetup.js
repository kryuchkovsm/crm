/**
 * Created by user on 03.04.15.
 */

'use strict';

angular.module('ChargebackSetupService', [])
  .factory('ChargebackSetup',
  function(CustomerSetup, SearchSetup, $rootScope) {
    var newChargebackOptions = function () {
      var resultObj = CustomerSetup.customerFieldOptions();
      resultObj.noticeDateOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.notice-date')+':',
        id: 304
      };
      resultObj.faxToTxtOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.fax-to-number')+':',
        placeholder: '1XXXXXXXXXX',
        valRequired: true
      };
      resultObj.midTxtOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.mid')+':',
        placeholder: '',
        valRequired: true
      };
      resultObj.referenceNumberTxtOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.reference-number')+':'
      };
      resultObj.reasonTxtOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.reason')+':',
      };
      resultObj.caseNumberTxtOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.case-number')+':',
        valRequired: true
      };
      resultObj.bankAccountTxtOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.bank-account')+':',
        type: 'number',
        valNumber: true,
        disAllowNegative: true
      };
      resultObj.pdfPagesCheckAllCheckboxOptions = {
        inline: true,
        class: 'weight-bold',
        data: [
          {"id":2,"name": $rootScope.translate('services.tools.chargebacksetup.check-all')}
        ]
      };
      resultObj.pdfPagesCheckboxOptions = {
        inline: 'column',
        data: [
          {"id":38,"name": $rootScope.translate('services.tools.chargebacksetup.cbcustomerdetail')},
          {"id":50,"name": $rootScope.translate('services.tools.chargebacksetup.cbdisputeinformation')},
          {"id":40,"name": $rootScope.translate('services.tools.chargebacksetup.cbofferimage')},
          {"id":48,"name": $rootScope.translate('services.tools.chargebacksetup.cbtermsandconditions')},
          {"id":49,"name": $rootScope.translate('services.tools.chargebacksetup.cbchargebackreceipt')},
        ]
      };
      resultObj.pdfPages1CheckboxOptions = {
        inline: 'column',
        data: [
          {"id":38,"name": $rootScope.translate('services.tools.chargebacksetup.customer-detail')},
          {"id":39,"name": $rootScope.translate('services.tools.chargebacksetup.transaction-detail')},
          {"id":40,"name": $rootScope.translate('services.tools.chargebacksetup.offer-image')}
        ]
      };
      resultObj.pdfPages2CheckboxOptions = {
        inline: 'column',
        data: [
          {"id":48,"name": $rootScope.translate('services.tools.chargebacksetup.terms-and-conditions')},
          {"id":49,"name": $rootScope.translate('services.tools.chargebacksetup.chargeback-receipt')},
          {"id":50,"name": $rootScope.translate('services.tools.chargebacksetup.dispute-information')}
        ]
      };
      resultObj.pdfPagesCheckAllCheckboxOptions2 = resultObj.pdfPagesCheckAllCheckboxOptions;
      resultObj.pdfPages1CheckboxOptions2 = resultObj.pdfPages1CheckboxOptions;
      resultObj.pdfPages2CheckboxOptions2 = resultObj.pdfPages2CheckboxOptions;
      resultObj.retrievalTransactionCheckboxOptions = {
        data: [
          {"id":51,"name": $rootScope.translate('services.tools.chargebacksetup.retrieval-transaction')}
        ]
      };
      resultObj.merchantNameTxtOptions = angular.copy(resultObj.firstnameTxtOptions);
      resultObj.merchantNameTxtOptions.label = $rootScope.translate('services.tools.chargebacksetup.merchant-name')+':';
      resultObj.companyNameTxtOptions = angular.copy(resultObj.firstnameTxtOptions);
      resultObj.companyNameTxtOptions.label = $rootScope.translate('services.tools.chargebacksetup.company-name')+':';
      resultObj.chargebackCodeTxtOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.chargeback-code')+':',
        id: 303,
        type: 'number',
        valNumber: true,
        disAllowNegative: true
      };
      resultObj.chargebackCodeSelectOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.chargeback-code')+':',
        data: [
          {"id":8,"name": $rootScope.translate('services.tools.chargebacksetup.n/a')},
          {"id":9,"name": $rootScope.translate('services.tools.chargebacksetup.does-not-recognize')},
          {"id":10,"name": $rootScope.translate('services.tools.chargebacksetup.credit-not-processed')},
          {"id":11,"name": $rootScope.translate('services.tools.chargebacksetup.duplicate-processing')}
        ],
        valRequired: true,
        id: 215
      };
      resultObj.chargebackAmountTxtOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.chargeback-amount')+':',
        id: 303,
        type: 'number',
        valNumber: true,
        valRequired: true,
        disAllowNegative: true
      };
      resultObj.expirationDateOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.expiration-date')+':',
        id: 304
      };
      // TRANSACTION INFO
      resultObj.transactionAmountTxtOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.transaction-amount')+':',
        id: 303,
        type: 'number',
        valNumber: true,
        valRequired: true,
        disAllowNegative: true
      };
      resultObj.authorizationCodeTxtOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.authorization-code')+':',
        valRequired: true,
        id: 303,
        //type: 'number',
        //valNumber: true,
        //disAllowNegative: true
      };
      resultObj.avsStatusTxtOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.avs-status')+':',
        id: 1
      };
      resultObj.transactionDateOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.transaction-date')+':',
        id: 304
      };
      resultObj.settlementDateOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.settlement-date')+':',
        id: 304
      };
      resultObj.cvsStatusTxtOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.cvs-status')+':',
        id: 1
      };
      // SHIPPING INFO
      resultObj.shippingMethodTxtOptions = {
        upperTip: '(UPS, DHL, etc.)',
        label: $rootScope.translate('services.tools.chargebacksetup.shipping-method')+':',
        id: 1
      };
      resultObj.trackingNumberTxtOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.tracking-number')+':',
        id: 303
      };
      return resultObj;
    };

    var existingChargebacksOptions = function () {
      var resultObj = SearchSetup.searchFormFields();
      angular.extend(resultObj, newChargebackOptions());
      resultObj.searchByRLOptions = {
        wide: true,
        column: true,
        data:
          [{"id":"transactionid","name": $rootScope.translate('services.tools.chargebacksetup.transaction-id'), checked: "checked"},
          {"id":"ach","name": $rootScope.translate('services.tools.chargebacksetup.bank-account-(ach)')},
          {"id":"cc","name": $rootScope.translate('services.tools.chargebacksetup.credit-card')},
          {"id":"additional","name": $rootScope.translate('services.tools.chargebacksetup.additional-options')}]
      };
      resultObj.siteIdTxtOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.site-id')+':',
        id: 1
      };
      resultObj.startDateOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.starting')+':',
        placeholder: '02/04/2015',
        valRequired: true,
        id: 304
      };
      resultObj.endDateOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.ending')+':',
        placeholder: '03/08/2015',
        valRequired: true,
        id: 305
      };
      resultObj.noticeDateOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.notice-date')+':',
        id: 306
      };
      return resultObj;
    };

    var chargebackCodeCategoriesOptions = function () {
      var resultObj = {};

      resultObj.nameTxtOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.name')+':',
        id: 1,
        valRequired: true
      };

      resultObj.disputeSelectOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.dispute')+':',
        data: [
          {"id":8,"name": $rootScope.translate('services.tools.chargebacksetup.test-dispute-1')},
          {"id":9,"name": $rootScope.translate('services.tools.chargebacksetup.test-dispute-2')},
          {"id":10,"name": $rootScope.translate('services.tools.chargebacksetup.test-dispute-3')},
          {"id":11,"name": $rootScope.translate('services.tools.chargebacksetup.test-dispute-4')}
        ],
        id: 215
      };

      resultObj.activeCheckboxOptions = {
        inline: true,
        class: 'weight-bold',
        data: [
          {"id":2,"name": $rootScope.translate('services.tools.chargebacksetup.active')}
        ]
      };
      return resultObj;
    };

    var chargebackCodeEditOptions = function () {
      var resultObj = {};
      resultObj.categorySelectOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.category')+':',
        data: [
          {"id":8,"name": $rootScope.translate('services.tools.chargebacksetup.fraudlent-1')},
          {"id":9,"name": $rootScope.translate('services.tools.chargebacksetup.fraudlent-2')},
          {"id":10,"name": $rootScope.translate('services.tools.chargebacksetup.fraudlent-3')},
          {"id":11,"name": $rootScope.translate('services.tools.chargebacksetup.test-category-4')}
        ],
        id: 215
      };
      resultObj.descriptionTxtOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.description')+':',
        id: 1,
        valRequired: true
      };
      resultObj.sortOrderTxtOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.sort-order')+':',
        id: 1,
        type: 'number',
        valNumber: true,
        disAllowNegative: true
      };
      resultObj.enteredDateOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.date-entered')+':',
        //placeholder: '02/04/2015',
        id: 304
      };
      resultObj.modifiedDateOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.date-modified')+':',
        //placeholder: '03/08/2015',
        id: 304
      };
      resultObj.crmIdTxtOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.crm-id')+':',
        id: 1,
        type: 'number',
        valNumber: true,
        disAllowNegative: true
      };
      resultObj.isDeletedCheckboxOptions = {
        inline: true,
        class: 'weight-bold',
        data: [
          {"id":2,"name": $rootScope.translate('services.tools.chargebacksetup.is-deleted')}
        ]
      };
      return resultObj;
    };

    var disputeEditOptions = function () {
      var resultObj = {};
      resultObj.cbCodeTxtOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.chargeback-code')+':',
        id: 1,
        type: 'number',
        valNumber: true
      };
      resultObj.enteredDateOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.date-entered')+':',
        //placeholder: '02/04/2015',
        id: 304
      };
      resultObj.modifiedDateOptions = {
        label: $rootScope.translate('services.tools.chargebacksetup.date-modified')+':',
        //placeholder: '03/08/2015',
        id: 304
      };
      resultObj.isDeletedCheckboxOptions = {
        inline: true,
        class: 'weight-bold',
        data: [
          {"id":2,"name": $rootScope.translate('services.tools.chargebacksetup.is-deleted')}
        ]
      };
      resultObj.isActiveCheckboxOptions = {
        inline: true,
        class: 'weight-bold',
        data: [
          {"id":3,"name": $rootScope.translate('services.tools.chargebacksetup.is-active')}
        ]
      };
      return resultObj;
    };

    return {
      newChargebackOptions: newChargebackOptions,
      existingChargebacksOptions: existingChargebacksOptions,
      chargebackCodeCategoriesOptions: chargebackCodeCategoriesOptions,
      chargebackCodeEditOptions: chargebackCodeEditOptions,
      disputeEditOptions: disputeEditOptions
    };
  });

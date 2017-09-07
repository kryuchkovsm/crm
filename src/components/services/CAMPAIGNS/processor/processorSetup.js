/**
 * Created by user on 25.03.15.
 */
'use strict';

angular.module('ProcessorSetupService', [])
  .factory('ProcessorSetup',
  function($rootScope) {
    var processorCreateEditFormFields = function () {
      var resultObj = {};
      resultObj.usernameTxtOptions = {
        label: $rootScope.translate('services.campaigns.processor.processorsetup.username')+':',
        id: 1,
        valRequired: true
      };
      resultObj.passwordTxtOptions = {
        label: $rootScope.translate('services.campaigns.processor.processorsetup.password')+':',
        id: 1,
        valRequired: true
      };
      resultObj.processorNameTxtOptions = {
        label: $rootScope.translate('services.campaigns.processor.processorsetup.processor-name')+':',
        id: 1,
        valRequired: true
      };
      resultObj.processorIdTxtOptions = {
        label: $rootScope.translate('services.campaigns.processor.processorsetup.processor-id')+':',
        id: 1,
        type: 'text',
        valRequired: true
      };
      resultObj.monthlyLimitTxtOptions = {
        label: $rootScope.translate('services.campaigns.processor.processorsetup.monthly-limit')+':',
        id: 1,
        type: 'number',
        valNumber: true,
        disAllowNegative: true
      };
      resultObj.currencyRLOptions = {
        label: $rootScope.translate('services.campaigns.processor.processorsetup.currency')+':',
        styles: {
          'padding-top': '7px',
          'padding-bottom': '4px',
          'min-height': '49px'
        },
        data: [
          {"id":1,"name":"USD", checked: true},
          {"id":2,"name":"AUD"},
          {"id":3,"name":"BRL"},
          {"id":4,"name":"EUR"},
          {"id":5,"name":"GBP"}
        ]
      };
      resultObj.stickyRLOptions = {
        label: $rootScope.translate('services.campaigns.processor.processorsetup.is-sticky')+':',
        styles: {
          'padding-top': '15px',
          'padding-bottom': '15px'
        },
        data: [
          {"id":23,"name":"Yes"},
          {"id":24,"name":"No"}
        ]
      };
      resultObj.activeRLOptions = {
        label: $rootScope.translate('services.campaigns.processor.processorsetup.is-active')+':',
        styles: {
          'padding-top': '14px',
          'padding-bottom': '14px'
        },
        data: [
          {"id":25,"name":"Yes"},
          {"id":26,"name":"No"}
        ]
      };
      return resultObj;
    };

    var advancedRuleEditFormFields = function () {
      var resultObj = {};
      resultObj.cardTypeCheckboxOptions = {
        label: $rootScope.translate('services.campaigns.processor.processorsetup.card-type')+':',
        inline: 'inline',
        data: [
          {"id":1,"name":"Visa", checked: true},
          {"id":2,"name":"Mastercard", checked: true},
          {"id":3,"name":"American Express", checked: true},
          {"id":4,"name":"Discover", checked: true},
          {"id":5,"name":"Maestro", checked: true}
        ]
      };

      resultObj.visaVolumeTxtOptions = {
        label: $rootScope.translate('services.campaigns.processor.processorsetup.visa')+':',
        id: 1,
        type: 'number',
        disAllowNegative: true,
        valNumber: true
      };
      resultObj.msVolumeTxtOptions = {
        label: $rootScope.translate('services.campaigns.processor.processorsetup.master-card')+':',
        id: 2,
        type: 'number',
        disAllowNegative: true,
        valNumber: true
      };
      resultObj.aeVolumeTxtOptions = {
        label: $rootScope.translate('services.campaigns.processor.processorsetup.american-express')+':',
        id: 3,
        type: 'number',
        disAllowNegative: true,
        valNumber: true
      };
      resultObj.discVolumeTxtOptions = {
        label: $rootScope.translate('services.campaigns.processor.processorsetup.discover')+':',
        id: 4,
        type: 'number',
        disAllowNegative: true,
        valNumber: true
      };
      resultObj.maeVolumeTxtOptions = {
        label: $rootScope.translate('services.campaigns.processor.processorsetup.maestro')+':',
        id: 5,
        type: 'number',
        disAllowNegative: true,
        valNumber: true
      };

      resultObj.visaCountTxtOptions = {
        label: $rootScope.translate('services.campaigns.processor.processorsetup.visa')+':',
        id: 6,
        type: 'number',
        disAllowNegative: true,
        valNumber: true
      };
      resultObj.msCountTxtOptions = {
        label: $rootScope.translate('services.campaigns.processor.processorsetup.master-card')+':',
        id: 7,
        type: 'number',
        disAllowNegative: true,
        valNumber: true
      };
      resultObj.aeCountTxtOptions = {
        label: $rootScope.translate('services.campaigns.processor.processorsetup.american-express')+':',
        id: 8,
        type: 'number',
        disAllowNegative: true,
        valNumber: true
      };
      resultObj.discCountTxtOptions = {
        label: $rootScope.translate('services.campaigns.processor.processorsetup.discover')+':',
        id: 9,
        type: 'number',
        disAllowNegative: true,
        valNumber: true
      };
      resultObj.maeCountTxtOptions = {
        label: $rootScope.translate('services.campaigns.processor.processorsetup.maestro')+':',
        id: 10,
        type: 'number',
        valNumber: true,
        disAllowNegative: true
      };

      resultObj.visaAmountComboOptions = {
        label: $rootScope.translate('services.campaigns.processor.processorsetup.visa')+':',
        label1: 'Min',
        label2: 'Max',
        doubleNumber: true
      };
      resultObj.msAmountComboOptions = {
        label: $rootScope.translate('services.campaigns.processor.processorsetup.master-card')+':',
        label1: 'Min',
        label2: 'Max',
        doubleNumber: true
      };
      resultObj.aeAmountComboOptions = {
        label: $rootScope.translate('services.campaigns.processor.processorsetup.american-express')+':',
        label1: 'Min',
        label2: 'Max',
        doubleNumber: true
      };
      resultObj.discAmountComboOptions = {
        label: $rootScope.translate('services.campaigns.processor.processorsetup.discover')+':',
        label1: 'Min',
        label2: 'Max',
        doubleNumber: true
      };
      resultObj.maeAmountComboOptions = {
        label: $rootScope.translate('services.campaigns.processor.processorsetup.maestro')+':',
        label1: 'Min',
        label2: 'Max',
        doubleNumber: true
      };

      return resultObj;
    };

    // Return directly only functions and constants (whiteLabel), other things through function(){return {val: someobject};}
    var methods = {
      processorCreateEditFormFields: processorCreateEditFormFields,
      advancedRuleEditFormFields: advancedRuleEditFormFields
    };

    return methods;
  });

/**
 * Created by user on 18.03.15.
 */
'use strict';

angular.module('CampaignSetupService', [])
  .factory('CampaignSetup',

  function($state, ModalService, $rootScope) {

    var toScope = {};

    var fieldOptions = function() {

      var resultObj = [];


      resultObj.push({
        Label: $rootScope.translate('services.campaigns.campaignsetup.campaignsetup.first-name')+':',
        Name: 'FirstName',
        ElementType: "input",
        FieldType: "text",
        needRequired: true,
        needRange: true,
        needAlphanumeric: true,
        id: 1
      });

      resultObj.push({
        Label: $rootScope.translate('services.campaigns.campaignsetup.campaignsetup.last-name')+':',
        Name: 'LastName',
        ElementType: "input",
        FieldType: "text",
        needRequired: true,
        needRange: true,
        needAlphanumeric: true,
        id: 2
      });

      resultObj.push({
        Label: $rootScope.translate('services.campaigns.campaignsetup.campaignsetup.country')+':',
        Name: 'Country',
        ElementType: "select",
        needRequired: true,
        needCountries: true,
        id: 3
      });

      resultObj.push({
        Label: $rootScope.translate('services.campaigns.campaignsetup.campaignsetup.state')+':',
        Name: 'State',
        ElementType: "select",
        needRequired: true,
        id: 4
      });

      resultObj.push({
        Label: $rootScope.translate('services.campaigns.campaignsetup.campaignsetup.city')+':',
        Name: 'City',
        ElementType: "input",
        FieldType: "text",
        needRequired: true,
        needRange: true,
        needAlphanumeric: true,
        id: 5
      });

      resultObj.push({
        Label: $rootScope.translate('services.campaigns.campaignsetup.campaignsetup.address-1')+':',
        Name: 'Address1',
        ElementType: "input",
        FieldType: "text",
        needRequired: true,
        needRange: true,
        needAlphanumeric: true,
        id: 6
      });

      resultObj.push({
        Label: $rootScope.translate('services.campaigns.campaignsetup.campaignsetup.address-2')+':',
        Name: 'Address2',
        ElementType: "input",
        FieldType: "text",
        needRequired: true,
        needRange: true,
        needAlphanumeric: true,
        id: 7
      });

      resultObj.push({
        Label: $rootScope.translate('services.campaigns.campaignsetup.campaignsetup.zip')+':',
        Name: 'Zip',
        ElementType: "input",
        FieldType: "text",
        needRequired: true,
        needRange: true,
        needAlphanumeric: true,
        id: 8
      });

      resultObj.push({
        Label: $rootScope.translate('services.campaigns.campaignsetup.campaignsetup.phone')+':',
        Name: 'Phone',
        ElementType: "input",
        FieldType: "number",
        needRequired: true,
        needMask: true,
        needRange: true,
        id: 9
      });

      resultObj.push({
        Label: $rootScope.translate('services.campaigns.campaignsetup.campaignsetup.email')+':',
        Name: 'Email',
        ElementType: "input",
        FieldType: "email",
        needRequired: true,
        id: 10
      });

      resultObj.push({
        Label: $rootScope.translate('services.campaigns.campaignsetup.campaignsetup.name-on-card')+':',
        Name: 'NameOnCard',
        ElementType: "input",
        FieldType: "text",
        needRequired: true,
        needRange: true,
        needAlphanumeric: true,
        id: 11
      });

      resultObj.push({
        Label: $rootScope.translate('services.campaigns.campaignsetup.campaignsetup.credit-card-type')+':',
        Name: 'CardType',
        ElementType: "select",
        needRequired: true,
        needAlphanumeric: true,
        needCardTypes: true,
        id: 12
      });

      resultObj.push({
        Label: $rootScope.translate('services.campaigns.campaignsetup.campaignsetup.credit-card-number')+':',
        Name: 'CardNumber',
        ElementType: "input",
        FieldType: "number",
        needRequired: true,
        needMod: true,
        needAutoSelect: true,
        id: 13
      });

      resultObj.push({
        Label: $rootScope.translate('services.campaigns.campaignsetup.campaignsetup.expiration-date')+':',
        Name: 'ExpirationDate',
        ElementType: "input",
        FieldType: "text",
        needRequired: true,
        id: 14
      });

      resultObj.push({
        Label: $rootScope.translate('services.campaigns.campaignsetup.campaignsetup.cvv')+':',
        Name: 'CVV',
        ElementType: "input",
        FieldType: "number",
        needRequired: true,
        needRange: true,
        id: 15
      });

      return resultObj;
    };


    var checkboxesOptions = function() {
      var resultObj = {};

      resultObj.customerInfoHeaderCheckboxOptions = {
        inline: 'column',
        class: 'weight-bold',
        data: [
          {"id":1,"name":$rootScope.translate('services.campaigns.campaignsetup.campaignsetup.display-customer-information')}
        ]
      };
      resultObj.customerInfoCheckboxOptions = {
        inline: 'column',
        class: 'margin-left-20',
        data: [
          {"id":2,"name":$rootScope.translate('services.campaigns.campaignsetup.campaignsetup.customer-first/last-name')},
          {"id":3,"name":$rootScope.translate('services.campaigns.campaignsetup.campaignsetup.customer-billing/shipping-address')},
          {"id":4,"name":$rootScope.translate('services.campaigns.campaignsetup.campaignsetup.customer-phone')},
          {"id":5,"name":$rootScope.translate('services.campaigns.campaignsetup.campaignsetup.customer-email')}
        ]
      };

      resultObj.orderInfoHeaderCheckboxOptions = {
        inline: 'column',
        class: 'weight-bold',
        data: [
          {"id":16,"name":$rootScope.translate('services.campaigns.campaignsetup.campaignsetup.display-order-information')}
        ]
      };
      resultObj.orderInfoCheckboxOptions = {
        inline: 'column',
        class: 'margin-left-20',
        data: [
          {"id":17,"name":$rootScope.translate('services.campaigns.campaignsetup.campaignsetup.display-product-name')},
          {"id":18,"name":$rootScope.translate('services.campaigns.campaignsetup.campaignsetup.display-product-amount')},
          {"id":19,"name":$rootScope.translate('services.campaigns.campaignsetup.campaignsetup.display-total-product-tax')},
          {"id":20,"name":$rootScope.translate('services.campaigns.campaignsetup.campaignsetup.display-subtotal')},
          {"id":21,"name":$rootScope.translate('services.campaigns.campaignsetup.campaignsetup.display-shipping-amount')},
          {"id":22,"name":$rootScope.translate('services.campaigns.campaignsetup.campaignsetup.display-total-amount')},
          {"id":23,"name":$rootScope.translate('services.campaigns.campaignsetup.campaignsetup.display-transaction-id')},
          {"id":24,"name":$rootScope.translate('services.campaigns.campaignsetup.campaignsetup.display-customer-id')}
        ]
      };

      resultObj.useTablesHeaderCheckboxOptions = {
        inline: 'column',
        class: 'weight-bold',
        data: [
          {"id":16,"name":"Use Tables"}
        ]
      };
      resultObj.useTablesCheckboxOptions = {
        inline: 'column',
        class: 'margin-left-20',
        data: [
          {"id":17,"name":$rootScope.translate('services.campaigns.campaignsetup.campaignsetup.enable-borders')},
          {"id":18,"name":$rootScope.translate('services.campaigns.campaignsetup.campaignsetup.horizontally-centered-within-page')},
          {"id":19,"name":$rootScope.translate('services.campaigns.campaignsetup.campaignsetup.center-text')}
        ]
      };

      return resultObj;
    };

    var methods = {
      fieldOptions: fieldOptions,
      checkboxesOptions: checkboxesOptions
    };

  return methods;
});

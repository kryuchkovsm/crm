'use strict';

angular.module('ExportSetupService', [])
  .factory('ExportSetup', function(ChartInit, $rootScope) {

    var fieldOptions = function () {
      var resultObj = {};
      resultObj.activeRLOptions = {
        label: $rootScope.t('crm.export.recurring-status'),
        data: [{
          "id":-1,
          "name": $rootScope.t('services.crm.exportsetup.any'), 
          checked: 'checked'
        },
        {
          "id":1,
          "name": $rootScope.t('services.crm.exportsetup.active')
        },
        {
          "id":0,
          "name": $rootScope.t('services.crm.exportsetup.inactive')
        }]
      };

      resultObj.clientsSettings = {
        enableSearch: true,
        scrollableHeight: '163px',
        scrollable: true,
        idProp: 'ClientID',
        displayProp: 'CompanyName',
        selectName: $rootScope.t('common.clients'),
        valRequired: true
      };

      //  2nd select
      resultObj.sitesSettings = {
        idProp: 'SiteID',
        displayProp: 'Name',
        enableSearch: true,
        scrollableHeight: '163px',
        scrollable: true,
        searchPlaceholder: $rootScope.t('common.sites-type-here-or-select-from-list'),
        selectName: $rootScope.t('common.sites'),
        valRequired: true
      };

      //  3rd select
      resultObj.reportOptionsSettings = {
        idProp: 'id',
        displayProp: 'name',
        enableSearch: false,
        scrollableHeight: '207px',
        scrollable: true,
        selectName: $rootScope.t('crm.export.report-options'),
        selectionLimit: 1, 
        valRequired: true, 
      };

      //  4th select
      resultObj.chargeTypeSettings = {
        idProp: 'id',
        displayProp: 'name',
        enableSearch: false,
        scrollableHeight: '115px',
        scrollable: true,
        selectName: $rootScope.t('crm.export.charge-type'),
      };

      //  5th select
      resultObj.transactionTypeSettings = {
        idProp: 'id',
        displayProp: 'name',
        enableSearch: false,
        scrollableHeight: '115px',
        scrollable: true,
        selectName: $rootScope.t('crm.export.transaction-type'),
      };

      //  6th select
      resultObj.transactionResultSettings = {
        idProp: 'id',
        displayProp: 'name',
        enableSearch: false,
        scrollableHeight: '115px',
        scrollable: true,
        searchPlaceholder: $rootScope.t('crm.export.transaction-result.type-transaction-result'),
        selectName: $rootScope.t('crm.export.transaction-result'),
      };

      resultObj.stepTypeSettings = {
        idProp: 'id',
        displayProp: 'name',
        enableSearch: false,
        scrollableHeight: '156px',
        scrollable: true,
        selectName: $rootScope.t('crm.export.last-step')
      };

      resultObj.fromDateOptions = {
        //width: 110,
        label: $rootScope.t('common.from'),
        id: 304,
        inline: true
      };

      resultObj.toDateOptions = {
        //width: 110,
        label: $rootScope.t('common.to'),
        id: 305,
        inline: true
      };

      resultObj.fromDateOptionsSmall = {
        label: $rootScope.t('common.from'),
        id: 304,
        small: true
      };

      resultObj.toDateOptionsSmall = {
        label: $rootScope.t('common.to'),
        id: 305,
        small: true
      };

      return resultObj;
    };

    return {
      fieldOptions: fieldOptions,
    };
  });

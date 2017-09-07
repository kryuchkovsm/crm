/**
 * Created by user on 4/24/15.
 */
'use strict';

angular.module('DeclineSetupService', [])
  .factory('DeclineSetup', function(DataStorage, $q, $rootScope) {

    //merge with usage below
    var fields = function () {
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
        scrollableHeight: '100px',
        scrollable: true,
        selectName: $rootScope.t('crm.export.report-options'),
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
        enableSearch: true,
        scrollableHeight: '108px',
        scrollable: true,
        searchPlaceholder: $rootScope.t('crm.export.transaction-result.type-transaction-result'),
        selectName: $rootScope.t('crm.export.transaction-result'),
      };

      resultObj.stepTypeSettings = {
        idProp: 'id',
        displayProp: 'name',
        enableSearch: false,
        scrollableHeight: '100px',
        scrollable: true,
        selectName: $rootScope.t('crm.export.last-step'),
        selectionLimit: 1
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

      resultObj.clientsSettings = {
        enableSearch: true,
        scrollableHeight: '163px',
        scrollable: true,
        idProp: 'ClientID',
        displayProp: 'CompanyName',
        selectName: $rootScope.t('common.clients'),
        valRequired: true
      };

      return resultObj;
    };


    var fieldOptions = function () {
      var resultObj = fields();
      resultObj.useCurrentDateOptions = {
        label: 'SET RECURRENCE TO CURRENT DATE:',
        styles: {
          "margin-top": "16px",
          "margin-bottom": "14px"
        },
        data: [{"id":"Yes", "name":"Yes"},{"id":"No", "name":"No", checked: true}],
      };
      resultObj.searchForTxtOptions = {
        label: 'SEARCH FOR:',
        id: 305
      };
      resultObj.setRecurrenceRLOptions = {
        label: 'SET RECURRENCE TO CURRENT DATE?',
        data: [{"id":1,"name":"Yes"},{"id":2,"name":"No", "checked": "checked"}]
      };

      return resultObj;
    };

    // Return directly only functions and constants (whiteLabel), other things through function(){return {val: someobject};}
    return {
      fieldOptions: fieldOptions
    };
  });

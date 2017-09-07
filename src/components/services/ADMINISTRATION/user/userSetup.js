/**
 * Created by user on 26.03.15.
 */
'use strict';

angular.module('UserSetupService', [])
  .factory('UserSetup',
  function($rootScope) {

    var userCreateAccessFormFields = function () {
      var resultObj = {};

      // DASH
      resultObj.dashCheckAllCheckboxOptions = {
        inline: true,
        class: 'weight-bold',
        data: [
          {"id":2,"name":$rootScope.translate('services.administration.user.usersetup.check-all')}
        ]
      };
      resultObj.dash1CheckboxOptions = {
        inline: 'column',
        data: [
          {"id":8,"name":$rootScope.translate('services.administration.user.usersetup.conversion-viewer')},
          {"id":11,"name":$rootScope.translate('services.administration.user.usersetup.projection-viewer')}
        ]
      };
      resultObj.dash2CheckboxOptions = {
        inline: 'column',
        data: [
          {"id":9,"name":$rootScope.translate('services.administration.user.usersetup.billing-viewer')},
          {"id":12,"name":$rootScope.translate('services.administration.user.usersetup.user-viewer')}
        ]
      };
      resultObj.dash3CheckboxOptions = {
        inline: 'column',
        data: [
          {"id":10,"name":$rootScope.translate('services.administration.user.usersetup.processing-viewer')}
        ]
      };

      //CRM
      resultObj.crmCheckAllCheckboxOptions = {
        inline: true,
        class: 'weight-bold',
        data: [
          {"id":3,"name":$rootScope.translate('services.administration.user.usersetup.check-all')}
        ]
      };
      resultObj.crm1CheckboxOptions = {
        inline: 'column',
        data: [
          {"id":13,"name":$rootScope.translate('services.administration.user.usersetup.search')},
        ]
      };
      resultObj.crm2CheckboxOptions = {
        inline: 'column',
        data: [
          {"id":14,"name":$rootScope.translate('services.administration.user.usersetup.customers')},
        ]
      };
      resultObj.crm3CheckboxOptions = {
        inline: 'column',
        data: [
          {"id":15,"name":$rootScope.translate('services.administration.user.usersetup.export-data')}
        ]
      };

      // REPORTS
      resultObj.reportsCheckAllCheckboxOptions = {
        inline: true,
        class: 'weight-bold',
        data: [
          {"id":4,"name":$rootScope.translate('services.administration.user.usersetup.check-all')}
        ]
      };

      resultObj.reportsHeaderConversionCheckboxOptions = {
        inline: 'column',
        class: 'weight-bold',
        data: [
          {"id":16,"name":$rootScope.translate('services.administration.user.usersetup.conversion-viewer')}
        ]
      };
      resultObj.reportsConversionOptionsCheckboxOptions = {
        inline: 'column',
        class: 'margin-left-20',
        data: [
          {"id":17,"name":$rootScope.translate('services.administration.user.usersetup.hyperlink-data')},
          {"id":18,"name":$rootScope.translate('services.administration.user.usersetup.preclicks')},
          {"id":19,"name":$rootScope.translate('services.administration.user.usersetup.landing-clicks')},
          {"id":20,"name":$rootScope.translate('services.administration.user.usersetup.click-through-%')},

          {"id":21,"name":"Inquiries"},
          {"id":22,"name":"Declines"},
          {"id":23,"name":"Paid"},
          {"id":24,"name":"Tracked"},
          {"id":25,"name":"Actual"},
          {"id":26,"name":"CPA"},
          {"id":27,"name":"ECPA"},
          {"id":28,"name":"EPC"},
          {"id":29,"name":"S/U%"},
          {"id":30,"name":"Inq:Ord"},
          {"id":31,"name":"Dec %"}
        ]
      };

      // 2nd column
      resultObj.reportsHeaderBillingCheckboxOptions = {
        inline: 'column',
        class: 'weight-bold',
        data: [
          {"id":32,"name":$rootScope.translate('services.administration.user.usersetup.billing-viewer')}
        ]
      };
      resultObj.reportsBillingHyperlinkCheckboxOptions = {
        inline: 'column',
        class: 'margin-left-20',
        data: [
          {"id":33,"name":$rootScope.translate('services.administration.user.usersetup.hyperlink-data')}
        ]
      };

      resultObj.reportsHeaderProcessingCheckboxOptions = {
        inline: 'column',
        class: 'weight-bold',
        data: [
          {"id":34,"name":$rootScope.translate('services.administration.user.usersetup.processing-viewer')}
        ]
      };
      resultObj.reportsProcessingHyperlinkCheckboxOptions = {
        inline: 'column',
        class: 'margin-left-20',
        data: [
          {"id":35,"name":$rootScope.translate('services.administration.user.usersetup.hyperlink-data')}
        ]
      };

      resultObj.reportsHeaderProjectionCheckboxOptions = {
        inline: 'column',
        class: 'weight-bold',
        data: [
          {"id":36,"name":$rootScope.translate('services.administration.user.usersetup.projection-viewer')}
        ]
      };
      resultObj.reportsProjectionHyperlinkCheckboxOptions = {
        inline: 'column',
        class: 'margin-left-20',
        data: [
          {"id":37,"name":$rootScope.translate('services.administration.user.usersetup.hyperlink-data')}
        ]
      };

      resultObj.reportsHeaderUserheckboxOptions = {
        inline: 'column',
        class: 'weight-bold',
        data: [
          {"id":38,"name":$rootScope.translate('services.administration.user.usersetup.user-viewer')}
        ]
      };
      resultObj.reportsUserHyperlinkCheckboxOptions = {
        inline: 'column',
        class: 'margin-left-20',
        data: [
          {"id":39,"name":$rootScope.translate('services.administration.user.usersetup.hyperlink-data')}
        ]
      };

      resultObj.reportsHeaderChargebackCheckboxOptions = {
        inline: 'column',
        class: 'weight-bold',
        data: [
          {"id":40,"name":$rootScope.translate('services.administration.user.usersetup.chargeback-viewer')},
          {"id":41,"name":$rootScope.translate('services.administration.user.usersetup.transaction-viewer')},
          {"id":42,"name":$rootScope.translate('services.administration.user.usersetup.income-viewer')},
          {"id":43,"name":$rootScope.translate('services.administration.user.usersetup.marketing-viewer')}
        ]
      };


      // CAMPAIGN CONFIGURATION
      resultObj.campaignConfCheckAllCheckboxOptions = {
        inline: true,
        class: 'weight-bold',
        data: [
          {"id":5,"name":$rootScope.translate('services.administration.user.usersetup.check-all')}
        ]
      };
      resultObj.campaign1CheckboxOptions = {
        inline: 'column',
        data: [
          {"id":44,"name":$rootScope.translate('services.administration.user.usersetup.processor-configuration')},
          {"id":45,"name":$rootScope.translate('services.administration.user.usersetup.setup-new-sites')},
          {"id":46,"name":$rootScope.translate('services.administration.user.usersetup.site-configuration')}
        ]
      };
      resultObj.campaign2CheckboxOptions = {
        inline: 'column',
        data: [
          {"id":47,"name":$rootScope.translate('services.administration.user.usersetup.product-configuration')},
          {"id":48,"name":$rootScope.translate('services.administration.user.usersetup.mdf-configuration')}
        ]
      };
      resultObj.campaign3CheckboxOptions = {
        inline: 'column',
        data: [
          {"id":49,"name":$rootScope.translate('services.administration.user.usersetup.email-auto-responder')},
          {"id":50,"name":$rootScope.translate('services.administration.user.usersetup.terms')}
        ]
      };



      // TOOLS
      resultObj.toolsCheckAllCheckboxOptions = {
        inline: true,
        class: 'weight-bold',
        data: [
          {"id":6,"name":$rootScope.translate('services.administration.user.usersetup.check-all')}
        ]
      };
      resultObj.tools1CheckboxOptions = {
        inline: 'column',
        data: [
          {"id":51,"name":$rootScope.translate('services.administration.user.usersetup.chargebacks')}
        ]
      };
      resultObj.tools2CheckboxOptions = {
        inline: 'column',
        data: [
          {"id":52,"name":$rootScope.translate('services.administration.user.usersetup.declines')}
        ]
      };

      // ADMINISTRATION
      resultObj.administrationCheckAllCheckboxOptions = {
        inline: true,
        class: 'weight-bold',
        data: [
          {"id":53,"name":$rootScope.translate('services.administration.user.usersetup.check-all')}
        ]
      };
      resultObj.administration1CheckboxOptions = {
        inline: 'column',
        data: [
          {"id":54,"name":$rootScope.translate('services.administration.user.usersetup.clients')}
        ]
      };
      resultObj.administration2CheckboxOptions = {
        inline: 'column',
        data: [
          {"id":55,"name":$rootScope.translate('services.administration.user.usersetup.users')}
        ]
      };
      resultObj.administration3CheckboxOptions = {
        inline: 'column',
        data: [
          {"id":56,"name":$rootScope.translate('services.administration.user.usersetup.configuration-center')}
        ]
      };

      return resultObj;
    }


    var userCreateEditFormFields = function () {
      var resultObj = {};

      resultObj.usernameTxtOptions = {
        label: $rootScope.translate('services.administration.user.usersetup.user-name')+':',
        id: 1,
        valRequired: true
      };
      resultObj.firstnameTxtOptions = {
        label: $rootScope.translate('services.administration.user.usersetup.first-name')+':',
        id: 1,
        valRequired: true
      };
      resultObj.lastnameTxtOptions = {
        label: $rootScope.translate('services.administration.user.usersetup.last-name')+':',
        id: 1,
        valRequired: true
      };
      resultObj.usertypeTxtOptions = {
        label: $rootScope.translate('services.administration.user.usersetup.user-type')+':',
        id: 1,
        valRequired: true
      };
      // second col
      resultObj.emailTxtOptions = {
        label: $rootScope.translate('services.administration.user.usersetup.email')+':',
        id: 1,
        type: 'email',
        valRequired: true,
        valEmail: true
      };
      resultObj.confirmemailTxtOptions = {
        label: $rootScope.translate('services.administration.user.usersetup.confirm-email')+':',
        id: 1,
        type: 'email',
        valRequired: true,
        valEmail: true,
        equals: 'user.Email'
      };
      resultObj.gatewayTxtOptions = {
        label: $rootScope.translate('services.administration.user.usersetup.gateway-user-id')+':',
        id: 1,
        alphanumeric: true
      };
      resultObj.optionsCheckboxOptions = {
        label: $rootScope.translate('services.administration.user.usersetup.options')+':',
        data: [
          {"id":25,"name":"Active", "value": true},
          {"id":26,"name":"Locked Out", "value": true}
        ]
      };
      return resultObj;
    }

    return {
      userCreateEditFormFields: userCreateEditFormFields,
      userCreateAccessFormFields: userCreateAccessFormFields
    };
  });

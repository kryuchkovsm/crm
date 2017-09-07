angular.module('crm').config(function ($stateProvider, $urlRouterProvider, flowFactoryProvider) {

  var authResolve = function($q, AuthService, $state) {
    var deferred = $q.defer();
    AuthService.resolveAuth().then(function(){
      deferred.resolve();
    }, function(){
      $state.go('main.login')
      deferred.reject();
    });
    return deferred.promise;
  };

  var commonResolve = ['$q', 'AuthService', '$state', 'auth', function($q, AuthService, $state) {
    var deferred = $q.defer();
    AuthService.resolveCommon().then(function(common){
      deferred.resolve(common);
    }, function(){
      $state.go('main.login')
      deferred.reject();
    });
    return deferred.promise;
  }];

  var authSection = ['$state', '$q', '$filter', 'common', 
    function($state, $q, $filter, common){
    
    var deferred = $q.defer();

    var commonObject = common;
    if (!commonObject){
      deferred.reject();
      return;
    }
    
    var state = this;
    var authorizedSections = commonObject.AuthorizedSections || [];
    if ($filter('searchAuthSection')(authorizedSections, {RouteName: state.self.name})){
      deferred.resolve();
    }else{
      $state.go('main.dashboard')
      deferred.reject();
    }

    return deferred.promise;
  }];

  $stateProvider
    .state('main', {
      url: '/',
      templateUrl: 'app/COMMON/main/main.html',
      controller: 'MainCtrl'
    })
    
    .state('main.login', {
      url: 'login?passwordChanged',
      templateUrl: 'app/COMMON/auth/login/login.html',
      controller: 'LoginCtrl',
      reloadOnSearch: false,
      params: {
        'withReload': false
      },
      resolve: {
        loginResolve: ["$q", "AuthService", "$state", function($q, AuthService, $state) {
          var deferred = $q.defer();
          AuthService.resolveAuth().then(function(){
            $state.go('main.dashboard')
            deferred.reject();
          }, function(){
            deferred.resolve();
          });
          return deferred.promise;
        }]
      }
    })

    .state('main.smtpconfirm', {
      url: 'smtpconfirm?key',
      templateUrl: 'app/CAMPAIGNS/email/smtp/confirmSmtp.html',
      controller: 'ConfirmSMTP',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        resolvedConfirm: ['$stateParams', 'DataStorage', 'auth', function($stateParams, DataStorage){
          var url = '/emailautoresponders/smtpservers/confirmation/confirm/' + $stateParams.key;
          return DataStorage.anyApiMethod(url).post({}).$promise; 
        }]
      }
    })

    .state('main.confirm', {
      url: 'confirm?key',
      templateUrl: 'app/COMMON/auth/confirmPassReset/confirmPassReset.html',
      controller: 'ConfirmPassReset',
      resolve: {
        resolvedConfirm: function($stateParams, AuthService){ 
          return AuthService.confirmRestorePass($stateParams.key).check().$promise; 
        }
      }
    })
    
    .state('main.newpassword', {
      url: 'newpassword?key',
      templateUrl: 'app/COMMON/auth/setNewPassword/setNewPass.html',
      controller: 'SetNewPasswordCtrl'
    })

    .state('main.dashboard', {
      url: 'dashboard',
      templateUrl: 'app/DASHBOARD/dash.html',
      controller: 'DashCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve
      }
    })
    
    .state('main.search', {
      url: "search",
      templateUrl: "app/CRM/search/search.html",
      controller: 'SearchCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection,
        resolvedIndex: ['DataStorage', 'authSection', function(DataStorage) {
          return DataStorage.anyApiMethod('/search/index').query().$promise;
        }]
      }
    })
    
    .state('main.customer', {
      url: "customer/:cuid?openForm",
      templateUrl: "app/CRM/customer/customer.html",
      controller: 'CustomerCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        resolvedCustomer: ['$stateParams', 'DataStorage', 'auth', function($stateParams, DataStorage) {
          return DataStorage.customerApi($stateParams.cuid).query().$promise;
        }]
      }
    })
    
    .state('main.editcustomer', {
      url: "customer/edit?cuid",
      templateUrl: "app/CRM/customer/editCustomer.html",
      controller: 'EditCustomerCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        resolvedCustomer: ['$stateParams', 'DataStorage', '$q', 'auth', function($stateParams, DataStorage, $q) {
          var deferred = $q.defer()
          DataStorage.editCustomerApi($stateParams.cuid).query(function(resp){
            if (resp.Status) 
              deferred.reject(resp)
            else 
              deferred.resolve(resp)
          }, deferred.reject);

          return deferred.promise
        }]
      }
    })
    
    .state('main.editcustomerrecurring', {
      url: "customer/recurring/edit?cuid&intervalid",
      templateUrl: "app/CRM/customer/editCustomerRecurring.html",
      controller: 'EditCustomerRecurringCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        resolvedRecurring: ['$stateParams', 'DataStorage', 'auth', function ($stateParams, DataStorage) {
          var customerId = $stateParams.cuid || '';
          var intervalId = $stateParams.intervalid || '';
          if (customerId && !intervalId) {
            return DataStorage.getCustomerRecurring(customerId).query().$promise;
          } else if (customerId && intervalId) {
            return DataStorage.getCustomerEditRecurring(customerId, intervalId).query().$promise;
          } else {
            return false;
          }
        }]
      }
    })
    
    .state('main.addcustomerrecurring', {
      url: "customer/recurring/add?cuid",
      templateUrl: "app/CRM/customer/editCustomerRecurring.html",
      controller: 'EditCustomerRecurringCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        resolvedRecurring: ['$stateParams', 'DataStorage', 'auth', function ($stateParams, DataStorage) {
          var customerId = $stateParams.cuid || '',
            intervalId = $stateParams.intervalid || '';
          if (customerId && !intervalId) {
            return DataStorage.getCustomerRecurring(customerId).query().$promise;
          } else if (customerId && intervalId) {
            return DataStorage.getCustomerEditRecurring(customerId, intervalId).query().$promise;
          } else {
            return false;
          }
        }]
      }
    })
    
    .state('main.importTracking', {
      url: "customer/tracking/import",
      templateUrl: "app/CRM/importTracking/importTracking.html",
      controller: 'ImportTrackingCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection
      }
    })
    
    .state('main.export', {
      url: "export",
      templateUrl: "app/CRM/export/export.html",
      controller: 'ExportCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection
      }
    })
    
    .state('main.addlead', {
      url: "leads/add",
      templateUrl: "app/CRM/lead/lead.html",
      controller: 'LeadCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection,
        resolvedIndex: ['DataStorage', 'auth', function(DataStorage){
          return DataStorage.anyApiMethod('/addlead/index').query().$promise;
        }]
      }
    })
    
    .state('main.importleads', {
      url: "leads/import",
      templateUrl: "app/CRM/lead/importLeads.html",
      controller: 'ImportLeadsCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection
      }
    })

    .state('main.support', {
      url: "support",
      templateUrl: "app/SUPPORT/support/support.html",
      controller: 'SupportCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection
      }
    })
    
    .state('main.helpcenter', {
      url: "helpcenter",
      controller: 'HelpCenterCtrl',
      templateUrl: "app/SUPPORT/helpCenter/helpCenter.html",
      resolve: {

      }
    })
    
    .state('main.helpcenter.article', {
      url: "/article?articleId",
      templateUrl: "app/SUPPORT/helpCenter/article.html",
      controller: 'HelpCenterCtrl',
      resolve: {

      }
    })
    
    .state('main.style', {
      url: "style",
      templateUrl: "app/ADMINISTRATION/style/style.html",
      controller: 'StyleCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection,
        resolvedStyles: ['DataStorage', 'auth', function(DataStorage){ 
          return DataStorage.initStylesApi().getStyles().$promise; 
        }]
      }
    })
    
    .state('main.merchants', {
      url: "merchants?clientID&siteID",
      templateUrl: "app/ADMINISTRATION/merchants/merchants.html",
      controller: 'MerchantsCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection,
        resolvedClientSiteCharges: ['DataStorage', 'auth', function(DataStorage){ 
          return DataStorage.merchantsAnyApi("index").query().$promise; 
        }]
      }
    })
    
    .state('main.users', {
      url: "users",
      templateUrl: "app/ADMINISTRATION/users/users.html",
      controller: 'UsersCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection
      }
    })
    
    .state('main.clients', {
      url: "clients",
      templateUrl: "app/ADMINISTRATION/clients/clients.html",
      controller: 'ClientsCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection
      }
    })
    
    .state('main.configCenter', {
      url: "configCenter",
      templateUrl: "app/ADMINISTRATION/configCenter/configCenter.html",
      controller: 'ConfigCenterCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection
      }
    })
    
    .state('main.searchchargebacks', {
      url: "chargebacks/search",
      templateUrl: "app/TOOLS/chargebacks/searchChargebacks.html",
      controller: 'searchChargebacksCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection
      }
    })
    
    .state('main.addchargeback', {
      url: "chargebacks/search/transaction",
      templateUrl: "app/TOOLS/chargebacks/searchChargebacks.html",
      controller: 'searchChargebacksCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection
      }
    })
    
    .state('main.editchargeback', {
      url: "chargebacks/edit?c",
      templateUrl: "app/TOOLS/chargebacks/editChargeback.html",
      controller: 'editChargebackCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
      }
    })
    
    .state('main.addnewchargeback', {
      url: "chargebacks/add?transactionId",
      templateUrl: "app/TOOLS/chargebacks/editChargeback.html",
      controller: 'editChargebackCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve
      }
    })
    
    .state('main.chargebackcodecategories', {
      url: "chargebacks/codecategories",
      templateUrl: "app/TOOLS/chargebacks/chargebackCodeCategories.html",
      controller: 'chargebackCodeCategoriesCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection
      }
    })
    
    .state('main.chargebackcodes', {
      url: "chargebacks/codes",
      templateUrl: "app/TOOLS/chargebacks/chargebackCodes.html",
      controller: 'chargebackCodesCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection,
        resolvedCategories: ['DataStorage', 'auth', function(DataStorage){
          return DataStorage.anyApiMethod('/chargeback/codes/add').query().$promise
        }]
      }
    })
    
    .state('main.disputes', {
      url: "chargebacks/disputes",
      templateUrl: "app/TOOLS/chargebacks/disputes.html",
      controller: 'disputesCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection,
        resolveDisputesCodes: ['DataStorage', 'auth', function(DataStorage){
          return DataStorage.anyApiMethod('/chargeback/disputes/add').query().$promise
        }]
      }
    })
    
    .state('main.declinerunner', {
      url: "declinerunner",
      templateUrl: "app/TOOLS/declinerunner/declinerunner.html",
      controller: 'declinerunnerCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection
      }
    })
    
    .state('main.whitelabels', {
      url: "whitelabels",
      templateUrl: "app/TOOLS/whitelabels/whitelabels.html",
      controller: 'WhitelabelsCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection,
        resolvedAvailableIp: ['DataStorage', 'auth', function(DataStorage){ 
          return DataStorage.anyApiMethod('/crm/ip/available').query().$promise; 
        }]
      }
    })
    
    .state('main.periscopeConversion', {
      url: "reports/periscope/conversion",
      templateUrl: "app/REPORTS/periscopeConversion/periscopeConversionReport.html",
      controller: 'periscopeConversionReportCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection
      }
    })
    
    .state('main.periscopeTransaction', {
      url: "reports/periscope/transaction",
      templateUrl: "app/REPORTS/periscopeTransaction/periscopeTransactionReport.html",
      controller: 'periscopeTransactionReportCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection
      }
    })
    
    .state('main.periscopeRecurring', {
      url: "reports/periscope/recurring",
      templateUrl: "app/REPORTS/periscopeRecurring/periscopeRecurringReport.html",
      controller: 'periscopeRecurringReportCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection
      }
    })
    
    .state('main.periscopeFulfillment', {
      url: "reports/periscope/fulfillment",
      templateUrl: "app/REPORTS/periscopeFulfillment/periscopeFulfillmentReport.html",
      controller: 'periscopeFulfillmentReportCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection
      }
    })
    
    .state('main.periscopeDeclines', {
      url: "reports/periscope/declines",
      templateUrl: "app/REPORTS/periscopeDeclines/periscopeDeclinesReport.html",
      controller: 'periscopeDeclinesReportCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection
      }
    })
    
    .state('main.chargebackreport', {
      url: "reports/chargeback",
      templateUrl: "app/REPORTS/chargebackReport/chargebackReport.html",
      controller: 'chargebackReportCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection
      }
    })
    
    .state('main.conversionreport', {
      url: "reports/conversion",
      templateUrl: "app/REPORTS/conversionReport/conversionReport.html",
      controller: 'conversionReportCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection
      }
    })
    
    .state('main.transactionreport', {
      url: "reports/transaction",
      templateUrl: "app/REPORTS/transactionReport/transactionReport.html",
      controller: 'transactionReportCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection
      }
    })
    
    .state('main.incomereport', {
      url: "reports/income",
      templateUrl: "app/REPORTS/incomeReport/incomeReport.html",
      controller: 'incomeReportCtrl',
      resolve: {
        auth: authResolve
      }
    })
    
    .state('main.recurringreport', {
      url: "reports/recurring",
      templateUrl: "app/REPORTS/recurringReport/recurringReport.html",
      controller: 'recurringReportCtrl',
      resolve: {
        auth: authResolve
      }
    })
    
    .state('main.marketingreport', {
      url: "reports/marketing",
      templateUrl: "app/REPORTS/marketingReport/marketingReport.html",
      controller: 'marketingReportCtrl',
      resolve: {
        auth: authResolve
      }
    })
    
    .state('main.billingreport', {
      url: "reports/billing",
      templateUrl: "app/REPORTS/billingReport/billingReport.html",
      controller: 'billingReportCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection
      }
    })
    
    .state('main.processingreport', {
      url: "reports/processing",
      templateUrl: "app/REPORTS/processingReport/processingReport.html",
      controller: 'processingReportCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection
      }
    })
    
    .state('main.projectionreport', {
      url: "reports/projection",
      templateUrl: "app/REPORTS/projectionReport/projectionReport.html",
      controller: 'projectionReportCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection
      }
    })
    
    .state('main.userreport', {
      url: "reports/users",
      templateUrl: "app/REPORTS/userReport/userReport.html",
      controller: 'userReportCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection
      }
    })
    
    .state('main.siteDuplicator', {
      url: "siteDuplicator",
      templateUrl: "app/ADMINISTRATION/siteDuplicator/siteDuplicator.html",
      controller: 'SiteDuplicatorCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection
      }
    })
    
    .state('main.sites', {
      url: "sites?clientID",
      templateUrl: "app/CAMPAIGNS/sites/sites.html",
      controller: 'SitesCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection,
        resolvedSitesForOneClient: ['$stateParams', 'DataStorage', 'auth', function($stateParams, DataStorage) {
          if (!$stateParams.clientID) 
            return []
          return DataStorage.sitesApi().query({clientID: $stateParams.clientID}).$promise;
        }]
      }
    })
    
    .state('main.newsite', {
      url: "sites/new?ClientID",
      templateUrl: "app/CAMPAIGNS/sites/siteOptions.html",
      controller: 'SiteOptionsCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection,
        resolvedSiteDetails: ['$stateParams', 'DataStorage', 'auth', function($stateParams, DataStorage){
          if (!$stateParams.SiteID) 
            return false;
            
          return DataStorage.sitesAnyApi('edit/' + $stateParams.SiteID).query().$promise;
        }]
      }
    })
    
    .state('main.siteoptions', {
      url: "siteoptions?SiteID&ClientID&email&offers",
      templateUrl: "app/CAMPAIGNS/sites/siteOptions.html",
      controller: 'SiteOptionsCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        resolvedSiteDetails: ['$stateParams', 'DataStorage', 'auth', function($stateParams, DataStorage){
          if (!$stateParams.SiteID) 
            return false;
            
          return DataStorage.sitesAnyApi('edit/' + $stateParams.SiteID).query().$promise;
        }]
      }
    })
    
    .state('main.products', {
      url: "products?clientID",
      templateUrl: "app/CAMPAIGNS/products/products.html",
      controller: 'ProductsCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection
      }
    })
    
    .state('main.mdfconfig', {
      url: "mdfconfig?clientID",
      templateUrl: "app/CAMPAIGNS/mdf/mdf.html",
      controller: 'MdfCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection,
        resolvedMdfs: ['$stateParams', 'DataStorage', 'auth', function($stateParams, DataStorage) {
          if (!$stateParams.clientID) 
            return []
            
          var action = '/' + $stateParams.clientID;
          return DataStorage.mdfsAnyApi(action).query().$promise;
        }]
      }
    })
    
    .state('main.processorconfig', {
      url: "processors?clientID",
      templateUrl: "app/CAMPAIGNS/processor/processor.html",
      controller: 'ProcessorCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection,
        resolvedProcessors: ['$stateParams', 'DataStorage', 'auth', function($stateParams, DataStorage) {
          if (!$stateParams.clientID) 
            return []
          var action = '/' + $stateParams.clientID + '?active=all';
          return DataStorage.processorAnyApi(action).query().$promise;
        }]
      }
    })
    
    .state('main.emailtemplates', {
      url: "email/templates?clientID",
      controller: 'EmailTemplatesCtrl',
      templateUrl: "app/CAMPAIGNS/email/templates/templates.html",
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection
      }
    })
    
    .state('main.emailtemplates.modify', {
      url: "/modify?templateId",
      templateUrl: "app/CAMPAIGNS/email/templates/addEditTpl.html",
      controller: 'EmailTemplatesCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        lazyLoad: ['$ocLazyLoad', function($ocLazyLoad) {
          return $ocLazyLoad.load('/vendors/tinymce-dist/tinymce.min.js');
        }]
      }
    })
    
    .state('main.emailsmtp', {
      url: "email/smtp?clientID",
      templateUrl: "app/CAMPAIGNS/email/smtp/smtp.html",
      controller: 'EmailSmtpCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection,
        resolvedSmtpTemplates: ['$stateParams', 'DataStorage', 'auth', function($stateParams, DataStorage) {
          if (!$stateParams.clientID) 
            return []
            
          return DataStorage.emailAutorespondersApi.listSmtp().query({clientID: $stateParams.clientID}).$promise;
        }]
      }
    })
    
    .state('main.emailevents', {
      url: "email/events?clientID",
      templateUrl: "app/CAMPAIGNS/email/events/events.html",
      controller: 'EmailEventsCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection
      }
    })

    .state('main.mycampaigns', {
      url: "mycampaigns?clientID",
      templateUrl: "app/CAMPAIGNS/campaigns/myCampaigns.html",
      controller: 'MyCampaignsCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection,
        resolveCampaigns: ['$stateParams', 'DataStorage', 'auth', function($stateParams, DataStorage){
          if (!$stateParams.clientID) 
            return []
            
          return DataStorage.anyApiMethod('/campaigns/index/' + $stateParams.clientID).query().$promise;
        }]
      }
    })
    
    .state('main.campaignsetup', {
      url: "campaignsetup?campaignGuid",
      templateUrl: "app/CAMPAIGNS/campaigns/campaignSetup.html",
      controller: 'CampaignSetupCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        resolveCampaign: ['$stateParams', 'DataStorage', 'auth', function($stateParams, DataStorage){
          if ($stateParams.campaignGuid)
            return DataStorage.anyApiMethod('/campaigns/edit/'+$stateParams.campaignGuid).query().$promise;
          else
            return true;
        }]
      }
    })
    
    .state('main.offerimageandterms', {
      url: "offerimageandterms?clientID",
      templateUrl: "app/CAMPAIGNS/offerimageandterms/offerImageAndTerms.html",
      controller: 'OfferImageAndTermsCtrl',
      resolve: {
        auth: authResolve,
        common: commonResolve,
        authSection: authSection
      }
    });

  $urlRouterProvider.otherwise('/login');

  flowFactoryProvider.defaults = {
    target: 'upload.php',
    chunkSize: 220 * 45,
    permanentErrors: [404, 500, 501],
    maxChunkRetries: 1,
    chunkRetryInterval: 5000,
    simultaneousUploads: 1,
    singleFile: true
  };

});

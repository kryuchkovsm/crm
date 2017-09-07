/**
 * Created by user on 16.03.15.
 */
'use strict';

angular.module('DataStorageService', [])
  .factory('DataStorage',
  function($resource, $localStorage, $q, GlobalVars, AuthService) {

    var whiteLabel = {id: ''};
    var BaseUri = GlobalVars.baseUrl + '/api/v1';

    var anyApiMethod = function(action) {
      return $resource(BaseUri + action, {}, {
        query: {
          method:'GET',
          params:{},
          isArray:false,
          ignoreLoadingBar: true,
          headers: {
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        },
        delete: {
          method:'DELETE',
          params:{},
          isArray:false,
          ignoreLoadingBar: true,
          headers: {
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        },
        post: {
          method:'POST',
          headers: {
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var clientsApi = function() {
      return $resource(BaseUri + '/clients/index', {}, {
        query: {
          method:'GET',
          params:{},
          isArray:false,
          headers: {
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var addClientApi = function() {
      return $resource(BaseUri + '/clients/add/', {}, {
        post: {
          method:'POST',
          params:{},
          isArray:false,
          headers: {
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var clientDelete = function() {
      return $resource(BaseUri + '/clients/delete/', {}, {
        post: {
          method:'POST',
          headers: {
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var getClientDetails = function(id) {
      return $resource(BaseUri + '/clients/edit/' + id, {}, {
        query: {
          method:'GET',
          params: {},
          isArray:false,
          headers: {
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var merchantsAnyApi = function(action) {
      return $resource(BaseUri + '/merchants/' + action, {}, {
        query: {
          method:'GET',
          params:{},
          isArray:false,
          headers: {
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        },
        post: {
          method:'POST',
          params:{},
          isArray:false,
          headers: {
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var initStylesApi = function() {
      return $resource(BaseUri + '/common/styles/'+GlobalVars.whiteLabel.CRMGuid, {}, {
        getStyles: {
          method:'GET',
          isArray:false,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var searchApi = function() {
      return $resource(BaseUri + '/search' , {}, {
        post: {
          method:'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var sitesApi = function() {
      return $resource(BaseUri + '/sites/index/:clientID', {}, {
        query: {
          method:'GET',
          params: {},
          isArray:false,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var sitesAnyApi = function(action) {
      return $resource(BaseUri + '/sites/' + action, {}, {
        post: {
          method:'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        },
        query: {
          method:'GET',
          params: {},
          isArray:false,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var productsAnyApi = function(action) {
      return $resource(BaseUri + '/products/' + action, {}, {
        post: {
          method:'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        },
        query: {
          method:'GET',
          params: {},
          isArray:false,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var mdfsAnyApi = function(action) {
      return $resource(BaseUri + '/mdfs/' + action, {}, {
        post: {
          method:'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        },
        query: {
          method:'GET',
          params: {},
          isArray:false,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var reportsAnyApi = function(action) {
      return $resource(BaseUri + '/reports/' + action, {}, {
        post: {
          method:'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        },
        query: {
          method:'GET',
          params: {},
          isArray:false,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var processorAnyApi = function(action) {
      return $resource(BaseUri + '/processors/' + action, {}, {
        post: {
          method:'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        },
        query: {
          method:'GET',
          params: {},
          isArray:false,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var sitesAddNewApi = function() {
      return $resource(BaseUri + '/sites/newsite', {}, {
        post: {
          method:'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var customerApi = function(id) {
      console.log('id', id);
      return $resource(BaseUri + '/customer/' + id, {}, {
        query: {
          method:'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var getCustomerGroups = function(){
      return $resource(BaseUri + '/addlead/groups/:SiteID', {}, {
        query: {
          method:'GET',
          params:{},
          isArray:false,
          headers: {
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var addCustomer = function(){
      return $resource(BaseUri + '/addlead/add', {}, {
        post: {
          method:'POST',
          params:{},
          isArray:false,
          headers: {
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var editCustomerApi = function(id) {
      id = id || '';
      return $resource(BaseUri + '/customer/edit/' + id, {}, {
        query: {
          method:'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        },
        post: {
          method:'POST',
          headers: {
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var customerAddTransactionApi = function() {
      return $resource(BaseUri + '/customer/addtransaction/', {}, {
        post: {
          method:'POST',
          headers: {
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var customerSubmitTransactionApi = function() {
      return $resource(BaseUri + '/addlead/addtransaction/', {}, {
        post: {
          method:'POST',
          headers: {
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var customerRefundApi = function() {
      return $resource(BaseUri + '/customer/refund/', {}, {
        post: {
          method:'POST',
          headers: {
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var customerStatusApi = function() {
      return $resource(BaseUri + '/customer/status/', {}, {
        post: {
          method:'POST',
          headers: {
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var getCustomerRecurring = function(id) {
      id = id || '';
      console.log('id', id);
      return $resource(BaseUri + '/customer/recurring/add/' + id, {}, {
        query: {
          method:'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var addCustomerRecurring = function() {
      return $resource(BaseUri + '/customer/recurring/add/', {}, {
        post: {
          method:'POST',
          headers: {
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var getCustomerEditRecurring = function(id, intervalId) {
      id = id || '';
      console.log('id', id, 'intervalId', intervalId);
      return $resource(BaseUri + '/customer/recurring/edit/' + id + '/' + intervalId, {}, {
        query: {
          method:'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var editCustomerRecurring = function() {
      return $resource(BaseUri + '/customer/recurring/edit/', {}, {
        post: {
          method:'POST',
          headers: {
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var resetAttemptsCustomerRecurring = function() {
      return $resource(BaseUri + '/customer/recurring/resetattempts/', {}, {
        post: {
          method:'POST',
          headers: {
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var runTransactionCustomerRecurring = function() {
      return $resource(BaseUri + '/customer/recurring/runtransaction/', {}, {
        post: {
          method:'POST',
          headers: {
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var customerDeactivateInterval = function() {
      return $resource(BaseUri + '/customer/deactivateinterval/', {}, {
        post: {
          method:'POST',
          headers: {
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var customerAddRemark = function() {
      return $resource(BaseUri + '/customer/addremark/', {}, {
        post: {
          method:'POST',
          headers: {
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var anyQueryUrlsArray = function(urls, postJsons) {
      var promises = [];
      for (var i = 0; i < urls.length; i++) {
        var url = urls[i],
          res = $resource(BaseUri + '/' + url + '/', {}, {
            post: {
              method:'POST',
              headers: {
                'Authorization': 'Bearer ' + AuthService.getTokens().access_token
              }
            }
          });
        promises.push( res.post(postJsons[i]).$promise );
      }
      return $q.all(promises);
    };

    // For Decline Runners
    var declineRunnersGet = function() {
      return $resource(BaseUri + '/declines/index', {}, {
        query: {
          method:'GET',
          params:{},
          isArray:false,
          headers: {
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    // For Decline Runners
    var declineRunnersSearch = function() {
      return $resource(BaseUri + '/declines/search', {}, {
        post: {
          method:'POST',
          params:{},
          isArray:false,
          headers: {
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var declineRunnersSave = function() {
      return $resource(BaseUri + '/declines/savedeclines', {}, {
        post: {
          method:'POST',
          params:{},
          isArray:false,
          headers: {
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var declineRunnersClear = function() {
      return $resource(BaseUri + '/declines/clearcomplete', {}, {
        post: {
          method:'POST',
          params:{},
          isArray:false,
          headers: {
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var exportDataFetchContent = function() {
        return $resource(BaseUri + '/export/content', {}, {
          query: {
              method:'GET',
                params:{},
              isArray:false,
                headers: {
                  'Authorization': 'Bearer ' + AuthService.getTokens().access_token
                }
            },
          post: {
            method:'POST',
            params:{},
            isArray:false,
            headers: {
              'Authorization': 'Bearer ' + AuthService.getTokens().access_token,
              'Dates-Output-Format': 'MM/dd/yyyy'
            }
          }
        });
    };

    var exportDataToEmail = function() {
        return $resource(BaseUri + '/export/email', {}, {
          post: {
            method:'POST',
            params:{},
            isArray:false,
            headers: {
              'Authorization': 'Bearer ' + AuthService.getTokens().access_token
            }
          }
        });
    };

    var exportDataByGuid = function() {
        return $resource(BaseUri + '/export/storedreport/:guid', {}, {
          query: {
              method:'GET',
                params:{},
                isArray:false,
                headers: {
                  'Authorization': 'Bearer ' + AuthService.getTokens().access_token
                }
            }
        });
    };

    var declineRunnersScheduledJobs = function() {
      return $resource(BaseUri + '/declines/scheduled', {}, {
        query: {
          method:'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var declineRunnersLoadTransactionsByJobID = function() {
      return $resource(BaseUri + '/declines/details/:jobId', {}, {
        query: {
          method:'GET',
          params: {},
          isArray:false,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    //Export
      var exportDataFetch = function() {
        return $resource(BaseUri + '/export/index', {}, {
          query: {
              method:'GET',
                params:{},
              isArray:false,
                headers: {
                  'Authorization': 'Bearer ' + AuthService.getTokens().access_token
                }
            }
        });
    };

    var importLeads = function() {
      return $resource(BaseUri + '/addlead/importleads', {}, {
        post: {
          method:'POST',
          params:{},
          isArray:false,
          headers: {
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var configCenterApi = function(){
      return $resource(BaseUri + '/configcenter/index', {}, {
        query: {
          method:'GET',
          params:{},
          isArray:false,
          headers: {
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        },
        post: {
          method:'POST',
          params:{},
          isArray:false,
          headers: {
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var configCenterUpdateClientApi = function(){
      return $resource(BaseUri + '/configcenter/client/update', {}, {
        post: {
          method:'POST',
          params:{},
          isArray:false,
          headers: {
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    var getMethods = function(){
      return {
        query:{
          query: {
            method:'GET',
            params:{},
            isArray:false,
            headers: {
              'Authorization': 'Bearer ' + AuthService.getTokens().access_token
            }
          }
        },
        post: {
          post: {
            method:'POST',
            params:{},
            isArray:false,
            headers: {
              'Authorization': 'Bearer ' + AuthService.getTokens().access_token
            }
          }
        }
      }
    };

    var emailAutorespondersApi = {
      listSmtp: function(){
        return $resource(BaseUri + '/emailautoresponders/smtpservers/:clientID', {}, getMethods().query);
      },
      addSmtp: function(){
        return $resource(BaseUri + '/emailautoresponders/smtpservers/add', {}, getMethods().post);
      },
      editSmtp: function(){
        return $resource(BaseUri + '/emailautoresponders/smtpservers/edit', {}, getMethods().post);
      },
      getSmtpById: function(){
        return $resource(BaseUri + '/emailautoresponders/smtpservers/edit/:smtpId', {}, getMethods().query);
      },
      deleteSmtp: function(smtpId){
        return $resource(BaseUri + '/emailautoresponders/smtpservers/delete/'+smtpId, {}, getMethods().post);
      },
      authSmtp: function(){
        return $resource(BaseUri + '/emailautoresponders/smtpservers/check', {}, getMethods().post);
      },

      listTemplates: function(){
        return $resource(BaseUri + '/emailautoresponders/templates/:clientID', {}, getMethods().query);
      },
      getTemplateById: function(templateId){
        return $resource(BaseUri + '/emailautoresponders/templates/edit/' + templateId, {}, getMethods().query);
      },
      deleteTemplate: function(templateId){
        return $resource(BaseUri + '/emailautoresponders/templates/delete/' + templateId, {}, getMethods().post);
      },
      addTemplate: function(){
        return $resource(BaseUri + '/emailautoresponders/templates/add', {}, getMethods().post);
      },
      editTemplate: function(){
        return $resource(BaseUri + '/emailautoresponders/templates/edit', {}, getMethods().post);
      },

      listEvents: function(){
        return $resource(BaseUri + '/emailautoresponders/events/:clientID', {}, getMethods().query);
      },
      addEvent: function(){
        return $resource(BaseUri + '/emailautoresponders/events/add', {}, getMethods().post);
      },
      editEvent: function(){
        return $resource(BaseUri + '/emailautoresponders/events/edit', {}, getMethods().post);
      },
      deleteEvent: function(eventId){
        return $resource(BaseUri + '/emailautoresponders/events/delete/'+eventId, {}, getMethods().post);
      },
      getEventById: function(eventId){
        return $resource(BaseUri + '/emailautoresponders/events/edit/' + eventId, {}, getMethods().query);
      }
    };

    var userApi = {
      update: function(){
        return $resource(BaseUri + '/users/edit', {}, getMethods().post);
      },
      getByClientIds: function(){
        return $resource(BaseUri + '/users/byclients', {}, getMethods().post);
      },
      create: function(){
        return $resource(BaseUri + '/users/add', {}, getMethods().post);
      },
      get: function(){
        return $resource(BaseUri + '/users/edit/:userId', {}, getMethods().query);
      },
      delete: function(){
        return $resource(BaseUri + '/users/delete', {}, getMethods().post);
      }
    };

    var offerImageAndTerms = {
      add: function(){
        return $resource(BaseUri + '/offerimageterms/add', {}, getMethods().post);
      },
      edit: function(){
        return $resource(BaseUri + '/offerimageterms/edit', {}, getMethods().post);
      }
    };

    var chargeBackSystemApi = function(action) {
      return $resource(BaseUri + '/chargeback/' + action, {}, {
        post: {
          method:'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        },
        query: {
          method:'GET',
          params: {},
          isArray:false,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + AuthService.getTokens().access_token
          }
        }
      });
    };

    // Return directly only functions and constants (whiteLabel), 
    // other things through function(){return {val: someobject};}
    return {
      anyApiMethod: anyApiMethod,
      whiteLabel: whiteLabel,
      merchantsAnyApi: merchantsAnyApi,
      clientsApi: clientsApi,
      clientDelete: clientDelete,
      addClientApi: addClientApi,
      getClientDetails: getClientDetails,
      sitesApi: sitesApi,
      sitesAnyApi: sitesAnyApi,
      initStylesApi: initStylesApi,
      searchApi: searchApi,
      sitesAddNewApi: sitesAddNewApi,
      customerApi: customerApi,
      editCustomerApi: editCustomerApi,
      customerAddTransactionApi: customerAddTransactionApi,
      customerRefundApi: customerRefundApi,
      customerStatusApi: customerStatusApi,
      getCustomerRecurring: getCustomerRecurring,
      addCustomerRecurring: addCustomerRecurring,
      getCustomerEditRecurring: getCustomerEditRecurring,
      editCustomerRecurring: editCustomerRecurring,
      customerDeactivateInterval: customerDeactivateInterval,
      customerAddRemark: customerAddRemark,
      productsAnyApi: productsAnyApi,
      processorAnyApi: processorAnyApi,
      mdfsAnyApi: mdfsAnyApi,
      reportsAnyApi: reportsAnyApi,
      declineRunnersGet: declineRunnersGet,
      declineRunnersSearch: declineRunnersSearch,
      declineRunnersSave: declineRunnersSave,
      declineRunnersClear: declineRunnersClear,
      exportDataFetchContent: exportDataFetchContent,
      declineRunnersScheduledJobs: declineRunnersScheduledJobs,
      declineRunnersLoadTransactionsByJobID: declineRunnersLoadTransactionsByJobID,
      exportDataFetch: exportDataFetch,
      importLeads: importLeads,
      getCustomerGroups: getCustomerGroups,
      addCustomer: addCustomer,
      customerSubmitTransactionApi: customerSubmitTransactionApi,
      exportDataByGuid: exportDataByGuid,
      exportDataToEmail: exportDataToEmail,
      emailAutorespondersApi: emailAutorespondersApi,
      configCenterApi: configCenterApi,
      configCenterUpdateClientApi: configCenterUpdateClientApi,
      userApi: userApi,
      offerImageAndTerms: offerImageAndTerms,
      runTransactionCustomerRecurring: runTransactionCustomerRecurring,
      resetAttemptsCustomerRecurring: resetAttemptsCustomerRecurring,
      chargeBackSystemApi: chargeBackSystemApi
    };
  });

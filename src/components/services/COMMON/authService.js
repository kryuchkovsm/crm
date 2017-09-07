'use strict';

angular.module('AuthApiService', ['ngResource'])
  .factory('AuthService', ['$resource', '$state', 'Events', 'GlobalVars', 'Notification', '$q', '$cookies', '$interval',
    function($resource, $state, Events, GlobalVars, Notification, $q, $cookies, $timeout){

      var authTokens = {};
      var promiseTimeout;
      var resObj  = {};
      var loggedIn = false;

      function IsJsonString(str) {
        try {
          JSON.parse(str);
        } catch (e) {
          return false;
        }
        return true;
      }

      var parseCookies = function(obj){
        return IsJsonString(obj) ? JSON.parse(obj) : obj;
      }

      var tokenMethods = $resource(GlobalVars.baseUrl  +'/auth/token', {}, {
        post: { method:'POST'}
      });

      resObj.restorePassword = function(){
        return $resource(GlobalVars.baseUrl + '/api/v1/login/forgot', {}, {
          post: {
            method:'POST'
          }
        });
      };

      resObj.newPassword = function(){
        return $resource(GlobalVars.baseUrl + '/api/v1/login/newpassword', {}, {
          post: {
            method:'POST'
          }
        });
      };

      resObj.confirmRestorePass = function(key){
        return $resource(GlobalVars.baseUrl + '/api/v1/login/confirm/'+key, {}, {
          check: {
            method:'POST'
          }
        });
      };

      var setTokens = function(obj){
        authTokens = obj;
        if (!authTokens.expirationDate){
          var t = new Date();
          t.setMilliseconds(authTokens.expires_in*1000);
          authTokens.expirationDate = t;
        }
        loggedIn = true;
        $cookies['authTokens']= JSON.stringify(authTokens)

        var ms = (new Date(authTokens.expirationDate)).getTime() - (new Date()).getTime();
        if (ms > 0){
          if (promiseTimeout)
            $timeout.cancel(promiseTimeout);

          promiseTimeout = $timeout(function(){
            resObj.refreshTokens()
          }, ms * 0.9);
        }
      };

      var cleanTokens = function(withReload){
        authTokens = {};
        loggedIn = false;
        delete $cookies['authTokens']
        $state.go('main.login', { withReload: withReload }, {})
      };

      resObj.refreshTokens = function(){
        var deffered = $q.defer()
        if (!authTokens.refresh_token){
          deffered.reject()
        }else{
          var queryString = 'grant_type=refresh_token&refresh_token=' + authTokens.refresh_token;
          var req = tokenMethods.post(queryString).$promise;
          req.then(function(resp){
            if (resp.access_token) {
              setTokens(resp);
              deffered.resolve();
            } else {
              cleanTokens(true)
              deffered.reject()
            }
          }, function(resp){
            cleanTokens(true)
            deffered.reject()
          });
        }

        return deffered.promise;
      };

      resObj.login = function(userInfo){
        var deffered = $q.defer()
        var queryString = 'grant_type=password&username=' + userInfo.username + '&password=' + userInfo.password+'&crmguid='+window.CRMGuid;
        var req = tokenMethods.post(queryString).$promise;
        req.then(function(resp){
            if (resp && !resp.Status){
              setTokens(resp);
              deffered.resolve();
            }else
              deffered.reject(resp)
          }, function(resp){
            Notification.error({message: 'Something went wrong', delay: 5000})
            cleanTokens();
            deffered.reject(resp)
          });
        return deffered.promise;
      };

      resObj.logout = function(withReload){
        GlobalVars.clean();
        cleanTokens(withReload);
      };

      resObj.loggedIn = function(){
        return loggedIn
      };

      resObj.getTokens = function(){
        return authTokens;
      };

      resObj.parseCookiesSetTokens = function(){
        var parsedCookies = parseCookies($cookies['authTokens']);
        if (parsedCookies) 
          setTokens(parsedCookies)
      };

      resObj.resolveAuth = function(){
        var deffered = $q.defer();

        if (!authTokens.access_token){
          deffered.reject();
          return deffered.promise;
        }

        if (new Date(authTokens.expirationDate) < new Date()){
          resObj.refreshTokens().then(
            function() {
              deffered.resolve();
            }, 
            function() {
              deffered.reject();
            }
          );
          return deffered.promise;
        }

        deffered.resolve();
        return deffered.promise;
      };

      resObj.resolveCommon = function(){
        var deffered = $q.defer()
        var req = $resource(GlobalVars.baseUrl + '/api/v1/common/index', {}, {
          query: {
            method:'GET',
            params:{},
            isArray:false,
            ignoreLoadingBar: true,
            headers: {
              'Authorization': 'Bearer ' + authTokens.access_token
            }
          }
        });

        req.query(function(resp){
          if (resp.Data){
            GlobalVars.setCommonObject(resp.Data)
            deffered.resolve(resp.Data);
          }
          else 
            deffered.reject();
        });

        return deffered.promise;
      };

      return resObj
    }]);



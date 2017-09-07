angular.module('crm').config(function ($httpProvider, cfpLoadingBarProvider, stConfig, $translateProvider) {
  
  var headHTML = document.getElementsByTagName('head')[0].innerHTML;
  headHTML    += '<link type="text/css" id="crm-style" rel="stylesheet" href="'+window.BaseURI+'/api/v1/common/styles/css/'+window.CRMGuid+'">';
  document.getElementsByTagName('head')[0].innerHTML = headHTML;

  cfpLoadingBarProvider.includeSpinner = false;
  stConfig.pagination.template = 'customTablePagination.html';

  $translateProvider.useLoaderCache(true);

  $translateProvider.useStaticFilesLoader({
    prefix: '/vendors/i18n/',
    suffix: '.json'
  });

  $translateProvider.useSanitizeValueStrategy(null);
  $translateProvider.determinePreferredLanguage(function () {
    if (window.PreferredLanguage)
      return window.PreferredLanguage;

  	return 'en';
  });

  $httpProvider.interceptors.push('APIInterceptor');
});


angular.module('crm').factory('APIInterceptor', ['$q', '$injector', function($q, $injector) {

  var notification, authApiService, sendUpdateAuth, modalService, $state, DataStorage;
  var getState = function(){
    if (!$state) $state = $injector.get('$state');
    return $state
  };
  var getNotification = function() {
    if (!notification) notification = $injector.get('Notification');
    return notification;
  };
  var getAuthApiService = function() {
    if (!authApiService) authApiService = $injector.get('AuthService');
    return authApiService;
  };
  var getModalService = function(){
    if (!modalService) modalService = $injector.get('ModalService');
    return modalService;
  }
  var getDataStorage = function(){
    if (!DataStorage) DataStorage = $injector.get('DataStorage');
    return DataStorage;
  }
  var submitError = function(response){
    //f (response.data)
    //  submitError(response.status + ' ' + response.data.ExceptionType, null, response.config.method, response.config.url)
    //else
    //  submitError(response.status + ' ' + response.statusText, null, response.config.method, response.config.url)
    
    var jsonResponse = JSON.stringify(response)
    var dataStorage = getDataStorage();
    var deferred = $q.defer();
    
    var promise = dataStorage.anyApiMethod('/common/submit-frontend-error').post({
      //StateName: statename,
      ErrorMessage: jsonResponse,
      //Method: method,
      //Url: url
    }).$promise;
    
    promise.then(function(resp) {
      deferred.resolve(response);
    }, function(resp) {
      deferred.reject(response);
    });

    return deferred.promise;
  }
  
  var exeptUrls = [
    '/emailautoresponders/smtpservers/check', 
    '/auth/token', 
    '/users/isexist/email', 
    '/users/isexist/username', 
    '/addlead/groups/'];

  return {
    requestError: function(response) {
      var promise = submitError(response);
      return promise;
    },

    responseError: function(response) {
      var promise = submitError(response);
      return promise;
    },
    
    response: function(resp) {
      var f;
      if (resp.config && resp.config.url)
        _.each(exeptUrls, function (url) {
          if (resp.config.url.indexOf(url) > -1) 
            f = true
        });

      if (f) 
        return resp;

      if (!resp || !resp.data || !resp.data.Status)
        return resp;

      var textMap = '';
      if (resp.data.ErrorMessage == 'Unauthorized'){
        var authTokens = getAuthApiService().getTokens();
        if (!authTokens.access_token){
          getState().go('main.login');
          return resp;
        } else {

          var deferred = $q.defer();
          getAuthApiService().refreshTokens().then(function() {
            resp.config.authStatus = "refresh_token_complete";
            deferred.reject(resp);
          }, function() {
            getAuthApiService().logout();
            deferred.reject(resp);
          });
          return deferred.promise;

        }
      }else{
        if( Object.prototype.toString.call(resp.data.ErrorMessage) === '[object Array]' )
          _.each(resp.data.ErrorMessage, function(err, n){
            textMap += '<p>'+err+'</p>'
            if (n!=resp.data.ErrorMessage.length-1) textMap+='<br/>'
          })
        else
          textMap = resp.data.ErrorMessage

        if (resp.data && resp.data.Status == 1){ // VALIDATION ERROR
          var buttonTxt = 'CANCEL', showButtonIcon = true;
          if (resp.config.method == "GET" && resp.config.url.split('customer/').length>1 && resp.config.url.split('customer/')[1].split('/').length==1){
            buttonTxt = 'OK'
            showButtonIcon = false
          }
          getModalService().showModal({
            templateUrl: "components/modals/COMMON/errorPopup.html",
            controller: "DataModalCtrl",
            inputs: {
              data: {
                buttonTxt: buttonTxt,
                showButtonIcon: showButtonIcon,
                modalTxt: textMap
              }
            }
          }).then(function (modal) {
            modal.element.modal({
              backdrop: 'static',
              keyboard: false
            });
            modal.close.then(function (result) {
              if (resp.config.method == "GET" && 
                  resp.config.url.split('customer/').length>1 && 
                  resp.config.url.split('customer/')[1].split('/').length==1)
                getState().go('main.search');

              if (resp.config.method == "POST" && 
                  resp.config.url.split('confirm/').length>1 && 
                  resp.config.url.split('confirm/')[1].split('/').length==1)
                getState().go('main.login');
            })
          });
        }

        if (resp.data && resp.data.Status == 2) // API ERROR
          getNotification().error({message: textMap, delay: 5000});
      }
      return resp
    }
  }
}])

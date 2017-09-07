angular.module('crm').run(function($rootScope, $location, $state,
	AuthService, DataProcessing, $document, $window, $filter, GlobalVars, DataStorage) {

  AuthService.parseCookiesSetTokens();

  $rootScope.dateFromServer = DataProcessing.dateFromServer
  $rootScope.toDateFormat = DataProcessing.toDateFormat
  $rootScope.goToTableTop = function(tableId){
    var someElement = angular.element(tableId);
    if (someElement && someElement.length)
      $document.scrollToElementAnimated(someElement);
  };

  $rootScope.urlPattern = /^((?:http|ftp)s?:\/\/)(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d+)?(?:\/?|[\/?]\S+)$/i

  $rootScope.translate = function(word,obj){
    var res = $filter('translate')(word)
    if (obj)
      res = $filter('translate')(word, obj)
    return res
  };
  
  $rootScope.t = $rootScope.translate;
  
  $rootScope.windowInner = {
    height: $window.innerHeight
  };

  angular.element($window).bind("resize",function(e){
    $rootScope.windowInner.height = $window.innerHeight
    $rootScope.$apply()
  });
  
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error){
    //Retry the state go in case the previous failed due to expired token
    if (error.config && error.config.authStatus == "refresh_token_complete" && 
        error.data && error.data.ErrorMessage == "Unauthorized"){
      event.preventDefault();
      $state.go(toState.name);
      return;
    }

    DataStorage.anyApiMethod('/common/submit-frontend-error').post({
      StateName: toState.name,
      ErrorMessage: error
    },function (response) {  })
  })
  
  $rootScope.$on('$stateChangeStart', function (event, toState) {
    var commonObject = GlobalVars.commonObject();
    if (!commonObject)
      return;

    if (commonObject.ForceLogout){
      event.preventDefault();
      AuthService.logout(true);
    }
  });
});
